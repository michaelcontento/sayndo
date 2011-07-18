/*
 * TODO
 *
 * - Support requests for files that are not in the given paths,
 *   e.g. socket-io/socket-io.js.
 *
 * - Support websocket requests.
 *
 * - pack static files to one
 *
 * TODO
 */

/*
 * Dependencies
 */
require('./redis.js').init();

var http = require('http')
  , log = require('./log.js')
  , file = require('./file.js')
  , view = require('./view.js')
  , cache = require('./cache.js')
  , route = require('./route.js')
  , session = require('./session.js')
  , config = require('../../lib/config.js');

/*
 * Server module. A request controller for node http server.
 */
var server = {
    /*
     * Create the http server object.
     */
    node: function(app) {
        var fileExt = file.ext
          , server = http.Server()
          , fileTypes = config.fileTypes
          , publicPath = config.publicPath
          , defaultAuthType = config.defaultAuthType;

        // Listen on requests.
        server.on('request', function (req, res) {
            var reqFile = fileTypes[fileExt(req.url)];

            // Send cached static files as fast as possible.
            if(typeof reqFile !== 'undefined') {
                res.writeHead(200, reqFile.header);
                return res.end(file.cache[req.url], reqFile.encoding);
            }

            // Get the current session and authType to render requested view.
            session.get(req.headers.cookie, function(properties, authType) {
                req.session = properties;

                // Init view rendering with reqest and response.
                res.render = function(viewPath, data) {
                    view.render(req, res, viewPath, data);
                };

                // Init session support.
                res.createSession = function(properties, minutes, cb) {
                    session.create(res, properties, minutes, cb);
                };

                res.destroySession = function() {
                    session.destroy(res, properties.id);
                };

                var requestedView = app[authType][req.method][req.url]
                  , defaultView = app[defaultAuthType][req.method][req.url];

                // Render requested view if it exists.
                if(typeof requestedView === 'function') {
                    return requestedView(req, res);
                }

                // Render default view if it exists.
                if(typeof defaultView === 'function') {
                    return defaultView(req, res);
                }

                // Render the error view if no other view match.
                app[defaultAuthType].GET.errors(req, res);
            });
        });

        // Port binding.
        server.listen(app.port, app.host, function() {
            log.success('Start http server on ' +
                app.host + ':' +
                app.port + '.'
            );
        });

        return server;
    },

    /*
     * Initialize the server module. Create route function structure.
     * Cache all necessary files. Create the http server object.
     */
    init: function() {
        var app = route.structure(config.authTypes, config.requestMethods)

        // Get command line arguments or default settings.
        if(typeof process.argv[2] !== 'undefined') {
            app.host = process.argv[2];
            app.port = process.argv[3];
        } else {
            app.host = '127.0.0.1';
            app.port = 3000;
        }

        // Start master or slave node on given port.
        app.node = this.node(app);

        // Initialize the default error route.
        app[config.defaultAuthType].GET.errors = view.errors;

        // Cache all static files.
        cache.all();

        return app;
    }
};

module.exports = server.init();
