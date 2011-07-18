/*
 * Dependencies.
 */
var log = require('./log.js')
  , redisClient = require('redis').createClient();

/*
 * Redis module. Create the server cache for session support
 * on top of redis.
 */
var redis = {
    /*
     * Redis connect event.
     */
    redisOnConnect: function(redisClient) {
        redisClient.on('connect', function () {
            redisClient.flushall();

            log.success('Start clean redis on ' +
                redisClient.host + ':' +
                redisClient.port + '.'
            );
        });
    },

    /*
     * Redis error event.
     */
    redisOnError: function(redisClient) {
        redisClient.on('error', function (error) {
            log.error(new Error(error).stack);
        });
    },

    /*
     * Redis end event.
     */
    redisOnEnd: function(redisClient) {
        redisClient.on('end', function () {
            log.info('Close redis.');
        });
    },

    /*
     * The redis server instance.
     */
    server: {},

    /*
     * Initialize the redis module.
     */
    init: function() {
        this.redisOnConnect(redisClient);
        this.redisOnError(redisClient);
        this.redisOnEnd(redisClient);

        this.server = redisClient;

        return redisClient;
    }
};

module.exports = redis;
