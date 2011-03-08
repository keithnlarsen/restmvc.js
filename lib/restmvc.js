var fs = require('fs');
var path = require('path');
var restErrors = require('./resterrors');

exports.RestError = restErrors.RestError;
exports.ErrorMapper = restErrors.ErrorMapper;
exports.ErrorHandler = restErrors.ErrorHandler;

var BaseObject = {
    create: function create() {
       var instance = Object.create(this);
       instance._construct.apply(instance, arguments);
       return instance;
    },

    extend: function extend(properties) {
        var propertyDescriptors = {};

        if(properties){
            var simpleProperties = Object.getOwnPropertyNames(properties);
            for (var i = 0, len = simpleProperties.length; i < len; i += 1) {
                var propertyName = simpleProperties[i];
                if(propertyDescriptors.hasOwnProperty(propertyName)) {
                    continue;
                }

                propertyDescriptors[propertyName] =
                    Object.getOwnPropertyDescriptor(properties, propertyName);
            }
        }

        return Object.create(this, propertyDescriptors);
    },

    _construct: function _construct() {},

    _super: function _super(definedOn, methodName, args) {
        if (typeof methodName !== "string") {
            args = methodName;
            methodName = "_construct";
        }

        return Object.getPrototypeOf(definedOn)[methodName].apply(this, args);
    }
};

exports.Initialize = initialize = function(app, mongoose) {
    if (!app.models) app.models = {};
    if (!app.controllers) app.controllers = {};
    if (!app.restError) app.restError = restErrors.RestError;
    app.error(restErrors.ErrorHandler);

    var modelsPath = path.normalize(app.set('root') + '/models');

    fs.readdir(modelsPath, function(err, files){
        if (err) throw err;
        files.forEach(function(file){
            
            // Get the Model
            var name = file.replace('.js', '');
            var model = require(modelsPath + '/' + name)[name](mongoose);
            app.models[name] = model;

            // Create the base controller
            var controller = baseController.create(model, name);

            // Check for a custom controller, load it if exists
            var controllerPath = path.normalize(app.set('root') + '/controllers/') + name;
            path.exists(controllerPath + '.js', function(exists){
                app.controllers[name] = controller = exists ? require(controllerPath)[name + 'Controller'](controller, app) : controller;

                // Register all the routes
                registerRoutes(app, controller);

                // Check for custom Routes, load if exists
                var routesPath = path.normalize(app.set('root') + '/routes/') + name;
                path.exists(routesPath + '.js', function(exists){
                    if (exists) require(routesPath)[name + 'Routes'](controller, app);
                });
            });
        });
    });
};

exports.BaseController = baseController = BaseObject.extend({
    model : null,
    name : '',
    plural : '',

    _construct: function(model, name) {
        this.model = model;
        this.name = name;
        this.plural = name + 's';
    },

    get : function(id, fn) {
        this.model.findById(id, function(err, instance) {
            fn(err, instance);
        });
    },

    list : function(fn) {
        this.model.find({}, function(err, list) {
            fn(err, list);
        });
    },

    update : function(id, json, fn){
        var options = { safe: true, upsert: false, multi: false};
        var self = this;
        this.model.update({_id: id}, json, options, function(err) {
            if (err){
                // TODO: Swallowing this error is bad, but this seems to be thrown when mongo can't find the document we are looking for.
                if (err == 'Error: Element extends past end of object')
                    fn(null, null);
                else
                    fn(err, null);
            }
            else {
                self.model.findById(id, function(err, instance) {
                    fn(err, instance);
                });
            }
        });
    },

    insert : function(json, fn){
        var instance = new this.model(json);

        instance.save( function(err){
            fn(err, instance);
        });
    },

    remove : function(id, fn){
        this.model.findById(id, function(err, instance) {
            if (instance) {
                instance.remove(function(err){
                    fn(err, instance)
                });
            }
            else {
                fn(err, instance);
            }
        });
    }
});

exports.RegisterRoutes = registerRoutes = function(app, controller) {
    var restError = restErrors.RestError;

    app.get('/' + controller.plural + '/:id', function(request, response, next) {
        controller.get(request.params.id, function(err, instance) {
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(new restError.NotFound(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });

    app.get('/' + controller.plural, function(request, response) {
        controller.list(function(err, results) {
            if (err) {
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            }
            else {
                response.send(results.map(function(instance) {
                    return instance.toObject();
                }));
            }
        });
    });

    app.put('/' + controller.plural + '/:id', function(request, response, next) {
        controller.update(request.params.id, request.body, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(new restError.NotFound(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });

    app.post('/' + controller.plural, function(request, response, next) {
        controller.insert(request.body, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else
                response.send(instance.toObject(), null, 201);
        });
    });

    app.del('/' + controller.plural + '/:id', function(request, response, next) {
        controller.remove(request.params.id, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(new restError.NotFound(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });
};