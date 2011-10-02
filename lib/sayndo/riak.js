/*
 *
 * Server site riak module.
 *
 */

/*
 * Dependencies.
 */
var client
  , log = require('./log.js');

var riak = {
    /*
     * Flush the whole riak data.
     */
    flushAll: function(type) {
        var riak = this;

        riak.buckets(function(err, data, meta) {
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

                    log.info('Flushed ' + ii + ' keys from ' + (bucketNumber + 1) + '. bucket ' + bucket + '.');
                });
            }

            for(i; i < ii; i++) {
                var bucket = buckets[i];

                getKeys(bucket, i, function(bucket, key) {
                    riak.remove(bucket, key, {debug: false});
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
    push: function(bucket, key, value) {
        var riak = this;

        riak.get(bucket, key, function(err, data, meta) {
            if(data.notFound) {
                data = [];
            }

            data.push(value);

            riak.save(bucket, key, data);
        });
    },

    /*
     * Remove an item from an array inside a session object.
     *
     * @param id, string of the session id to modify.
     * @param key, string of the list name to modify.
     * @param value, string of the item to remove.
     */
    pop: function(bucket, key, value) {
        var riak = this;

        riak.get(bucket, key, function(err, data, meta) {
            if(data.notFound) {
                data = [];
            }

            var i = 0
              , ii = data.length;

            for(i; i < ii; i++) {
                if(data[i] === value) {
                    data.splice(i, 1);
                }
            }

            riak.save(bucket, key, data);
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
        port: '8091'
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
        var client = require('riak-js').getClient(riak.proConfig);

        client.flushAll = riak.flushAll;
        client.push = riak.push;
        client.pop = riak.pop;

        return client;
    }
};

module.exports = riak;

