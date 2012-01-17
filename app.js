/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */
app.guest.GET['/setup'] = function(req, res) {
    res.render('/setup.html');
};

app.guest.GET['/test'] = function(req, res) {
    res.render('/test.html', {layout: 'test'});
};

