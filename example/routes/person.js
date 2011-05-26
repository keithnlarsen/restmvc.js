module.exports.personRoutes = function(personController, app, restMvc){

    //Example route implemtation. Uncomment for an example of how to implement a custom route.
//    app.get('/people.:format?', function(request, response, next) {
//
//        console.log('Overriden list route');
//
//        personController.index(function(err, results) {
//            if (err) {
//                next(new Error('Internal Server Error: see logs for details: ' +  err), request, response);
//            }
//            else {
//                if (request.params.format){
//                    if (request.params.format.toLowerCase() == 'json') {
//                        response.send(results.map(function(instance) {
//                            return instance.toObject();
//                        }));
//                    }
//                    else{
//                        next(restMvc.RestError.BadRequest.create('The \'' + request.params.format + '\' format is not supported at this time.'), request, response);
//                    }
//                }
//                else {
//                    response.render(controller.name, { collection: results.map(function(instance) {
//                        return instance.toObject();
//                    })});
//                }
//            }
//        });
//    })
};
