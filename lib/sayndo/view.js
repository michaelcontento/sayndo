/*
 * Depenedencies
 */
var config = require('../../lib/config.js')
  , appLocals = require('../../lib/app_locals.js')
  , beforeRender = require('../../lib/before_render.js')
  , afterRender = require('../../lib/after_render.js');

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
    contentType: {'Content-Type': 'text/html'},

    /*
     * The default error page of each request that could not be
     * matched correctly to its target. Essential fallback view
     * to prevent app crashes.
     */
    errors: function(req, res) {
        res.writeHead(404, view.contentType);
        res.end('Not found');
    },

    /*
     * Combine app locals and custom view locals.
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
     *
     */
    beforeRender: function(req, res, cb) {
        // Get all methods and call them before view rendering.
        var keys = Object.keys(beforeRender)
          , i = 0
          , ii = keys.length;

        for(i; i < ii; i++) {
            beforeRender[keys[i]](req, res);
        }

        cb();
    },

    /*
     * The view rendering function. Callable in each route of the app.
     * Is part of the response object. Parse loacls into the view and
     * send it.
     */
    render: function(req, res, viewPath, locals) {
        if(typeof locals !== 'object') {
            locals = {};
        }

        view.beforeRender(req, res, function() {
            //
            view.combineLocals(req, res, locals, function(combinedLocals) {
                //
                view.parseLocals(view.cache[viewPath], combinedLocals, function(html) {
                    res.writeHead(200, view.contentType);
                    res.end(html);

                    //
                    view.afterRender(req, res);
                });
            });
        });
    },

    /*
     *
     */
    afterRender: function(req, res) {
        // Get all methods and call them after view rendering.
        var keys = Object.keys(afterRender)
          , i = 0
          , ii = keys.length;

        for(i; i < ii; i++) {
            afterRender[keys[i]](req, res);
        }
    },
};

module.exports = view;
