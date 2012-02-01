/*
 * Dependencies.
 */


/*
 * Cookie module.
 */
var cookie = {
    /*
     * Set cookie expiration from now to given hours in GMT string.
     */
    expiration: function(minutes) {
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));

        return date.toUTCString();
    },

    /*
     * Get a cookie by a given key.
     */
    read: function(reqCookies, key, cb) {
        var cookie = null;

        if(typeof reqCookies !== 'undefined') {
            var cookies = reqCookies.split(';')
              , i = 0
              , ii = cookies.length;

            for(i; i < ii; i++) {
                if(cookies[i].match(key + '=')) {
                    cookie = cookies[i].replace(' ', '');
                }
            }
        }

        cb(cookie);
    },

    /*
     *
     */
    write: function(res, key, value, properties, minutes) {
        res.setHeader('Set-Cookie',
            key + '=' + value + ';' + properties +
            'expires=' + cookie.expiration(minutes) + ';'
        );
    },

    /*
     *
     */
    remove: function(reqCookies, res, key) {
        cookie.read(reqCookies, key, function(cookie) {
            if(cookie) {
                res.setHeader('Set-Cookie',
                    cookie + ';path=/;expires=' + '01 Jan 2000 00:00:00 GMT;'
                );
            }
        });
    }
};

module.exports = cookie;

