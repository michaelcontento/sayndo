/*
 *
 * Server site riak helper module.
 *
 */

/*
 * Dependencies.
 */
var riak = require('riak-js')
  , logs = require('./log.js');

var riakHelper = {
    /*
     * A list of all buckets in the DB.
     */
    buckets: ['users'],

    /*
     * Flush the whole riak data.
     */
    flushAll: function(type) {
        var riak = riakHelper.server(type);

        riak.buckets(function(err, data, meta) {
            var buckets = data.buckets
              , i = 0
              , ii = buckets.length;

            function getKeys(bucket, cb) {
               riak.keys(bucket, function(err, keys) {
                    var i = 0
                      , ii = keys.length;

                    for(i; i < ii; i++) {
                        var key = keys[i];
                        cb(bucket, key);
                    }

                    logs.info('Flushed ' + ii + ' keys from bucket ' + bucket + '.');
                });
            }

            for(i; i < ii; i++) {
                var bucket = buckets[i];

                getKeys(bucket, function(bucket, key) {
                    riak.remove(bucket, key, {debug: false});
                });
            }

            logs.info('Flush all riak keys.');
        });
    },

    /*
     * Log stored data using bucket and data key.
     *
     * @param type, string of the riak environment (either "dev" or "pro").
     * @param bucket, string of a riak bucket where data is stored.
     * @param key, string of the data key.
     */
    log: function(type, bucket, key) {
        var riak = riakHelper.server(type);

        riak.getAll(bucket, key, function(err, data, meta) {
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
     * Instanciate the riak client.
     *
     * @return object, a riak client instance.
     */
    server: function(type) {
        var env = type || 'pro';

        return riak.getClient(riakHelper[env + 'Config']);
    },

    /*
     * Initialize the riak helper module.
     */
    init: function() {
        // code
    }
};

module.exports = riakHelper;

