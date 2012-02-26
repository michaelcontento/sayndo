/*
 * Dependencies
 */
var url = require('url')
  , http = require('http')
  , log = require('logerize')
  , qs = require('querystring')
  , CallbackQueue = require('callbackQueue')

  , file = require('./file.js')
  , view = require('./view.js')
  , redis = require('./redis.js').init()
  , cache = require('./cache.js').init()
  , route = require('./route.js')
  , cookie = require('./cookie.js')
  , session = require('./session.js')
  , config = require('../config/config.js');

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
        var url = req.url.pathname
          , reqFile = config.fileTypes[file.ext(url)];

        // Send cached static files as fast as possible.
        if(typeof reqFile !== 'undefined') {
            res.writeHead(200, reqFile.header);
            return res.end(file.cache[url], reqFile.encoding);
        }

        var modules = ['session', 'cookie', 'view'];
        var callbackQueue = CallbackQueue(modules, function() {
            // Render requested view if it exists.
            var requestedView = app[res.session.authType][req.method][url];
            if(typeof requestedView === 'function') return requestedView(req, res);

            // Render default view if it exists.
            var defaultView = app[config.defaultAuthType][req.method][url];
            if(typeof defaultView === 'function') return defaultView(req, res);

            // Render the error view if no other view match.
            app[config.defaultAuthType].GET.errors(req, res);
        });

        session.init(req, res, function() {
            callbackQueue.register('session');
        });

        cookie.init(req, res, function() {
            callbackQueue.register('cookie');

        });

        view.init(req, res, function() {
            callbackQueue.register('view');
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
        var httpServer = http.Server();

        // Listen on requests.
        httpServer.on('request', function (req, res) {
            req.url = url.parse(req.url, true);

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
