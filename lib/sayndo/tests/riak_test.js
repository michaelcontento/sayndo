/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , riak = require('../riak.js');

/*
 * File test module.
 */
vows.describe('riak').addBatch({
    /*
     *
     */
    'flushAll': {
        topic: riak,
        'is function': function(riak) {
            assert.isFunction(riak.flushAll);
        },
        'should remove all keys from all buckets': {
            topic: function(riak) {
                var riak = riak.init()
                  , key = '1'
                  , value = 'foo'
                  , cb = this.callback;

                riak.save('bucket', key, value, function(err, success, meta) {
                    riak.save('bucket', value, key, function(err, success, meta) {
                        riak.flushAll();

                        function getKeys() {
                            riak.keys('bucket', cb);
                        }

                        setTimeout(getKeys, 2000);
                    });
                });
            },
            'all keys from all buckets removed': function(err, keys, meta) {
                assert.isArray(keys);
                assert.isEmpty(keys);
            }
        }
    },

    /*
     *
     */
    'push': {
        topic: riak,
        'is function': function(riak) {
            assert.isFunction(riak.push);
        },
        'should add an item to a list': {
            topic: function(riak) {
                var riak = riak.init()
                  , cb = this.callback;

                riak.push('BUCKET', 'key', 'value', function() {
                    riak.get('BUCKET', 'key', cb);
                });
            },
            'an item to a list added': function(err, list, meta) {
                assert.isArray(list);
                assert.length(list, 1);
                assert.include(list, 'value');
            }
        }
    },

    /*
     *
     */
    'pop': {
        topic: riak,
        'is function': function(riak) {
            assert.isFunction(riak.pop);
        },
        'should remove an item from a list': {
            topic: function(riak) {
                var riak = riak.init()
                  , cb = this.callback;

                riak.save('TECKUB', 'yek', ['foo', 'bar'], function() {
                    riak.pop('TECKUB', 'yek', 'bar', function() {
                        riak.get('TECKUB', 'yek', cb);
                    });
                });
            },
            'an item from a list removed': function(err, list, meta) {
                assert.isArray(list);
                assert.length(list, 1);
                assert.include(list, 'foo');
            }
        }

    },

    /*
     *
     */
    'log': {
        topic: riak,
        'is function': function(riak) {
            assert.isFunction(riak.log);
        },
    },

    /*
     *
     */
    'init': {
        topic: riak,
        'is function': function(riak) {
            assert.isFunction(riak.init);
        },
        'should return a riak client including custom and native functions': function(riak) {
            var riak = riak.init();

            // Native riak functions.
            assert.isFunction(riak.get);
            assert.isFunction(riak.save);
            assert.isFunction(riak.remove);
            assert.isFunction(riak.update);
            assert.isFunction(riak.getAll);

            // Custom riak functions.
            assert.isFunction(riak.flushAll);
            assert.isFunction(riak.push);
            assert.isFunction(riak.pop);
        }
    },
}).export(module);

