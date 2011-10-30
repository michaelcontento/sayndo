/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , fs = fs = require('fs')

  , file = require('../file.js');

/*
 * File test module.
 */
vows.describe('file')
    .addBatch({
        /*
         *
         */
        'cache': {
            topic: file,
            'is object': function(file) {
                assert.isObject(file.cache);
            },
        },

        /*
         *
         */
        'ext': {
            topic: file,
            'is function': function(file) {
                assert.isFunction(file.ext);
            },
            'get correct file extension': function(file) {
                assert.equal('js', file.ext('file.js'));
                assert.equal('js/', file.ext('file.js/'));
            }
        },

        /*
         *
         */
        'get': {
            topic: file,
            'is function': function(file) {
                assert.isFunction(file.get);
            },
        }
    })
    .export(module);

