/*
 * Dependencies.
 */
function create(color, type, msg) {

    /*
     *
     * TODO
     *
     * create logfile with logging queue to remember wich logs has allready been written
     * and to minimize ressource usage for writing logs. use a delay of about 5 minutes.
     *
     */

    console.log('\x1B[' + color + '[' + type + '] ' + msg + '\x1B[0m');
}

/*
 * Log module.
 */
var log = {
    /*
     *
     */
    error: function(msg) {
        create('31m', 'ERROR', msg);
    },

    /*
     *
     */
    success: function(msg) {
        create('32m', 'SUCCESS', msg);
    },

    /*
     *
     */
    info: function(msg) {
        create('33m', 'INFO', msg);
    },

    /*
     *
     */
    debug: function(msg) {
        create('36m', 'DEBUG', msg);
    }
};

module.exports = log;
