var sys = require('sys');

exports.RestError = function () {
    // 404 - NotFound
    function NotFound (msg) {
        this.name = 'NotFound';
        this.message = msg;
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    }

    sys.inherits(NotFound, Error);

    return {
        NotFound: NotFound
    };
}();

exports.ErrorMapper = errorMapper = function() {
    return {
        'NotFound': function(error, request, response){
// TODO: LOOKS LIKE A BUG IN EXPRESS HERE, won't set the status code...
//            response.render('404.jade', {
//                status: 404,
//                error: error
//            });
            response.send('<!DOCTYPE html><html><head><title>Not Found</title></head><body><div class="page"><h2>Page Not Found</h2><p>The resource you requested could not be found.</p><h3>Details</h3><pre>' + error.message + '</pre></div></body></html>',
                    404);
        }
    }
}();

exports.ErrorHandler = function(error, request, response) {
    var errorHandler = errorMapper[error.constructor.name];

    if (errorHandler){
        errorHandler(error, request, response);
    }
    else {
        response.send('<!DOCTYPE html><html><head><title>Server Error</title></head><body><div class="page"><h2>Error</h2><p>An Unexpected Server Error was encountered.</p><h3>Details</h3><pre>' + error.message + '</pre></div></body></html>',
                500);
    }
};