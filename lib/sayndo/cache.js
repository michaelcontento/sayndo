/*
 * Dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , file = require('./file.js')
  , view = require('./view.js')
  , config = require('../../lib/config/config.js');

/*
 * Cache module.
 */
var cache = {
    /*
     * Cache necessary files that are not placed in the public
     * folder. E.g. static files of /node_modules like the
     * socket.io client script.
     */
    dependencies: function() {
        config.dependencies.forEach(function(obj) {
            var filePath = obj.sourcePath
              , encoding = config.fileTypes[file.ext(filePath)];

            fs.readFile(filePath, encoding, function(err, data) {
                file.cache[obj.reqUrl] = data;
            });
        });
    },

    /*
     * Cache all static files inside the public folder.
     */
    public: function() {
        file.get(config.publicPath, function(filePath, data) {
            file.cache[filePath] = data;
        });
    },

    /*
     * Prepare and cache all views.
     */
    views: function() {
        fs.readFile(config.layoutPath, 'utf8', function(err, layoutHtml) {
            file.get(config.viewPath, function(filePath, viewHtml) {
                if(path.basename(filePath) != 'layout.html') {
                    view.parseLocals(layoutHtml, {view: viewHtml}, function(html) {
                        view.cache[filePath.replace(config.viewPath, '')] = html;
                    });
                }
            });
        });
    },

    /*
     * Cache all necessary files to respond as fast as posible.
     */
    init: function() {
        cache.dependencies();
        cache.public();
        cache.views();
    }
};

module.exports = cache;
