/*
 * Dependencies.
 */
var cwd = process.cwd();

/*
 * Config module.
 */
var config = {
    /*
     * String of absolute path to all public folder and files.
     */
    publicPath: cwd + '/public',

    /*
     * String of absolute path to all stylesheets.
     */
    stylesheetPath: cwd + '/public/stylesheets',

    /*
     * String of absolute path to all images.
     */
    imagePath: cwd + '/public/images',

    /*
     * String of absolute path to all javascripts.
     */
    javascriptPath: cwd + '/public/javascripts',

    /*
     * String of absolute path to all views.
     */
    viewPath: cwd + '/views',

    /*
     * String of absoulte path to the layout.
     */
    layoutPath: cwd + '/views/layout.html',

    /*
     * Array, containing objects, representing external sources.
     *
     * E.g. to use socket.io include the following object to the
     * depenedencies array.
     *
     *   {
     *       reqUrl: '/socket.io/socket.io.js',
     *       sourcePath: cwd + '/node_modules/socket.io/node_modules/socket.io-client/lib/socket.io-client.js'
     *   }
     *
     */
    dependencies: [],

    /*
     * Array of request methods the server have to support.
     * This request methods are also supported for the view
     * route functions.
     */
    requestMethods: ['GET', 'POST'],

    /*
     * String of default auth type, to fallback if no other is
     * supported in the view route functions.
     */
    defaultAuthType: 'guest',

    /*
     * Array of auth types the server have to support. This
     * auth types are also supported for the view route
     * functions.
     */
    authTypes: ['guest', 'user', 'mod', 'admin'],

    /*
     * Session cookie name of the app. Just a little piece of suggar.
     */
    sessionCookie: 'session',

    /*
     * String of random character to create save hashes. The
     * security salt is a dependency for the session support.
     */
    securitySalt: '2RFD6jDdrdmpp9790kjIhug76ZG76hoiUkjg',

    /*
     * Object literal of file types the server have to support.
     * Indexed by the file extension (e.g. 'js' for .js files).
     *
     * Containing:
     *
     *  - 'encoding' (e.g. 'utf8').
     *  - 'contentType' (e.g. 'text/javascript').
     *  - 'httpHeader' (e.g. {"Content-Type": "text/javascript"}).
     */
    fileTypes: {
        'js': {
            encoding: 'utf8',
            contentType: 'text/javascript',
            header: {'Content-Type': 'text/javascript'},
         },
        'ico': {
            encoding: 'binary',
            contentType: 'image/x-icon',
            header: {'Content-Type': 'image/x-icon'},
        },
        'css': {
            encoding: 'utf8',
            contentType: 'text/css',
            header: {'Content-Type': 'text/css'},
        },
        'gif': {
            encoding: 'utf8',
            contentType: 'image/gif',
            header: {'Content-Type': 'image/gif'},
        },
        'png': {
            encoding: 'binary',
            contentType: 'image/png',
            header: {'Content-Type': 'image/png'},
        },
        'jpg': {
            encoding: 'binary',
            contentType: 'image/jpeg',
            header: {'Content-Type': 'image/jpeg'},
        },
        'jpe': {
            encoding: 'binary',
            contentType: 'image/jpeg',
            header: {'Content-Type': 'image/jpeg'},
        },
        'jpeg': {
            encoding: 'binary',
            contentType: 'image/jpeg',
            header: {'Content-Type': 'image/jpeg'},
        },
        'html': {
            encoding: 'utf8',
            contentType: 'text/html',
            header: {'Content-Type': 'text/html'},
        }
    }
};

module.exports = config;
