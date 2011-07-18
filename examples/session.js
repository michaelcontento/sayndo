/*
 * Dependencies.
 */
var app = require('../lib/server.js');

/*
 * Routes
 */
app.guest.GET['/'] = function(req, res) {
    res.createSession({authType: 'user'}, 1);
    res.render('/index.html', {msg: 'you have the auth type "guest"'});
};

app.user.GET['/'] = function(req, res) {
    res.destroySession();
    res.render('/index.html', {msg: 'you have the auth type "user"'});
};
