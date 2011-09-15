/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */

/*
 * Here we create a session with the auth type 'guest' and
 * set a session message that will be shown until the session
 * expires. In this case the session is set for 1 minute.
 */
app.guest.GET['/'] = function(req, res) {
    var session = {
        authType: 'guest',
        message: 'that session message you will see just for one minute'
    };

    res.session.write(session, 1);
    res.render('/index.html');
};

