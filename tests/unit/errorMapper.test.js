var testFixture = require('nodeunit').testCase;
var restMVC = require('../../libs/restmvc');
var restError = restMVC.RestError;

exports['ErrorMapper'] = testFixture({
    setUp: function (callback) {
        callback();
    },

    tearDown: function (callback) {
        // Clean up
        callback();
    },

    'Should map NotFound Error to 404 NotFound response' : function(test){
        test.expect(1);

        var notFound = new restError.NotFound('Test Error');
        var mockRequest = {};
        var mockResponse = {
            send: function (content, status) {
                //test.equals(template, '404.jade');
                test.equals(status, '404');
                //test.equals(config.locals.error.message, "Test Error");
                test.done();
            }
        };

        restMVC.ErrorHandler(notFound, mockRequest, mockResponse);
    },

    'Should map Generic Errors to 500 InternalServerError response' : function(test){
        test.expect(1);

        var error = new Error('Test Error');
        var mockRequest = {};
        var mockResponse = {
            send: function (content, status) {
                //test.equals(template, '500.jade');
                test.equals(status, '500');
                //test.equals(config.locals.error.message, "Test Error");
                test.done();
            }
        };

        restMVC.ErrorHandler(error, mockRequest, mockResponse);
    }
});

