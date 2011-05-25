var sys = require('sys');
var baseObject = require('./baseObject');

var baseRestError = function() {
    var baseRestError = baseObject.extend({
        name: 'RestError',
        title: 'Rest Error',
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

module.exports.RestError = restError = {
    BadRequest: baseRestError.extend({
        name: 'BadRequest',
        title: 'Bad Request',
        description: 'The request could not be understood by the server due to malformed syntax.',
        httpStatus: 400
    }),
    NotFound: baseRestError.extend({
        name: 'NotFound',
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        httpStatus: 404
    })
};

module.exports.ErrorMapper = errorMapper = function() {
    return {
        'RestError': function(error, request, response){
            if (process.env.NODE_ENV == 'debug'){
                console.log(error);
            }
            response.render('restError/restError.jade', {
                status: error.httpStatus,
                error: error
            });
        },
        'default': function(error, request, response) {
            if (process.env.NODE_ENV == 'debug' || process.env.NODE_ENV == 'release'){
               console.log(error);
            }
            response.render('restError/500.jade', {
                status: 500,
                error: error
            });
        }
    }
}();

module.exports.ErrorHandler = function(error, request, response) {
    var constructorName = error.prototype ? error.prototype.constructor.name : 'default';
    var errorHandler = errorMapper[error.name] || errorMapper[constructorName];

    errorHandler(error, request, response);
};