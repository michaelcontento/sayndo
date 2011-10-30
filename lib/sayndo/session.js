/*
 * Dependencies.
 */
var crypto = require('crypto')

  , cookie = require('./cookie.js')
  , config = require('../../lib/config/config.js')
  , redis = require('./redis.js').init();

var sessionPrefix = config.sessionCookie;

/*
 * Server site session helper.
 */
var session = {
    /*
     * Create a new hash.
     *
     * @return, sha256 hash.
     */
    createHash: function() {
        var hash = crypto.createHash('sha256')
          , rand = Math.random();

        return hash.update(rand + config.securitySalt).digest('hex');
    },

    /*
     * Read the current session id.
     *
     * @param reqCookies, string of request header cookies.
     * @param cb, function to execute.
     */
    readByCookie: function(reqCookies, cb) {
        cookie.read(reqCookies, sessionPrefix, function(sessionCookie) {
            if(sessionCookie === null) {
                return cb(null, {}, config.defaultAuthType);
            }

            var sessionId = sessionCookie.replace(sessionPrefix + '=', '');

            session.read(sessionId, cb);
        });
    },

    /*
     * Read a session by a given session id.
     *
     * @param id, string of the session id to read.
     * @param cb, function to execute.
     */
    read: function(id, cb) {
        redis.client.hgetall(sessionPrefix + id, function(err, session) {
            if(typeof session.authType === 'string') return cb(err, session, session.authType);

            cb(err, {}, config.defaultAuthType);
        });
    },

    /*
     * Create a new session.
     *
     * @param res, object of http response.
     * @param properties, object of session properties to be set.
     * @param minutes, number of minutes a session have to be active.
     * @param cb, function to execute with new session id.
     */
    write: function(res, properties, minutes, cb) {
        var id = this.createHash();

        if(typeof res.session === 'object' && typeof res.session.id === 'string') {
            redis.client.del(sessionPrefix + res.session.id);
        }

        properties.id = id;

        redis.client.hmset(sessionPrefix + id, properties, function(err) {
            cookie.write(res, sessionPrefix, id, 'path=/;', minutes);

            if(typeof cb === 'function') cb(err, id);
        });
    },

    /*
     * Update the properties of an existing session.
     *
     * @param res, nodes server response object.
     * @param properties, the session properties to set.
     * @param cb, function to execute.
     */
    update: function(id, properties, cb) {
        if(typeof id === 'string') {
            redis.client.hmset(sessionPrefix + id, properties, function(err, result) {
                if(typeof cb === 'function') cb(err, result);
            });
        }
    },

    /*
     * Remove the current session.
     *
     * @param res, object of http response object.
     * @param cb, function to execute.
     */
    remove: function(id, cb) {
        cookie.remove(sessionPrefix);
        redis.client.del(sessionPrefix + id, function(err) {
            if(typeof cb === 'function') cb(err);
        });
    },

    /*
     * Initialize the session module.
     */
    init: function() {
        return session;
    },
};

module.exports = session;
