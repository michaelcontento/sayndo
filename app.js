/*
 * Dependencies.
 */
var app = require('./lib/server.js');

/*
 * Routes
 */
app.guest.GET['/'] = function(req, res) {
    res.render('/index.html', {msg: 'hello world'});
};

