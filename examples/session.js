/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */

// Create a session and set the auth type to "user".
app.guest.GET['/'] = function(req, res) {
    res.createSession({authType: 'user'}, 1);
    res.render('/index.html', {msg: 'you have the auth type "guest"'});
};

// Destroy the current session.
app.user.GET['/'] = function(req, res) {
    res.destroySession();
    res.render('/index.html', {msg: 'you have the auth type "user"'});
};
