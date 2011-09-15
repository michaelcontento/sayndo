/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */

/*
 * Here we create a session with the auth type 'user'. In
 * this case the session is set for 1 minute. After that
 * minute the users auth type falls back to the default
 * auth type defined in lib/app/config.js
 */
app.guest.GET['/'] = function(req, res) {
    // Just show the session object, if there is no one.
    console.log(res.session);

    res.session.write({authType: 'user'}, 1);
    res.render('/index.html', {message: 'you have the auth type "guest"'});
};

// Destroy the current session.
app.user.GET['/'] = function(req, res) {
    // Just show the session object if one is set.
    console.log(res.session);

    res.session.remove();
    res.render('/index.html', {message: 'you have the auth type "user"'});
};
