/*
 *
 * Server site app local module.
 *
 */

/*
 * Dependencies.
 */

var appLocals = {
    /*
     * Set the app title globaly.
     *
     * @return string, of the app name.
     */
    title: function() {
        return 'Sayndo';
    },

    /*
     * Get the session message html for each view.
     *
     * @param req, nodes request object.
     * @param res, nodes response object.
     *
     * @return concatinated html string containing the session message.
     */
    message: function(req, res) {
        var message = '<div class="message">'
          , sessionMessage = res.session.message;

        if(typeof sessionMessage === 'string'
        && sessionMessage.length != 0) {
            message += sessionMessage;

            res.session.update({message: ''});
        }

        message += '</div>';

        return message;
    },
};

module.exports = appLocals;
