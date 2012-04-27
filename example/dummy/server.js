/*
 *
 * Server module.
 *
 */

/*
 * Module variables.
 */
var app = require('sayndo');

/*
 * Routes
 */
app.guest.GET['/'] = function(req, res) {
  res.view.render('/index.html');
};

