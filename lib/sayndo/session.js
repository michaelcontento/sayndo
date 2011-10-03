/*
 * Dependencies.
 */
var crypto = require('crypto')
  , cookie = require('./cookie.js')
  , config = require('../../lib/config/config.js')
  , riak = require('./riak.js').init();

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
    readByCookie: function(reqCookies, cb) {
        cookie.read(reqCookies, sessionCookieName, function(sessionCookie) {
            if(sessionCookie === null) {
                return cb(null, {}, config.defaultAuthType);
            }

            var sessionId = sessionCookie.replace(sessionCookieName + '=', '');

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
        riak.get(sessionCookieName, id, function(err, session) {
            if(typeof session.authType === 'string') {
                return cb(err, session, session.authType);
            }

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
        var sessionId = this.createHash();

        if(typeof res.session.id !== 'undefined') {
            riak.remove(sessionCookieName, res.session.id);
        }

        properties.id = sessionId;

        riak.save(sessionCookieName, sessionId, properties);
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
    update: function(id, properties, cb) {
        if(typeof id === 'string') {
            riak.update(sessionCookieName, id, properties, function(err) {
                if(typeof cb === 'function') {
                    cb(err);
                }
            });
        }
    },

    /*
     * Remove the current session.
     *
     * @param res, object of http response object.
     */
    remove: function(res, cb) {
        cookie.remove(sessionCookieName);
        riak.remove(sessionCookieName, res.session.id, function(err) {
            if(typeof cb === 'function') {
                cb(err);
            }
        });
    },
};

module.exports = session;
