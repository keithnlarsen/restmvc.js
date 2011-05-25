var createJSON = "{\"firstName\":\"Test\",\"lastName\":\"User\",\"dateOfBirth\": \"10/07/1971\"}";
var updateJSON = "{\"firstName\":\"Test2\",\"lastName\":\"User2\",\"dateOfBirth\": \"10/07/1971\"}";
var newPersonId = '';

var http = require('http');
var TestFixture = require('nodeunit').testCase;

module.exports['HTTP Method'] = TestFixture({
    setUp: function (callBack) {

        this.localhost = http.createClient(3000, 'localhost');

        this.requestHelper = function(request, fn){
            request.end();

            request.on('response', function (response) {
                var responseBody = "";
                response.setEncoding('utf8');

                response.addListener("data", function(chunk) {
                    responseBody += chunk;
                });

                response.on('end', function() {
                    response.body = responseBody;
                    fn(response);
                });
            });
        };

        callBack();
    },

    tearDown: function (callBack) {
        // clean up
        callBack();
    },

    'POST Should create a new Person' : function(test){
        var request = this.localhost.request('POST', '/People.json', {'Host': 'localhost', 'Accept': 'application/json', 'Content-Type': 'application/json'});
        request.write(createJSON);

        this.requestHelper(request, function(response){
            var actualPerson = JSON.parse(response.body);
            var expectedPerson = JSON.parse(createJSON);

            newPersonId = actualPerson._id;
            //console.log(actualPerson);

            test.ok(newPersonId != null);
            test.equals(expectedPerson.firstName, actualPerson.firstName);
            test.equals(expectedPerson.lastName, actualPerson.lastName);
//            test.equals(new Date(expectedPerson.dateOfBirth), new Date(actualPerson.dateOfBirth));

            test.equals(response.statusCode, 201);

            test.done();
        });
    },

    'GET Should return a single Person when calling /People/{ID}.json' : function(test){
        var request = this.localhost.request('GET', '/People/' + newPersonId + '.json', {'Host': 'localhost', 'Accept': 'application/json'});

        this.requestHelper(request, function(response){
            var actualPerson = JSON.parse(response.body);
            var expectedPerson = JSON.parse(createJSON);

            test.equals(expectedPerson.firstName, actualPerson.firstName);
            test.equals(expectedPerson.lastName, actualPerson.lastName);
//            test.equals(expectedPerson.dateOfBirth, actualPerson.dateOfBirth);

            test.equals(response.statusCode, 200);
            test.done();
        });
    },

    'GET Should get a Bad Request when calling /People/{ID}.xml' : function(test){
        var request = this.localhost.request('GET', '/People/' + newPersonId + '.xml', {'Host': 'localhost', 'Accept': 'application/json'});

        this.requestHelper(request, function(response){
            test.equals(response.statusCode, 400);
            test.done();
        });
    },

    'PUT Should update an existing Person' : function(test){
        var request = this.localhost.request('PUT', '/People/' + newPersonId + '.json', {'Host': 'localhost', 'Accept': 'application/json', 'Content-Type': 'application/json'});
        request.write(updateJSON);

        this.requestHelper(request, function(response){
            var actualPerson = JSON.parse(response.body);
            var expectedPerson = JSON.parse(updateJSON);

            test.equals(expectedPerson.firstName, actualPerson.firstName);
            test.equals(expectedPerson.lastName, actualPerson.lastName);
//            test.equals(expectedPerson.dateOfBirth, actualPerson.dateOfBirth);

            test.equals(response.statusCode, 200);

            test.done();
        });
    },

    'PUT Should return 404 when trying to Update Person That Doesn\'t Exist' : function(test){
        var request = this.localhost.request('PUT', '/People/XXXXX.json', {'Host': 'localhost', 'Accept': 'application/json', 'Content-Type': 'application/json'});
        request.write(updateJSON);

        this.requestHelper(request, function(response){
            test.ok(response.body.length > 0);
            test.equals(response.statusCode, 404);
            test.done();
        });
    },

    'GET Should return all people when calling /People.json' : function(test){
        var request = this.localhost.request('GET', '/People.json', {'Host': 'localhost', 'Accept': 'application/json'});

        this.requestHelper(request, function(response){
            test.equals(response.statusCode, 200);
            test.ok(response.body.length > 0);
            test.done();
        });
    },

    'GET Should return a 404 when calling /People/{ID} with an ID that doesn\'t exist' : function(test){
        var request = this.localhost.request('GET', '/People/XXXXX.json', {'Host': 'localhost', 'Accept': 'application/json'});

        this.requestHelper(request, function(response){
            test.ok(response.body.length > 0);
            test.equals(response.statusCode, 404);
            test.done();
        });
    },

    'DELETE Should delete person when calling /People/{ID}' : function(test){
        var request = this.localhost.request('DELETE', '/People/' + newPersonId, {'Host': 'localhost', 'Accept': 'application/json'});

        this.requestHelper(request, function(response){
            test.equals(response.statusCode, 200);
            test.done();
        });
    },

    'DELETE Should return a 404 when calling /People/{ID} with an ID that doesn\'t exist' : function(test){
        var request = this.localhost.request('DELETE', '/People/XXXXX', {'Host': 'localhost', 'Accept': 'application/json'});

        this.requestHelper(request, function(response){
            test.equals(response.statusCode, 404);
            test.done();
        });
    }
});
