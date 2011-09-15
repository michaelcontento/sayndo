/*
 * Dependencies.
 */
var app = require('sayndo');

/*
 * Routes
 */
app.guest.GET['/'] = function(req, res) {
    // Show all cookies.
    console.log('cookie header: ' + req.headers.cookie);

    // Create and update cookies. Set expiration for 10 minutes.
    res.cookie.write('test', 4321, 'path=/;', 10);

    // Read a specific cookie.
    res.cookie.read('test', function(cookie) {
        if(cookie) {
            console.log('test cookie: ' + cookie);

            // Remove a specific cookie.
            res.cookie.remove('test');
        }
    });

    res.render('/index.html', {local: 'hello world'});
};

