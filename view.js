/*
 * Depenedencies
 */
var config = require('./config.js')
  , appLocals = require('./app_locals.js');

/*
 * View module.
 */
var view = {
    /*
     * Cache all views to memory. See ./cache.js.
     */
    cache: {},

    /*
     * Just the default content type of all views.
     */
    contentType: {
        'Content-Type': 'text/html'
    },

    /*
     * The default error page of each request that could not be
     * matched correctly to its target. Essential fallback view
     * to prevent app crashes.
     *
     * @param req, object of node´s http request.
     * @param res, object of node´s http response.
     */
    errors: function(req, res) {
        res.writeHead(404, view.contentType);
        res.end('Not found');
    },

    /*
     * Combine app locals and custom view locals.
     *
     * @param req, object of node´s http request.
     * @param res, object of node´s http response.
     * @param locals, object of locals to parse into views.
     * @param cb, function to execute.
     */
    combineLocals: function(req, res, locals, cb) {
        var keys = Object.keys(appLocals)
          , i = 0
          , ii = keys.length;

        for(i; i < ii; i++) {
            locals[keys[i]] = appLocals[keys[i]](req, res);
        }

        cb(locals);
    },

    /*
     * Parse locals into view html. Replace server data with view
     * placeholder.
     *
     * @param cachedView, string of a cached html view.
     * @param combinedLocals, object of merged app locals and view locals.
     * @param cb, function to execute.
     */
    parseLocals: function(cachedView, combinedLocals, cb) {
        var locals = cachedView.match(/#\{.*?\}/g);

        if(locals) {
            var i = 0
              , ii = locals.length;

            for(i; i < ii; i++) {
                var local = locals[i].replace(/#\{|\}/g, '');

                if(typeof combinedLocals[local] === 'string') {
                    cachedView = cachedView.replace('#{' + local + '}', combinedLocals[local]);
                }
            }
        }

        cb(cachedView);
    },

    /*
     * The view rendering function. Callable in each route of the app.
     * Is part of the response object. Parse loacls into the view and
     * send it.
     *
     * @param req, object of node´s http request.
     * @param res, object of node´s http response.
     * @param viewPath, string of the requested view path.
     * @param locals, object of locals to parse into a view.
     */
    render: function(req, res, viewPath, locals) {
        if(typeof locals !== 'object') locals = {};
        if(locals.layout === false) locals.layout = '';
        else if(typeof locals.layout !== 'string') locals.layout = 'default';

        view.combineLocals(req, res, locals, function(combinedLocals) {
            var cachedView = view.cache[locals.layout + viewPath];

            view.parseLocals(cachedView, combinedLocals, function(html) {
                res.writeHead(200, view.contentType);
                res.end(html);
            });
        });
    }
};

module.exports = view;

