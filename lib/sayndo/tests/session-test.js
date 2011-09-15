/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , config = require('../../../lib/config/config.js')
  , redis = require('../redis.js').server
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
        'create a sha256 hash with 64 chars': function(session) {
            var hash = session.createHash();

            assert.equal('string', typeof hash);
            assert.equal(64, hash.length);
        }
    },

    /*
     *
     */
    'read': {
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.read);
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
              , properties = {authType: 'admin'}
              , res = {
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
    'remove': {
        topic: session,
        'is function': function(session) {
            assert.isFunction(session.remove);
        }
    }
}).export(module);

