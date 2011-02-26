var fs = require('fs');
var path = require('path');
var restErrors = require('./resterrors');

exports.RestError = restErrors.RestError;
exports.ErrorMapper = restErrors.ErrorMapper;
exports.ErrorHandler = restErrors.ErrorHandler;

exports.Initialize = initialize = function(app, mongoose) {
    if (!app.models) app.models = {};
    if (!app.controllers) app.controllers = {};
    if (!app.restError) app.restError = restErrors.RestError;
    app.error(restErrors.ErrorHandler);

    var controllersPath = path.normalize(__dirname + '../../../../controllers');

    fs.readdir(controllersPath, function(err, files){
        if (err) throw err;
        files.forEach(function(file){
            var name = file.replace('.js', '');
            var model = require('../../../models/' + name)[name](mongoose);
            app.models[name] = model;

            var cont = baseController(model);
            var controller = require('../../../controllers/' + name)[name + 'Controller'](cont, app);
            app.controllers[name] = controller;

            registerRoutes(app, controller);
        });
    });
};

exports.BaseController = baseController = function(model){
    return {
        get : function(id, fn) {
            model.findById(id, function(err, instance) {
                fn(err, instance);
            });
        },

        list : function(fn) {
            model.find({}, function(err, list) {
                fn(err, list);
            });
        },

        save : function(id, json, fn){
            var options = { safe: true, upsert: false, multi: false};

            model.update({_id: id}, json, options, function(err) {
                if (err){
                    // TODO: Swallowing this error is bad, but this seems to be thrown when mongo can't find the document
                    // we are looking for, should be cleaned up
                    if (err == 'Error: Element extends past end of object')
                        fn(null, null);
                    else
                        fn(err, null);
                }
                else {
                    model.findById(id, function(err, instance) {
                        fn(err, instance);
                    });
                }
            });
        },

        create : function(json, fn){
            var instance = new model(json);

            instance.save( function(err){
                fn(err, instance);
            });
        },

        remove : function(id, fn){
            model.findById(id, function(err, instance) {
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
    }
};

exports.RegisterRoutes = registerRoutes = function(app, controller) {
    var restError = restErrors.RestError;

    app.get('/' + controller.pluralName + '/:id', function(request, response, next) {
        controller.get(request.params.id, function(err, instance) {
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(new restError.NotFound(controller.singularName + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });

    app.get('/' + controller.pluralName, function(request, response) {
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

    app.put('/' + controller.pluralName + '/:id', function(request, response, next) {
        var data = request.body;

        controller.save(request.params.id, data, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(new restError.NotFound(controller.singularName + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });

    app.post('/' + controller.pluralName, function(request, response, next) {
        var data = request.body;

        controller.create(data, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else
                response.send(instance.toObject(), null, 201);
        });
    });

    app.del('/' + controller.pluralName + '/:id', function(request, response, next) {
        controller.remove(request.params.id, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(new restError.NotFound(controller.singularName + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });
};