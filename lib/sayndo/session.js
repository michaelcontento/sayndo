/*
 * Dependencies.
 */
var crypto = require('crypto')
  , cookie = require('./cookie.js')
  , config = require('../../lib/config.js')
  , redis = require('./redis.js').server;

var sessionCookieName = config.sessionCookie;

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
    read: function(reqCookies, cb) {
        cookie.read(reqCookies, sessionCookieName, function(sessionCookie) {
            if(sessionCookie === null) {
                return cb({}, config.defaultAuthType);
            }

            redis.hgetall(sessionCookie, function(err, session) {
                if(typeof session.authType === 'string') {
                    return cb(session, session.authType);
                }

                cb({}, config.defaultAuthType);
            });
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
        var sessionId = this.createHash();

        if(typeof res.session.id !== 'undefined') {
            redis.del(sessionCookieName + '=' + res.session.id);
        }

        properties.id = sessionId;

        redis.hmset(sessionCookieName + '=' + sessionId, properties);
        cookie.write(res, sessionCookieName, sessionId, 'path=/;', minutes);

        if(typeof cb === 'function') {
            cb(sessionId);
        }
    },

    /*
     * Update the properties of an existing session.
     *
     * @param res, nodes server response object.
     * @param properties, the session properties to set.
     */
    update: function(res, properties) {
        var sessionId = res.session.id

        if(typeof sessionId !== 'string') {
            return;
        }

        redis.hmset(sessionCookieName + '=' + sessionId, properties);
    },

    /*
     * Remove the current session.
     *
     * @param res, object of http response object.
     */
    remove: function(res) {
        cookie.remove(sessionCookieName);
        redis.del(sessionCookieName + '=' + res.session.id);
    },
};

module.exports = session;
