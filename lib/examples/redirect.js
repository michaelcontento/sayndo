/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */

/*
 * Here we create a session with the auth type 'user' and
 * set a session message that will be shown one time. In
 * this case the session is set for 1 minute.
 */
app.guest.GET['/'] = function(req, res) {
    var session = {
        authType: 'user',
        message: 'that session message you will see just one time, allthough you are redirected'
    };

    res.session.write(session, 1);
    res.redirect('/redirect');
};

app.user.GET['/redirect'] = function(req, res) {
    // Just show the session object if one is set.
    console.log(res.session);

    res.render('/index.html', {local: 'you have the auth type "user"'});
};

