/**
* @param {?} response - Some response object
* @param {Function} callback
*/
function cbHandler(response, callback) {
    if (!callback) {
        return;
    }
    
    if (response instanceof Error) {
        return callback({
            error: response.message
        });
    }
    
    return callback(response);
}

module.exports = exports = cbHandler;