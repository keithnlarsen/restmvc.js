var fs = require('fs');
var path = require('path');
var restErrors = require('./resterrors');
var inflection = require('./inflection');
var registerRoutes = require('./routes');
var baseController = require('./basecontroller');
var restMvc = {};

module.exports.BaseRestError = restMvc.BaseRestError = restErrors.BaseRestError;
module.exports.RestError = restMvc.RestError = restErrors.RestError;
module.exports.ErrorMapper = restMvc.ErrorMapper = restErrors.ErrorMapper;
module.exports.ErrorHandler = restMvc.ErrorHandler = restErrors.ErrorHandler;
module.exports.Models = restMvc.Models = {};
module.exports.Controllers = restMvc.Controllers = {};
module.exports.cli = require('./cli').cli;
module.exports.BaseController = restMvc.BaseController = baseController;

module.exports.Initialize = restMvc.Initialize = function(app, mongoose) {
    var modelsPath = path.normalize(app.set('root') + '/models');

    fs.readdir(modelsPath, function(err, files){
        if (err) throw err;
        files.forEach(function(file){

            // Get the Model
            var name = file.replace('.js', '');
            var model = require(modelsPath + '/' + name)[name](mongoose);
            restMvc.Models[name] = model;

            // Create the base controller
            var controller = restMvc.BaseController.create(model, name);

            // Check for a custom controller, load it if exists
            var controllerPath = path.normalize(app.set('root') + '/controllers/') + name;
            path.exists(controllerPath + '.js', function(exists){
                if (exists) {
                    controller = require(controllerPath)[name + 'Controller'](controller, restMvc);
                }
                restMvc.Controllers[name] = controller;
                
                // Check for custom Routes, load if exists
                var routesPath = path.normalize(app.set('root') + '/routes/') + name;
                path.exists(routesPath + '.js', function(exists){
                    if (exists) {
                        require(routesPath)[name + 'Routes'](controller, app, restMvc);
                    }
                    // Register all the routes
                    registerRoutes(app, controller);
                });
            });
        });
    });
};
