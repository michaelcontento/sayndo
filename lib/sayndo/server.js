/*
 * Dependencies
 */
require('./redis.js').init();

var http = require('http')
  , log = require('./log.js')
  , file = require('./file.js')
  , view = require('./view.js')
  , qs = require('querystring')
  , cache = require('./cache.js')
  , route = require('./route.js')
  , cookie = require('./cookie.js')
  , session = require('./session.js')
  , config = require('../../lib/config/config.js');

var fileExt = file.ext
  , httpServer = http.Server()
  , fileTypes = config.fileTypes
  , publicPath = config.publicPath
  , defaultAuthType = config.defaultAuthType;

/*
 * Server module. A request controller for node http server.
 */
var serverModule = {
   /*
    * Handle the request of the http server instance.
    *
    * @param app, object containing all application routes.
    * @param req, object of a server request.
    * @param res, object of a server response.
    */
   requestHandler: function (app, req, res) {
        var reqFile = fileTypes[fileExt(req.url)];

        // Send cached static files as fast as possible.
        if(typeof reqFile !== 'undefined') {
            res.writeHead(200, reqFile.header);
            return res.end(file.cache[req.url], reqFile.encoding);
        }

        var reqCookies = req.headers.cookie;

        // Get the current session and authType to render requested view.
        session.read(reqCookies, function(properties, authType) {
            /*
             * Init session support.
             */
            res.session = properties;

            res.session.write = function(properties, minutes, cb) {
                session.write(res, properties, minutes, cb);
            };

            res.session.update = function(properties) {
                session.update(res, properties);
            }

            res.session.remove = function() {
                session.remove(res);
            };

            /*
             * Init cookie support.
             */
            res.cookie = {};

            res.cookie.read = function(key, cb) {
                cookie.read(reqCookies, key, cb);
            };

            res.cookie.write = function(key, value, properties, minutes) {
                cookie.write(res, key, value, properties, minutes);
            };

            res.cookie.remove = function(key) {
                cookie.remove(reqCookies, res, key);
            };

            /*
             * Init redirect support.
             */
            res.redirect = function(url) {
                res.writeHead(301, {'Location': url});
                res.end();
            }

            /*
             * Init view rendering with reqest and response.
             */
            res.render = function(viewPath, data) {
                view.render(req, res, viewPath, data);
            };

            // Render requested view if it exists.
            var requestedView = app[authType][req.method][req.url];

            if(typeof requestedView === 'function') {
                return requestedView(req, res);
            }

            // Render default view if it exists.
            var defaultView = app[defaultAuthType][req.method][req.url];

            if(typeof defaultView === 'function') {
                return defaultView(req, res);
            }

            // Render the error view if no other view match.
            app[defaultAuthType].GET.errors(req, res);
        });
    },

    /*
     * Parse the form data of an http POST request.
     *
     * @param app, object containing all application routes.
     * @param req, object of a server request.
     * @param res, object of a server response.
     */
    getRequestBody: function(app, req, res) {
        var data = '';

        req.on('data', function(chunk) {
            data += chunk;
        });

        req.on('end', function() {
            req.body = qs.parse(data);

            serverModule.requestHandler(app, req, res);
        });
    },

    /*
     * Create the http server object.
     *
     * @param app, object containing all application routes.
     *
     * @return object, of an http server instance.
     */
    node: function(app) {
        // Listen on requests.
        httpServer.on('request', function (req, res) {
            if(req.method === 'POST') {
                serverModule.getRequestBody(app, req, res);
            } else {
                serverModule.requestHandler(app, req, res);
            }
        });

        // Port binding.
        httpServer.listen(app.port, app.host, function() {
            log.success('Start http server on ' + app.host + ':' + app.port);
        });

        return httpServer;
    },

    /*
     * Initialize the server module. Create route function structure.
     * Cache all necessary files. Create the http server object.
     *
     * @return object, containing routes, server node and log functions.
     */
    init: function() {
        var app = route.structure(config.authTypes, config.requestMethods)
          , args = process.argv.slice(-2);

        // Get command line arguments or default settings.
        if(isNaN(args[1])) {
            app.host = '127.0.0.1';
            app.port = '3000';
        } else {
            app.host = args[0];
            app.port = args[1];
        }

        app.node = this.node(app);
        app.log = log;
        app[config.defaultAuthType].GET.errors = view.errors;

        // Cache all static files, views and dependencies.
        cache.init();

        return app;
    }
};

module.exports = serverModule.init();
