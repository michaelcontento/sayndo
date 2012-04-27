/*
 * Session module.
 */

/*
 * Module variables.
 */
var crypto = require('crypto')

  , cookie = require('./cookie.js')
  , config = require('../config/config.js')
  , redis = require('./redis.js').init();

var sessionPrefix = config.sessionCookie
  , ttl = config.ttl || (60 * 24 * 365); // minutes

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
      if (sessionCookie === null) {
        return cb(undefined, {
          authType: config.defaultAuthType
        });
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
      if (typeof session.authType === 'string') {
        return cb(err, session);
      }

      cb(err, {
        authType: config.defaultAuthType
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
  write: function(res, properties, cb) {
    if (typeof res.session === 'object' && typeof res.session.id === 'string') {
      redis.client.del(sessionPrefix + res.session.id);
    }

    properties.id = this.createHash();
    properties.ttl = properties.ttl || ttl;

    redis.client.hmset(sessionPrefix + properties.id, properties, function(err) {
      cookie.write(res, sessionPrefix, properties.id, 'path=/;', properties.ttl);

      if (typeof cb === 'function') {
        cb(err, properties);
      }
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
    if (typeof id === 'undefined') {
      return;
    }

    redis.client.hmset(sessionPrefix + id, properties, function(err, result) {
      if (typeof cb === 'function') {
        cb(err, result);
      }
    });
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
      if (typeof cb === 'function') {
        cb(err);
      }
    });
  },

  /*
   * Initialize the session module.
   */
  init: function(req, res, cb) {
    this.readByCookie(req.headers.cookie, function(err, properties) {
      res.session = properties;

      res.session.write = function(properties, cb) {
        properties.ip = req.connection.remoteAddress;
        session.write(res, properties, cb);
      };

      res.session.update = function(properties, cb) {
        session.update(res.session.id, properties, cb);
      }

      res.session.remove = function(cb) {
        session.remove(res.session.id, cb);
      };

      cb();
    });
  },
};

module.exports = session;

