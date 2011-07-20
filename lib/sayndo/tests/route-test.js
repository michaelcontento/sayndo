/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , config = require('../../../lib/config.js')
  , route = require('../route.js');

/*
 * Route test module.
 */
vows.describe('route').addBatch({
    /*
     *
     */
    'structure': {
        topic: route.structure(config.authTypes, config.requestMethods),
        'complete': function(route) {
            assert.equal('object', typeof route);

            config.authTypes.forEach(function(authType) {
                config.requestMethods.forEach(function(requestMethod) {
                    assert.equal('object', typeof route[authType][requestMethod]);
                });
            });
        },
    },
}).export(module);

