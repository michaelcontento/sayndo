/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')

  , route = require('../route.js')
  , config = require('../../../lib/config/config.js');

/*
 * Route test module.
 */
vows.describe('route')
    .addBatch({
        /*
         *
         */
        'structure': {
            topic: route,
            'is function': function(route) {
                assert.isFunction(route.structure);
            },
            'contain all view routes including auth types': function(route) {
                var routes = route.structure(config.authTypes, config.requestMethods);

                assert.isObject(routes);

                config.authTypes.forEach(function(authType) {
                    config.requestMethods.forEach(function(requestMethod) {
                        assert.isObject(routes[authType][requestMethod]);
                    });
                });
            },
        },
    })
    .export(module);

