RestMVC
=======

The goal of RestMVC is to  provide a simple framework that help you to write a RESTful webservice useing Nodejs, Express, Mongoose, and MongoDB.  It's goal is to take out the repetitive crap everyone hates doing, while staying out of your ways as much as possible and letting you do things how you want to.

## Features

This is the first checkin, but so far it will auto generate controllers, routes, and handle NotFound and 500 errors in a nice clean way.  You must structure your solution in a specific way to achieve this.

## Setup

I plan to provide a tool that will eventually auto-generate a project structure for you, but for now, you have to lay it out as follows.

    /controllers
    /controllers/person.js
    /libs
    /libs/restmvc (this is where you need to put restmvc)
    /models
    /models/person.js
    /views
    /views/404.jade
    /views/500.jade
    /views/layout.jade
    app.js

### Controllers

Your controllers must be implemented in a specific way such as:

    exports.personController = function(baseController, app){

        var personController = function() {
            this.singularName = 'person';
            this.pluralName = 'people';
        };

        personController.prototype = baseController;
        return new personController();
    };

From this basic framework a controller that implements Get(id), List(), Put(json), Post(id, json), Remove(id).  You may also add your own customer methods.

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


### Dependancies

So far this is dependant on:
 * Nodejs of course
 * Mongoose 1.0.10
 * MongoDB
 * Express
 * NodeUnit

##Initialization

In your app.js file after connecting to mongoose and defining your express app, you should initialize everything like so:

    var restMVC = require('./libs/restmvc');
    restMVC.Initialize(app, mongoose);

You can then start your sever using app.listen...