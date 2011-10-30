/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , callback = require('callbackQueue')

  , redis = require('../redis.js').init();

/*
 * File test module.
 */
vows.describe('redis')
    .addBatch({
        /*
         *
         */
        'prefill': {
            topic: function() {
                var self = this
                  , data = {};

                var expected = [
                    {key: 'foo', value: 'i am a string'},
                    {key: 'baz', value: {i: 'am', an: 'object'}}
                ];

                redis.prefill(expected, function() {
                    redis.client.keys('*', function(err, keys) {
                        var callbackQueue = callback.init(['foo', 'baz'], function() {
                            self.callback(undefined, data, keys);
                        });

                        redis.client.get('foo', function(err, result) {
                            data.foo = result;
                            callbackQueue.register('foo');
                        });

                        redis.client.hgetall('baz', function(err, result) {
                            data.baz = result;
                            callbackQueue.register('baz');
                        });
                    });
                });
            },
            'saves a list of different datasets in redis': function(err, data, keys) {
                assert.isObject(data);
                assert.length(Object.keys(data), 2);
                assert.include(data, 'foo');
                assert.include(data, 'baz');
                assert.isObject(data.baz);
                assert.include(data.baz, 'i');
                assert.include(data.baz, 'an');
                assert.equal(data.foo, 'i am a string');
                assert.equal(data.baz.i, 'am');
                assert.equal(data.baz.an, 'object');
                assert.isArray(keys);
                assert.length(keys, 2);
                assert.include(keys, 'foo');
                assert.include(keys, 'baz');
            }
        },
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

