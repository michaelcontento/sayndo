/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')

  , cookie = require('../cookie.js');

/*
 * View test module.
 */
vows.describe('cookie')
    .addBatch({
        /*
         *
         */
        'expiration': {
            topic: cookie,
            'is function': function(cookie) {
                assert.isFunction(cookie.expiration);
            },
            'create formatted date string': function(cookie) {
                var minutes = 10
                  , date = new Date();

                date.setTime(date.getTime() + (minutes * 60 * 1000));

                assert.equal(date.toGMTString(), cookie.expiration(minutes));
            }
        },

        /*
         *
         */
        'read': {
            topic: cookie,
            'is function': function(cookie) {
                assert.isFunction(cookie.read);
            },
            'get existing cookie': function(cookie) {
                var reqCookies = 'websocket=4321; session=1234; preferences=789'
                  , key = 'session'
                  , expected = 'session=1234';

                cookie.read(reqCookies, key, function(cookie) {
                    assert.equal(expected, cookie);
                });
            },
            'get not existing cookie': function(cookie) {
                var reqCookies
                  , key = 'session'
                  , expected = null;

                cookie.read(reqCookies, key, function(cookie) {
                    assert.equal(expected, cookie);
                });
            },
            'get cookie (relevant cookie does´nt exist)': function(cookie) {
                var reqCookies = 'websocket=4321'
                  , key = 'session'
                  , expected = null;

                cookie.read(reqCookies, key, function(cookie) {
                    assert.equal(expected, cookie);
                });
            }
        },

        /*
         *
         */
        'write': {
            topic: cookie,
            'is function': function(cookie) {
                assert.isFunction(cookie.write);
            },
            'write a new cookie': function(cookie) {
                var minutes = 10
                  , expected = 'session=1234;path=/;expires=' + cookie.expiration(minutes) + ';';

                var res = {
                    setHeader: function(key, value) {
                        assert.equal('Set-Cookie', key);
                        assert.equal(expected, value);
                    }
                };

                cookie.write(res, 'session', '1234', 'path=/;', minutes);
            }
        },

        /*
         *
         */
        'remove': {
            topic: cookie,
            'is function': function(cookie) {
                assert.isFunction(cookie.remove);
            },
            'expire existing cookie': function(cookie) {
                var reqCookies = 'session=1234; websocket=4321; preferences=789'
                  , expected = 'session=1234;path=/;expires=01 Jan 2000 00:00:00 GMT;';

                var res = {
                    setHeader: function(key, value) {
                        assert.equal('Set-Cookie', key);
                        assert.equal(expected, value);
                    }
                };

                cookie.remove(reqCookies, res, 'session');
            },
            'cannot expire not existing cookie': function(cookie) {
                var reqCookies;

                var res = {
                    setHeader: function(key, value) {
                        assert.equal(value, 'not existing cookie cannot get overwritten');
                    }
                };

                cookie.remove(reqCookies, res, 'session');
            }
        }
    })
    .export(module);

