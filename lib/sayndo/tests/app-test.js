/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , config = require('../../../lib/config.js')
  , app = require('../server.js');

/*
 * Server test module.
 */
vows.describe('app').addBatch({
    /*
     *
     */
    'properties': {
        topic: app,
        'routes': function(app) {
            assert.equal('function', typeof app[config.defaultAuthType].GET.errors);
        },
        'host': function(app) {
            assert.equal('string', typeof app.host);
        },
        'port': function(app) {
            assert.equal('number', typeof app.port);
        },
        'log': function(app) {
            assert.equal('function', typeof app.log.error);
            assert.equal('function', typeof app.log.success);
            assert.equal('function', typeof app.log.debug);
            assert.equal('function', typeof app.log.info);
            assert.equal('undefined', typeof app.log.create);
        },
        'node': function(app) {
            assert.equal('tcp4', app.node.type);
            assert.equal('function', typeof app.node.close);
            assert.equal('function', typeof app.node.listen);
            assert.equal('number', typeof app.node.connections);

            app.node.close();

            assert.equal(null, app.node.fd);
        },
    },
}).export(module);

