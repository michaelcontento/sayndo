/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')

  , config = require('../../../lib/config/config.js')
  , session = require('../session.js').init()
  , redis = require('../redis.js').init();

/*
 * Session test module.
 */
vows.describe('session')
    .addBatch({
        /*
         *
         */
        'createHash': {
            topic: session,
            'generates a randomized sha256 hash with 64 chars': function(session) {
                var hash = session.createHash()
                  , secondHash = session.createHash();

                assert.equal('string', typeof hash);
                assert.equal(64, hash.length);
                assert.notEqual(hash, secondHash);
            }
        },

        /*
         *
         */
        'readByCookie': {
            topic: session,
            'is function': function(session) {
                assert.isFunction(session.readByCookie);
            },
        },

        /*
         *
         */
        'read': {
            topic: function() {
                var self = this
                  , sessionId = '12345';

                var expected = [
                    {
                        key: config.sessionCookie + sessionId,
                        value: {authType: 'user', ip: '127.0.0.1'}
                    }
                ];

                redis.prefill(expected, function() {
                    session.read(sessionId, self.callback);
                });
            },
            'gets the correct session': function(err, session, authType) {
                assert.isNull(err);
                assert.include(session, 'authType');
                assert.include(session, 'ip');
                assert.equal('user', session.authType);
                assert.equal('127.0.0.1', session.ip);
                assert.equal('user', authType);
            }
        },

        /*
         *
         */
        'write': {
            topic: session,
            'creates a new session': function(session) {
                var res = {
                    session: {},
                    setHeader: function(key, value) {
                        assert.equal('Set-Cookie', key);
                        assert.isTrue(value.match(config.sessionCookie) !== null);
                    }
                };

                session.write(res, {authType: 'admin'}, 10, function(err, sessionId) {
                    assert.isNull(err);
                    assert.equal('string', typeof sessionId);
                    assert.equal(64, sessionId.length);
                });
            },
        },

        /*
         *
         */
        'update': {
            topic: function() {
                var self = this
                  , sessionId = '66666';

                var expected = [
                    {
                        key: config.sessionCookie + sessionId,
                        value: {authType: 'guest', ip: '123.45.67.89'}
                    }
                ];

                var newProperties = {authType: 'tseug', ip: '987.65.43.21'};

                redis.prefill(expected, function() {
                    session.update(sessionId, newProperties, function(err) {
                        session.read(sessionId, self.callback);
                    });
                });
            },
            'modifies the correct session successfully': function(err, session, authType) {
                assert.isNull(err);
                assert.include(session, 'authType');
                assert.include(session, 'ip');
                assert.equal('tseug', session.authType);
                assert.equal('987.65.43.21', session.ip);
                assert.equal('tseug', authType);
            }
        },

        /*
         *
         */
        'remove': {
           topic: function() {
                var self = this
                  , sessionId = '54321'
                  , key = config.sessionCookie + sessionId;

                var expected = [
                    {
                        key: key,
                        value: {authType: 'guest', ip: '192.168.0.101'}
                    }
                ];

                redis.prefill(expected, function() {
                    session.remove(sessionId, function(err) {
                        redis.client.hgetall(key, self.callback);
                    });
                });
            },
            'deletes the correct session': function(err, result) {
                assert.isNull(err);
                assert.isObject(result);
                assert.length(Object.keys(result), 0);
            },
        }
    })
    .addBatch({
        /*
         *
         */
        'cleanup redis': {
            topic: function() {
                var self = this;

                redis.client.flushall(self.callback);
            },
            'the storage is fresh again': function(err, result) {
                assert.isNull(err);
                assert.equal(result, 'OK');
            }
        }
    })
    .export(module);

