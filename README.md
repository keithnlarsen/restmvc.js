RestMVC
=======

The goal of RestMVC is to  provide a simple framework that help you to write a RESTful webservice useing Nodejs, Express, Mongoose, and MongoDB.  It's goal is to take out the repetitive crap everyone hates doing, while staying out of your ways as much as possible and letting you do things how you want to.

## Features

This is the first checkin, but so far it will auto generate controllers, routes, and handle NotFound and 500 errors in a nice clean way.  You must structure your solution in a specific way to achieve this.

## Installation

I plan to get this setup in NPM very soon.

## Setup

I plan to provide a tool that will eventually auto-generate a project structure for you, but for now, you have to lay it out as follows.

    /controllers
    /controllers/person.js
    /models
    /models/person.js
    /routes
    /routes/person.js
    app.js

### Controllers

Your controllers must be implemented in a specific way such as:

    module.exports.personController = function(baseController, app){
        // Change the default plural name from persons to people
        baseController.plural = 'people';
        return baseController;

        //Example of how to extend the base controller if you need to...
        //var Controller = baseController.extend({
        //    toString: function(){
        //        // calls parent "toString" method without arguments
        //        return this._super(Controller, "toString") + this.name;
        //    }
        //});
    };

From this basic framework a controller that implements get(id), list(), insert(json), update(id, json), remove(id).  You may also add your own customer methods.

### Models

Your models must be implemented like the following:

    exports.person = function (mongoose) {
        var Schema = mongoose.Schema;
        var ObjectId = Schema.ObjectId;

        var Person = new Schema({
            _id: ObjectId,
            firstName: String,
            lastName: String,
            initial: String,
            dateOfBirth: Date
        });

        mongoose.model('Person', Person);

        return mongoose.model('Person');
    };

### Routes

Default routes are defined for:

  * GET /people/ - Lists all people in the database
  * GET /people/{id} - Gets a specific person
  * PUT /people/ JSON - Inserts a new record using the json passed in
  * POST /people/{id} JSON - Updates a record using the json passed in
  * DELETE /people/{id} - Deletes the specified record

Custom routes can be defined by adding something like the following to the routes folder:

    module.exports.employeeRoutes = function(employeeController, app){
        //Example route implemtation.
        app.get('/employees/:id', function(request, response, next) {
            employeeController.get(request.params.id, function(err, instance) {
                if (err)
                    next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
                else if (!instance)
                    next(new app.restError.NotFound('Employee Id: "' + request.params.id + '" was not found.'), request, response);
                else
                    response.send(instance.toObject());
            });
        });
    };

### Dependancies

So far this is dependant on:
  * Nodejs 0.4.1
  * Mongoose 1.0.10
  * MongoDB 1.6.5
  * Express 2.0beta2
  * NodeUnit 0.5.0

## Initialization

In your app.js file after connecting to mongoose and defining your express app, you should initialize everything like so:

    var restMVC = require('restmvc@0.1.0');
    restMVC.Initialize(app, mongoose);

You can then start your sever using app.listen...

## Other

RestMVC adds some basic stuff to you Express App object.  You'll find the following:

  * app.models[] - all your models are available here.
  * app.controllers[] - all your controllers are available here.
  * app.restErrors[] - the RestError infrastructure is available to you here for customization.

## RestErrors

It also binds app.error to restErrors.ErrorHandler which maps an error to an error handler so that error are automatically handled.  I've had some trouble getting rendering using views to work so I'm just using hard coded html.

So far only one error is handled, 404.  If you want to extend this, it is very easy to do.  Just do something like this in your app.js file.

    // Add a customer rest error for Forbidden
    function Forbidden (msg) {
        this.name = 'Forbidden';
        this.message = msg;
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    }

    sys.inherits(Forbidden, Error);

    restMVC.RestError.Forbidden = Forbidden;

    // Add a custom handler for Forbidden
    restMVC.ErrorMapper['Forbidden'] = function(error, request, response){
        response.send('<!DOCTYPE html><html><head><title>Forbidden</title></head><body><h2>Forbidden</h2></body></html>', 404);
        }
    }