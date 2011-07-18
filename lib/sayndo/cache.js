/*
 * Dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , file = require('./file.js')
  , view = require('./view.js')
  , config = require('./config.js');

/*
 * Cache module.
 */
var cache = {
    /*
     * Cache all necessary files to respond as fast as posible.
     */
    all: function() {
        // Favicon.
        fs.readFile(config.publicPath + '/favicon.ico', 'binary', function(err, favicon) {
            if(typeof favicon === 'undefined') {
                var favicon = '';
            }

            file.cache['/favicon.ico'] = favicon;
        });

        // Stylesheets.
        file.get(config.stylesheetPath, 'utf8', function(filePath, stylesheet) {
            file.cache[filePath] = stylesheet;
        });

        // Images.
        file.get(config.imagePath, 'binary', function(filePath, image) {
            file.cache[filePath] = image;
        });

        // Javascripts.
        file.get(config.javascriptPath, 'utf8', function(filePath, javascript) {
            file.cache[filePath] = javascript;
        });

        // Views
        fs.readFile(config.layoutPath, 'utf8', function(err, layoutHtml) {
            file.get(config.viewPath, 'utf8', function(filePath, viewHtml) {
                if(path.basename(filePath) != 'layout.html') {
                    view.parseLocals(layoutHtml, {view: viewHtml}, function(html) {
                        view.cache[filePath.replace(config.viewPath, '')] = html;
                    });
                }
            });
        });
    }
};

module.exports = cache;
