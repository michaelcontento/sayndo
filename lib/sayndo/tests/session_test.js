/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , config = require('../../../lib/config/config.js')
  , riak = require('../riak.js').init()
  , session = require('../session.js');

/*
 * Session test module.
 */
vows.describe('session').addBatch({
    /*
     *
     */
    'createHash': {
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.createHash);
        },
        'create a randomized sha256 hash with 64 chars': function(session) {
            var hash = session.createHash();

            assert.equal('string', typeof hash);
            assert.equal(64, hash.length);

            var secondHash = session.createHash();

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
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.read);
        },
        '': {
            topic: function(session) {
                var sessionCookie = config.sessionCookie
                  , sessionId = '12345'
                  , properties = {authType: 'user', ip: '127.0.0.1'}
                  , cb = this.callback;

                riak.save(sessionCookie, sessionId, properties, function(err, success, meta) {
                    session.read(sessionId, cb);
                });
            },
            'get the correct session': function(err, session, authType) {
                assert.isNull(err);
                assert.include(session, 'authType');
                assert.include(session, 'ip');
                assert.equal('user', session.authType);
                assert.equal('127.0.0.1', session.ip);
                assert.equal('user', authType);
            }
        }
    },

    /*
     *
     */
    'write': {
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.write);
        },
        'create a new session': function(session) {
            var minutes = 10
              , properties = {authType: 'admin'};

            var res = {
                session: {},
                setHeader: function(key, value) {
                    assert.equal('Set-Cookie', key);
                    assert.isTrue(value.match(config.sessionCookie) !== null);
                }
            };

            session.write(res, properties, minutes, function(sessionId) {
                assert.equal('string', typeof sessionId);
                assert.equal(64, sessionId.length);
            });
        },
    },

    /*
     *
     */
    'update': {
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.update);
        },
        '': {
            topic: function(session) {
                var sessionCookie = config.sessionCookie
                  , sessionId = '666666'
                  , properties = {authType: 'guest', ip: '123.45.67.89'}
                  , cb = this.callback;

                riak.save(sessionCookie, sessionId, properties, function(err, success, meta) {
                    var newProperties = {authType: 'tseug', ip: '987.65.43.21'};

                    session.update(sessionId, newProperties, function(err) {
                        session.read(sessionId, cb);
                    });
                });
            },
            'update the correct session successfully': function(err, session, authType) {
                assert.isNull(err);
                assert.include(session, 'authType');
                assert.include(session, 'ip');
                assert.equal('tseug', session.authType);
                assert.equal('987.65.43.21', session.ip);
                assert.equal('tseug', authType);
            }
        }
    },

    /*
     *
     */
    'remove': {
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.remove);
        },
        '': {
            topic: function(session) {
                var sessionCookie = config.sessionCookie
                  , sessionId = '54321'
                  , properties = {authType: 'owner', ip: '192.168.0.101'}
                  , cb = this.callback;

                riak.save(sessionCookie, sessionId, properties, function(err, success, meta) {
                    session.remove({session: {id: sessionId}}, function(err) {
                        session.read(sessionId, cb);
                    });
                });
            },
            'removes the correct session': function(err, session) {
                assert.include(err, 'notFound');
                assert.isTrue(err.notFound);
                assert.isObject(session);
                assert.isEmpty(session);
            },
        }
    }
}).export(module);

