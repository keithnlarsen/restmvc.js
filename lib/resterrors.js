var sys = require('sys');
var baseObject = require('./baseobject');

var baseRestError = function() {
    var baseRestError = baseObject.extend({
        name: 'BaseRestError',
        title: 'Base Rest Error',
        description: '',
        message: '',

        _construct: function(message){
            this.message = message;
            Error.call(this, message);
            Error.captureStackTrace(this, arguments.callee);
        },

        toString: function(){
            return this.title + ": " + this.message;
        }
    });

    sys.inherits(baseRestError, Error);
    
    return baseRestError;
}();

module.exports.BaseRestError = baseRestError;

module.exports.RestError = {
    NotFound: baseRestError.extend({
        name: 'NotFound',
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        httpStatus: 404
    })
};

module.exports.ErrorMapper = errorMapper = function() {
    return {
        'NotFound': function(error, request, response){
            response.render('resterror.jade', {
                status: error.httpStatus,
                error: error
            });
        },
        'default': function(error, request, response) {
            response.render('500.jade', {
                status: 500,
                error: error
            });
        }
    }
}();

module.exports.ErrorHandler = function(error, request, response) {
    var errorHandler = errorMapper[error.name] || errorMapper['default'];

    errorHandler(error, request, response);
};