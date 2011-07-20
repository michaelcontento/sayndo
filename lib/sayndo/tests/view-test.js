/*
 * Dependencies.
 */
var vows = require('vows')
  , assert = require('assert')
  , appLocals = require('../../../lib/app_locals.js')
  , view = require('../view.js');

/*
 * View test module.
 */
vows.describe('view').addBatch({
    /*
     *
     */
    'properties': {
        topic: view,
        'cache': function(view) {
            assert.equal('object', typeof view.cache);
            assert.equal(0, Object.keys(view.cache).length);
        },
        'contentType': function(view) {
            assert.equal('object', typeof view.contentType);
            assert.equal(1, Object.keys(view.contentType).length);
            assert.equal('text/html', view.contentType['Content-Type']);
        },
        'cache': function(view) {
            assert.equal('object', typeof view.cache);
            assert.equal(0, Object.keys(view.cache).length);
        },
        'errors': function(view) {
            assert.equal('function', typeof view.errors);

            var res = {
                end: function(data) {
                    assert.equal('Not found', data);
                },
                writeHead: function(statusCode, header) {
                    assert.equal(404, statusCode);
                    assert.equal(view.contentType, header);
                }
            };

            view.errors({}, res);
        },
        'combineLocals': function(view) {
            var count = Object.keys(appLocals).length;

            view.combineLocals({}, {}, {msg: 'hello world'}, function(combinedLocals) {
                assert.equal(1 + count, Object.keys(combinedLocals).length);
                assert.equal('hello world', combinedLocals.msg);
            });
        },
        'parseLocals': function(view) {
            var cachedView = '<h1>#{title}</h1><p>#{msg}</p><p>#{msg}</p>'
              , locals = {title: 'Sayndo', msg: 'hello world'};

            view.parseLocals(cachedView, locals, function(html) {
                assert.equal(null, html.match(/#\{.*?\}/g));
            });
        },
        'render with locals': function(view) {
            var expectedView = '<h1>Sayndo</h1><p>hello world</p><p>hello world</p>'
              , cachedView = '<h1>#{title}</h1><p>#{msg}</p><p>#{msg}</p>'
              , locals = {title: 'Sayndo', msg: 'hello world'};

            var res = {
                end: function(html) {
                    assert.equal(expectedView, html);
                },
                writeHead: function(statusCode, header) {
                    assert.equal(200, statusCode);
                    assert.equal(view.contentType, header);
                }
            };

            view.cache['view/path'] = cachedView;
            view.render({}, res, 'view/path', locals);
        },
        'render without locals': function(view) {
            // We expect that only title is parsed because of the app locals.
            var expectedView = '<h1>Sayndo</h1><p>#{msg}</p><p>#{msg}</p>'
              , cachedView = '<h1>#{title}</h1><p>#{msg}</p><p>#{msg}</p>';

            var res = {
                end: function(html) {
                    assert.equal(expectedView, html);
                },
                writeHead: function(statusCode, header) {
                    assert.equal(200, statusCode);
                    assert.equal(view.contentType, header);
                }
            };

            view.cache['view/path'] = cachedView;
            view.render({}, res, 'view/path');
        },
    }
}).export(module);

