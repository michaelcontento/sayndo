/*
 * Dependencies.
 */
var fs = require('fs')
  , view = require('./view.js')
  , config = require('../../lib/config/config.js');

/*
 * File module.
 */
var file = {
    /*
     * Cache all static files to memory. See ./cache.js.
     */
    cache: {},

    /*
     * Get the extension of a path. Search for the last occurrence
     * of a dot (.) and get the follwoing chars. Is needed for
     * request type identification. Is 50% faster than path.extname().
     */
    ext: function(string) {
        var splited = string.split('.');

        if (splited.length > 1) {
            return splited[splited.length - 1];
        }

        return '';
    },

    /*
     * Get files of a directory. Loop trough all directories until all
     * files are found. Read found files and send the data to a callback.
     */
    get: function(dirPath, cb) {
        fs.readdir(dirPath, function(err, files) {
            if(typeof files === 'undefined') {
                return;
            }

            files.forEach(function(item) {
                var i = 0
                  , ii = config.cacheIgnore.length;

                for(i; i < ii; i++) {
                   // Ignore unneeded files and directories.
                    if(config.cacheIgnore[i] == item) {
                        return;
                    }
                }

                var filePath = dirPath + '/' + item;

                // No files, but directories.
                if(file.ext(item) === '') {
                    return file.get(filePath, cb);
                }

                var encoding = config.fileTypes[file.ext(filePath)].encoding;

                fs.readFile(filePath, encoding, function(err, data) {
                    cb(filePath.replace(config.publicPath, ''), data);
                });
            });
        });
    }
};

module.exports = file;
