# Sayndo

  This is my first project i released. Suggestions, questions
  and notices are welcome. Please report bugs as you find them.

  So why did i have created this webserver? Because of performance
  and usability aspects. This module is inspired by express. It
  is a little bit faster than express, but not a replacement for
  that greate framework. I also like the routing functions, where
  you can define custom auth types.



## Installation:

  To just use the server do:

    $ npm install



  If you want to create a new app on top of sayndo, create
  the app doing this:

    $ sh node_modules/sayndo/bin/create-app.sh



  Finally your app should look something like that:

    your app -
             |- app -
             |      |- controller
             |      |- model
             |      |- view
             |
             |- config -
             |         |- app_locals.js
             |         |- config.js
             |
             |- node_modules -
             |               |- sayndo
             |
             |- public -
             |         |- image
             |         |- javascript
             |         |- stylesheet
             |         |- view -
             |                 | - layout -
             |                 |          |- default_layout.html
             |                 |          |- test_layout.html
             |                 |
             |                 | - index.html
             |
             |- test
             |- package.json
             |- server.js



  For session support the redis server is required. The redis
  client for node gets installed on "npm install", but you have
  to install the redis server by yourself on your mashine. Linux
  user do:



    $ sudo apt-get install redis-server



## Run server:

  Start the server with default settings on 127.0.0.1:3000.

    $ node server.js

  Start the server with custom settings on [host]:[port].

    $ node server.js [host] [port]



## Routes:


  This route is called each time a user with auth type
  "guest" enters your app with a http GET request.

    var app = require('sayndo');

    app.guest.GET['/'] = function(req, res) {
        res.view.render('/index.html', {msg: 'hello world'});
    };



  "app" contains all routes defined in lib/config.js and the
  server "node", that is just a http server object.

  "guests" in this example, is the auth type a user can have.
  See lib/config.js and change it to your own.

  "GET" in this example, is the http request method a user
  used to enter your app. See lib/config.js and change it to
  your own.

  "['/']" in this example, is the request url.

  Each route uses this structure to call the view function if
  all components match:

    app.<auth-type>.<REQUEST-METHOD>['<request-url>']



## Auth types:

  You can set auth types and the default auth type by yourself
  changing the given in lib/config.js.

  The auth type is required for authorized routes ot requested
  url´s. A user with the auth type "admin" can enter a route
  like that.

    app.admin.GET['/dashboard'] = function(req, res) {
        // do some fancy admin stuff here.
    };



## Sessions:

  The session object by default is just an empty object
  literal. You can access the current session like that.
  How to write sessions and their properties, see the
  lines below.

    res.session



  The current session id, once there was one created, can
  be accessed using that.

    res.session.id



  Create a new session with the authType "admin" for only
  10 minutes. **To create a new valid session you need to define
  the "authType" attribute, related to the auth types in your
  config.js.** You can set the "time to life" explicity. If it
  is not provided by you, the "ttl" property of your config file
  is used. Otherwise the default "ttl" is to 1 year.

    res.session.write({authType: 'admin', user: 'John', ttl: 10} [, cb]);



  Update an existing session is easy as well. Internally allready
  given properties get overwritten.

    res.session.update({authType: 'user'});



  Remove (or better destroy) the current session.

    res.session.remove();



  For a more practical usage try the example.




## Cookies:

  The http response object you can enter in a view function
  contains a cookie object with the following properties.

  Read a cookie with the name 'key' and get the value through
  the defined callback.

    res.cookie.read('key', function(value) {});



  Write a cookie with the name 'key' and the value '1234'. Set
  the cookie path to '/' and expiration to 10 minutes from now.

    res.cookie.write('key', '1234', 'path=/;', 10);



  To update a existing cookie use res.cookie.write() to overwrite
  a cookie.

    res.cookie.write('key', '4321', 'path=/updated;', 10);



  Remove a cookie with the name 'key'. This method set the
  expiration to a date in the past.

    res.cookie.remove('key');



  For a more practical usage try the example.



## Redirects:

  To redirect clients just do that:

    res.view.redirect('/redirect');



  To let the user know, why he was redirected, set a session
  message like described above.



## Sending Data:

 Just to send Json or string data do:

   res.view.send(stringOrObject);



## Locals:

  Locals are placeholder in views to insert data from the
  server to a view, using the following syntax.

    #{<local>}



  App locals get inserted in each view. E.g. you can do the
  following to set your app title. Yes, i know that is a
  stupid example. A better one would be the case of system
  messages for your app. But that is how it works.



  views/index.html

    <h1>#{title}</h1>

  lib/app/app_locals.js

    var appLocals = {
        title: function(req, res) {
            return 'Sayndo';
        }
    };

    module.exports = appLocals;



  View locals get inserted in each view of a specific url.
  E.g. you can do the following to set a message to a
  specific view.



  views/index.html

    <h1>#{msg}</h1>

  app.js

    app.guest.GET['/'] = function(req, res) {
        res.view.render('/index.html', {msg: 'hello world'});
    };



## Socket.io

  Server side.

    var io = require('socket.io').listen(app.node);

    io.sockets.on('connection', function (socket) {
        console.log(socket);
    });



  Client side.

    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io.connect('http://localhost');

        socket.on('connect', function () {
            console.log('Client connected');
        });
    </script>



  Try the example.



## Caching:

  Static files and views get allways cached into nodes process
  memory. That kind of caching only make sence if the cache size
  dont exceed 50 mb. The given path´s of cacheable folder are
  set in lib/config.js.

  At the moment there is no other cache solution supported. If
  it is needed we will find a solution to handle cache sizes
  that exceed 50 mb with redis or something like that. Just send
  me a message.

  I plan to pack all static files together by starting the server
  to minimize the number of requests a requested page produces.



## Tests:

  Tests are implemented with https://github.com/cloudhead/vows.

    $ sudo npm install vows -g
    $ vows node_modules/sayndo/test/* --spec



  Further information at http://vowsjs.org/



## Benchmarks:

  Settings

    mashine:            Pentium(R) Dual-Core CPU T4400 @ 2.20GHz
    duration:           30 seconds
    concurrency:        1000 req/s
    command:            siege -c1000 -t30S http://localhost:3000



  Results

                                express            |            sayndo
    _______________________________________________|___________________________
                                                   |
                        277 bytes    1034 bytes    |    229 bytes    1546 bytes
                                                   |
    total requests         7083          4411      |      44424         31674
    transfered mb          1.87          4.39      |       9.70         46.70
    latency (sec)          2.27          5.42      |       0.14          0.40
    req/sec              240.92        148.27      |    1522.93       1071.52
    mb/sec                 0.06          0.15      |       0.33          1.58
    concurrency             546           804      |        207           423
    longest request       22.05          9.32      |       9.13          9.54

