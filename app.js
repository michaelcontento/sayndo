/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */
app.guest.GET['/'] = function(req, res) {
    res.render('/index.html', {msg: 'hello world'});
};

