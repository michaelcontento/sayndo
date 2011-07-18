/*
 * Dependencies.
 */
var crypto = require('crypto')
  , config = require('./config.js')
  , redis = require('./redis.js').server;

var sessionCookie = config.sessionCookie;

/*
 * Server site session helper.
 */
var sessionHelper = {
    /*
     *
     */
    getCookie: function(reqCookies, cb) {
        var cookie = null
          , cookies = reqCookies.split(';')
          , i = 0
          , ii = cookies.length;

        for(i; i < ii; i++) {
            if(cookies[i].match(sessionCookie + '=')) {
                cookie = cookies[i];
            }
        }

        cb(cookie);
    },

    /*
     *
     */
    get: function(reqCookie, cb) {
        if(typeof reqCookie === 'undefined') {
            return cb(null, config.defaultAuthType);
        }

        this.getCookie(reqCookie, function(sessionCookie) {
            if(sessionCookie === null) {
                return cb(null, config.defaultAuthType);
            }

            redis.hgetall(sessionCookie, function(err, session) {
                if(typeof session.authType === 'string') {
                    return cb(session, session.authType);
                }

                cb(null, config.defaultAuthType);
            });
        });
    },

    /*
     * Set cookie expiration from now to given hours in GMT string.
     */
    getExpiration: function(minutes) {
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));

        return date.toGMTString();
    },

    /*
     *
     */
    createHash: function() {
        var hash = crypto.createHash('sha256')
          , rand = Math.random();

        return hash.update(rand + config.securitySalt).digest('hex');
    },

    /*
     * @param properties, object of session properties to be set.
     * @param minutes, number of minutes a session have to be active.
     */
    create: function(res, properties, minutes, cb) {
        var sessionId = this.createHash();

        res.setHeader('Set-Cookie',
            sessionCookie + '=' + sessionId + '; path=/; expires=' +
            this.getExpiration(minutes) + ';'
        );

        redis.hmset(sessionCookie + '=' + sessionId, properties);

        if(typeof cb === 'function') {
            cb(sessionId);
        }
    }
};

module.exports = sessionHelper;
