module.exports.personController = function(baseController, restMvc){

    // this file is not neccessary but is here for demonstration perposes that you can.
    // you just need to return the controller, or one that extends the base one.
    return baseController;

//    Example of how to extend the base controller if you need to...
//    var Controller = baseController.extend({
//        toString: function(){
//            // calls parent "toString" method without arguments
//            return this._super(Controller, "toString") + " (Controller)";
//        }
//    });
};
