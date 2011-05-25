var restErrors = require('./resterrors');

module.exports = function(app, controller) {
    app.get('/' + controller.plural + '/:id.:format?', function(request, response, next) {
        controller.index(request.params.id, function(err, instance) {
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(restErrors.RestError.NotFound.create(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else {
                if (request.params.format){
                    if (request.params.format.toLowerCase() == 'json'){
                        response.send(instance.toObject());
                    }
                    else{
                        next(restErrors.RestError.BadRequest.create('The \'' + request.params.format + '\' format is not supported at this time.'), request, response);
                    }
                }
                else{
                    var options = {};
                    options[controller.name] = instance.toObject();
                    response.render(controller.name + '/show', options );
                }
            }
        });
    });

    app.get('/' + controller.plural + '.:format?', function(request, response, next) {
        controller.list(function(err, results) {
            if (err) {
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            }
            else {
                if (request.params.format){
                    if (request.params.format.toLowerCase() == 'json') {
                        response.send(results.map(function(instance) {
                            return instance.toObject();
                        }));
                    }
                    else{
                        next(restErrors.RestError.BadRequest.create('The \'' + request.params.format + '\' format is not supported at this time.'), request, response);
                    }
                }
                else {
                    var options = {};
                    options[controller.plural] = results.map(function(instance) {
                        return instance.toObject();
                    });
                    response.render(controller.name, options);
                }
            }
        });
    });

    app.get('/' + controller.plural + '.:format??from=:from&to=:to', function(request, response, next) {
        controller.list(request.params.from, request.params.to, function(err, results, pager) {
            if (err) {
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            }
            else {
                if (request.params.format){
                    if (request.params.format.toLowerCase() == 'json') {
                        response.send(results.map(function(instance) {
                            return instance.toObject();
                        }));
                    }
                    else{
                        next(restErrors.RestError.BadRequest.create('The \'' + request.params.format + '\' format is not supported at this time.'), request, response);
                    }
                }
                else {
                    var options = {};
                    options[controller.plural] = results.map(function(instance) {
                        return instance.toObject();
                    });
                    options.pager = pager;
                    response.render(controller.name, options);
                }
            }
        });
    });

    app.get('/' + controller.plural + '/:id/:action', function(request, response, next) {
        controller.index(request.params.id, function(err, instance) {
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(restErrors.RestError.NotFound.create(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else {
                var options = {};
                options[controller.name] = instance.toObject();
                response.render(controller.name + '/' + request.params.action, options );
            }
        });
    });

    app.put('/' + controller.plural + '/:id.:format?', function(request, response, next) {
        var entity;
        if (request.params.format){
            if (request.params.format.toLowerCase() == 'json'){
                entity = request.body;
            }
            else{
                next(restErrors.RestError.BadRequest.create('The \'' + request.params.format + '\' format is not supported at this time.'), request, response);
            }
        }
        else{
            entity = request.body[controller.name];
        }

        controller.update(request.params.id, entity, function(err, instance){
            if (err)
                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
            else if (!instance)
                next(restErrors.RestError.NotFound.create(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else {
                if (request.params.format){
                    if (request.params.format.toLowerCase() == 'json'){
                        response.send(instance.toObject());
                    }
                }
                else{
                    var options = {};
                    options[controller.name] = instance.toObject();
                    response.render(controller.name + '/show', options );
                }
            }
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
                next(restErrors.RestError.NotFound.create(controller.name + ' Id: "' + request.params.id + '" was not found.'), request, response);
            else
                response.send(instance.toObject());
        });
    });
};
