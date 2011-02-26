var testFixture = require('nodeunit').testCase;
var restMVC = require('../../libs/restmvc');
var restError = restMVC.RestError;

exports['NotFound'] = testFixture({
    setUp: function (callback) {
        // Do set up
        callback();
    },

    tearDown: function (callback) {
        // Clean up
        callback();
    },

    'Should have constructor named NotFound' : function(test){
        test.expect(1);
        var NotFound = new restError.NotFound("Test Error");
        test.equals(NotFound.constructor.name, "NotFound");
        test.done();
    },

    'Should inherit from Error' : function(test){
        test.expect(1);
        var NotFound = new restError.NotFound("Test Error");
        test.equals(NotFound.constructor.super_.name, "Error");
        test.done();
    },

    'Should pass error message' : function(test){
        test.expect(1);
        var NotFound = new restError.NotFound("Test NotFound message.");
        test.equals(NotFound.message, "Test NotFound message.");
        test.done();
    },

    'Should throw NotFound error' : function(test){
        test.expect(3);

        try {
            throw new restError.NotFound("Test NotFound message.");
        }
        catch(err){
            test.equals(err.constructor.name, "NotFound");
            test.equals(err.constructor.super_.name, "Error");
            test.equals(err.message, "Test NotFound message.");
        }
        test.done();
    }
});

