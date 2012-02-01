/*
 *
 * Server site riak module.
 *
 */

/*
 * Dependencies.
 */
var log = require('logerize')
  , tools = require('./tools.js');

var riak = {
    /*
     * Flush the whole riak data.
     */
    flushAll: function() {
        var riak = this;

        riak.buckets(function(err, data, meta) {
            if(err) {
                log.error('Could not flush all buckets: ' + err.message);

                return;
            }

            var buckets = data.buckets
              , i = 0
              , ii = buckets.length;

            function getKeys(bucket, bucketNumber, cb) {
               riak.keys(bucket, function(err, keys) {
                    var i = 0
                      , ii = keys.length;

                    for(i; i < ii; i++) {
                        var key = keys[i];
                        cb(bucket, key);
                    }

                    log.info(
                        'Flushed ' + ii + ' keys from ' +
                        (bucketNumber + 1) + '. bucket "' + bucket + '".'
                    );
                });
            }

            for(i; i < ii; i++) {
                var bucket = buckets[i];

                getKeys(bucket, i, function(bucket, key) {
                    riak.remove(bucket, key);
                });
            }

            if(buckets.length > 0) {
                log.info('Flush all riak keys from ' + buckets.length + ' buckets.');
            }
        });
    },

    /*
     * Add an item to an array inside a session object.
     *
     * @param id, string of the session id to modify.
     * @param key, string of the list name to modify.
     * @param value, string of the item to add.
     */
    push: function(bucket, key, value, cb) {
        var riak = this;

        riak.get(bucket, key, function(err, data, meta) {
            if(tools.inArray(key, data)) {
                return;
            }

            if(data.notFound) {
                data = [];
            }

            data.push(value);

            riak.save(bucket, key, data, function(err) {
                if(typeof cb === 'function') {
                    cb();
                }
            });
        });
    },

    /*
     * Remove an item from an array inside a session object.
     *
     * @param id, string of the session id to modify.
     * @param key, string of the list name to modify.
     * @param value, string of the item to remove.
     */
    pop: function(bucket, key, value, cb) {
        var riak = this;

        riak.get(bucket, key, function(err, data, meta) {
            if(data.notFound) {
                data = [];
            }

            // Remove the item if it exists in the list.
            var i = 0
              , ii = data.length;

            for(i; i < ii; i++) {
                if(data[i] === value) {
                    data.splice(i, 1);
                }
            }

            // Remove the list if it is empty.
            if(data.length == 0) {
                riak.remove(bucket, key);

                return;
            }

            // Save the new list.
            riak.save(bucket, key, data, function(err) {
                if(typeof cb === 'function') {
                    cb();
                }
            });
        });
    },

    /*
     * Log stored data using an expression for possible keys.
     *
     * @param expression, string of an expression that match possible keys.
     */
    keys: function(expression) {
        var client = require('riak-js').getClient(riak.proConfig);

        client.keys(expression, function(err, data, meta) {
            console.log(data);
        });
    },

    /*
     * Log stored data using bucket and data key.
     *
     * @param type, string of the riak environment (either "dev" or "pro").
     * @param bucket, string of a riak bucket where data is stored.
     * @param key, string of the data key.
     */
    log: function(bucket, key) {
        var client = require('riak-js').getClient(riak.proConfig);

        client.getAll(bucket, key, function(err, data, meta) {
            console.log(data);
        });
    },

    /*
     * Set the riak server configuration.
     */
    proConfig: {
        host: '127.0.0.1',
        port: '8091',
        debug: false
    },

    /*
     * Set the riak server configuration.
     */
    devConfig: {
        host: '127.0.0.1',
        port: '8092'
    },

    /*
     * Initialize the riak helper module.
     */
    init: function() {
        this.riak = require('riak-js').getClient(riak.proConfig);

        this.riak.flushAll = riak.flushAll;
        this.riak.push = riak.push;
        this.riak.pop = riak.pop;

        return this.riak;
    }
};

module.exports = riak;

