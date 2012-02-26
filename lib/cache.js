/*
 * Dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , file = require('./file.js')
  , view = require('./view.js')
  , config = require('../config/config.js')

  , layoutPattern = /layout/g;

/*
 * Cache module.
 */
var cache = {
    /*
     * Cache necessary files that are not placed in the app
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
     * Cache all static files inside the app folder.
     */
    public: function() {
        file.get(config.publicPath, function(filePath, data) {
            file.cache[filePath.replace(config.cwd, '')] = data;
        });
    },

    /*
     * Cache all static files inside the test folder.
     */
    test: function() {
        file.get(config.testPath, function(filePath, data) {
            file.cache[filePath.replace(config.cwd, '')] = data;
        });
    },

    /*
     * Prepare and cache all views.
     */
    view: function() {
        Object.keys(config.layoutPath).forEach(function(type) {
            fs.readFile(config.layoutPath[type], 'utf8', function(err, layoutHtml) {
                file.get(config.viewPath, function(filePath, viewHtml) {
                    if(filePath.match(layoutPattern) !== null) return;

                    view.parseLocals(layoutHtml, {view: viewHtml}, function(html) {
                        var rawPath = filePath.replace(config.viewPath, '');

                        view.cache['none' + rawPath] = viewHtml;
                        view.cache[type + rawPath] = html;
                    });
                });
            });
        });
    },

    /*
     * Cache all necessary files to respond as fast as posible.
     */
    init: function() {
        cache.dependencies();
        cache.public();
        cache.test();
        cache.view();
    }
};

module.exports = cache;
