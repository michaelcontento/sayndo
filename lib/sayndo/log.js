/*
 * Log helper.
 */
var logs = {
    /*
     *
     */
    create: function(color, type, msg) {
        return console.log('\x1B[' + color + '[' + type + '] ' + msg + '\x1B[0m');
    },

    /*
     *
     */
    error: function(msg) {
        this.create('31m', 'ERROR', msg);
    },

    /*
     *
     */
    success: function(msg) {
        this.create('32m', 'SUCCESS', msg);
    },

    /*
     *
     */
    info: function(msg) {
        this.create('33m', 'INFO', msg);
    },

    /*
     *
     */
    debug: function(msg) {
        this.create('36m', 'DEBUG', msg);
    }
};

module.exports = logs;
