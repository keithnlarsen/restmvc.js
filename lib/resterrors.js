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
            response.render('404.jade', {
                status: 404,
                locals: {
                    error: error
                }
            })
        }
    }
}();

exports.ErrorHandler = function(error, request, response) {
    var errorHandler = errorMapper[error.constructor.name];

    if (errorHandler){
        errorHandler(error, request, response);
    }
    else {
        response.render('500.jade', {
            status: 500,
            locals: {
                error: error
            }
        });
    }
};