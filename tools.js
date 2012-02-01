/*
 *
 * Server site tools module.
 *
 */

/*
 * Dependencies.
 */

var tools = {
    /*
     * Check if an item exists in an array.
     *
     * @param item, the item to check against an array.
     * @param array, the array to check against the item.
     *
     * @return booloean, if the item exists in the array or not.
     */
    inArray: function(item, array) {
        var i = 0
          , ii = array.length;

        for(i; i < ii; i++) {
            if(array[i] === item) {
                return true;
            }
        }

        return false;
    },
};

module.exports = tools;

