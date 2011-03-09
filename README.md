RestMVC
=======

The goal of RestMVC is to  provide a simple framework that helps you to write a RESTful webservice using NodeJs, Express, Mongoose, and MongoDB.  It's goal is to take out the repetitive crap everyone hates doing, while staying out of your ways as much as possible and letting you do things how you want to.

## Contribute

This project is just begining, it arose from my attempts to create a RESTfull service and discovering that it wasn't as easy as I would have liked.  I'd really appreciate any contributions, bug reports, advice, or suggestions for improvement.

## Features

This is the first release, but so far given a mongoose model object it will:

 * Auto-generate controllers
 * Auto-generate routes
 * Handle 'NotFound' and '500' errors in a nice clean way.

Planned in the near future:

 * Security.
 * More complex List actions on the controller.
 * Tool that auto-generates a template project for you.
 * More error types.
 
## Installation

    npm install restmvc.js

### Dependancies

So far this is dependant on:

  * Nodejs 0.4.1
  * Mongoose 1.0.10
  * MongoDB 1.6.5
  * Express 2.0beta2
  * NodeUnit 0.5.0
  * Node-Jake

## Setup

I plan to provide a tool that will eventually auto-generate a project structure for you, but for now, you have to lay it out as follows.

    /controllers
    /controllers/{entity_name}.js
    /models
    /models/{entity_name}.js
    /routes
    /routes/{entity_name}.js
    app.js

### Creating a Model

Models are just standard Mongoose models, you can create a new model by creating a javascript file inside of the 'models' folder.  You need to name the file, and the export the same.  Your object will get a Mongoose object passed to it, you use that to create your model.

Here's an example of how you'd define one:

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

### Creating a Controller

You don't have to do anything to create a basic controller, one that provides get, list, insert, update, and remove is generated for you.  However if you wanted to extend or change the base controller, you'd create a file inside of the 'controllers' folder and name it the same as your model file.  The file should export an object named {entity_name}Controller, for example personController.

Here's an example of how you'd define one:

    module.exports.personController = function(baseController, restMvc){
        // By default pluralization are done by adding 's'
        // you can change the default plural name from persons to people like so
        baseController.plural = 'people';
        return baseController;
    }

From this basic framework a controller that implements:

  * get(id)
  * list(),
  * insert(json)
  * update(id, json)
  * remove(id)

You can extend the base functionality by defining your controller something like this:

    module.exports.personController = function(baseController, restMvc){
        // Change the default plural name from 'persons' to 'people'
        baseController.plural = 'people';

        //Example of how to extend the base controller if you need to...
        var extendedController = baseController.extend({
            toString: function(){
                // calls parent "toString" method without arguments
                return this._super(extendedController, "toString") + this.name;
            }
        });

        return extendedController;
    };

### Routes

The default routes that get added to your express app are:

  * GET /{entity_plural_name}/ - Lists all people in the database
  * GET /{entity_plural_name}/{id} - Gets a specific person
  * PUT /{entity_plural_name}/ JSON - Inserts a new record using the json passed in
  * POST /{entity_plural_name}/{id} JSON - Updates a record using the json passed in
  * DELETE /{entity_plural_name}/{id} - Deletes the specified record

You don't need to define a route at all as they are setup for you, but if you want to extend the defaults by defining routes for your entity type, it would look something like the following:

    module.exports.employeeRoutes = function(employeeController, app, restMvc){
        //Example route implemtation.
        app.get('/employees/:id', function(request, response, next) {
            employeeController.get(request.params.id, function(err, instance) {
                if (err)
                    next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
                else if (!instance)
                    next(new restMvc.RestError.NotFound('Employee Id: "' + request.params.id + '" was not found.'), request, response);
                else
                    response.send(instance.toObject());
            });
        });
    };

## Initialization

In your app.js file after connecting to mongoose and defining your express app, you should initialize everything like so:

    var express = require('express@2.0.0beta2');
    var restMVC = require('restmvc@0.0.2');
    var mongoose = require('mongoose@1.0.10');

    var app = module.exports = express.createServer();

    mongoose.connect('mongodb://localhost/restmvc');

    ... a bunch of standard app configuration junk ...

    restMVC.Initialize(app, mongoose);

    app.error(restMVC.ErrorHandler);

    if (!module.parent) {
        app.listen(3000);
        console.log('Server running at http://127.0.0.1:3000/' + '\r');
    }

You can then start your sever using app.listen...

## Customize RestErrors

So far only one error is handled, 404.  If you want to extend this, it is very easy to do.  Just do something like this in your app.js file.

    // Add a custom rest error for Forbidden
    restMVC.RestError.Forbidden = function (msg) {
        this.name = 'Forbidden';
        this.message = msg;
        Error.call(this, msg);
        Error.captureStackTrace(this, arguments.callee);
    }

    sys.inherits(restMVC.RestError.Forbidden, Error);

    // Add a custom handler for Forbidden
    restMVC.ErrorMapper['Forbidden'] = function(error, request, response){
            response.send('<!DOCTYPE html><html><head><title>Forbidden</title></head><body><h2>Forbidden</h2></body></html>', 403);
        }
    }

## API

RestMVC make all the models, controllers, and RestErrors junk available to you via the following:

  * restMVC.Models[] - all your models are available here by name, such as: var personModel = restMVC.Models['person'];
  * restMVC.Controllers[] - all your controllers are available here by name, such as: var personController = restMVC.Controllers['person'];
  * restMVC.RestError - the RestError infrastructure is available to you here for customization.
  * restMVC.ErrorMapper - this defines what the error handler does when it gets passed a particular error.
  * restMVC.ErrorHandler - this is used by the Express app to handle the errors, actually you have to wire this up by doing: app.error(restMVC.ErrorHandler);
  * restMVC.Initialize(app, mongoose) - This is what kicks off everything, called by you in your app.js file.
  * restMVC.BaseController - This is the base controller that all others are created from, exposed for testing purposes.
  * restMVC.RegisterRoutes(app, controller) - Registers the default routes for the default controller, exposed for testing purposes.