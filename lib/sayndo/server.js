/*
 * Dependencies
 */
var http = require('http')
  , log = require('logerize')
  , qs = require('querystring')

  , file = require('./file.js')
  , view = require('./view.js')
  , redis = require('./redis.js').init()
  , cache = require('./cache.js').init()
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
var server = {
   /*
    * Handle the request of the http server instance.
    *
    * @param app, object containing all application routes.
    * @param req, object of a server request.
    * @param res, object of a server response.
    */
   requestHandler: function serverRequestHandler(app, req, res) {
        var reqFile = fileTypes[fileExt(req.url)];

        // Send cached static files as fast as possible.
        if(typeof reqFile !== 'undefined') {
            res.writeHead(200, reqFile.header);
            return res.end(file.cache[req.url], reqFile.encoding);
        }

        var reqCookies = req.headers.cookie;

        // Get the current session and authType to render requested view.
        session.readByCookie(reqCookies, function(err, properties, authType) {
            /*
             * Init session support.
             */
            res.session = properties;

            res.session.write = function(properties, minutes, cb) {
                properties.ip = req.connection.remoteAddress;

                session.write(res, properties, minutes, cb);
            };

            res.session.update = function(properties, cb) {
                session.update(res.session.id, properties, cb);
            }

            res.session.remove = function(cb) {
                session.remove(res.session.id, cb);
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
            };

            /*
             * Init sending of plain data.
             */
            res.send = function(data) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(data);
            };

            /*
             * Init view rendering with reqest and response.
             */
            res.render = function(viewPath, data) {
                view.render(req, res, viewPath, data);
            };

            // Render requested view if it exists.
            var requestedView = app[authType][req.method][req.url];
            if(typeof requestedView === 'function') return requestedView(req, res);

            // Render default view if it exists.
            var defaultView = app[defaultAuthType][req.method][req.url];
            if(typeof defaultView === 'function') return defaultView(req, res);

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
    getRequestBody: function serverGetRequestBody(app, req, res) {
        var data = '';

        req.on('data', function(chunk) {
            data += chunk;
        });

        req.on('end', function() {
            req.body = qs.parse(data);

            server.requestHandler(app, req, res);
        });
    },

    /*
     * Create the http server object.
     *
     * @param app, object containing all application routes.
     *
     * @return object, of an http server instance.
     */
    node: function serverNode(app) {
        // Listen on requests.
        httpServer.on('request', function (req, res) {
            if(req.method === 'POST') server.getRequestBody(app, req, res);
            else server.requestHandler(app, req, res);
        });

        httpServer.on('clientError', function(exeption) {
            log.error('Got client error: ');
            console.log(exeption);
        });

        httpServer.on('close', function(errno) {
            if(errno) log.info('Close http server with ERRNO: ' + errno);
            else log.info('Close http server');
        });

        // Port binding.
        httpServer.listen(app.port, app.host, function() {
            log.success('Start http server on ' + app.host + ':' + app.port);
        });

        return httpServer;
    },

    /*
     * Set the config for the http server.
     *
     * @param app, object containing all application routes.
     */
    setAppNodeConfig: function serverSetAppNodeConfig(app) {
        var args = process.argv.slice(-2);

        // Get command line arguments or default settings.
        if(isNaN(args[1])) {
            app.host = '127.0.0.1';
            app.port = '3000';
        } else {
            app.host = args[0];
            app.port = args[1];
        }
    },

    /*
     * Initialize the server module. Create route function structure.
     * Cache all necessary files. Create the http server object.
     *
     * @return object, containing routes, server node and log functions.
     */
    init: function serverInit() {
        var app = route.structure(config.authTypes, config.requestMethods);

        // Set the server node config.
        this.setAppNodeConfig(app);

        app.log = log;
        app.node = this.node(app);
        app[config.defaultAuthType].GET.errors = view.errors;

        // Flush redis to start with a fresh db.
        redis.flushAll();

        return app;
    }
};

module.exports = server.init();
