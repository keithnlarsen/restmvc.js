var baseObject = require('./baseobject');

module.exports = baseObject.extend({
    model : null,
    name : '',
    plural : '',

    _construct: function(model, name) {
        this.model = model;
        this.name = name;
        this.plural = name.pluralize();
    },

    show : function(id, fn) {
        this.model.findById(id, function(err, instance) {
            fn(err, instance);
        });
    },

    index : function(start, limit, fn) {
        // check if start is a function and swap
        if(typeof start === 'function') {
            fn = start;
            this.model.find({}, function (err, list) {
                fn(err, list);
            });
        }
        else{
            self = this;
            this.model.count({}, function (err, count) {
                var pager = {
                    from: start,
                    to: start + limit,
                    total: count
                };

                self.model.find({}).skip(start).limit(limit).find(function (err, list) {
                    fn(err, list, pager);
                });
            });

        }
    },

    update : function(id, json, fn){
        var options = { safe: true, upsert: false, multi: false};
        var self = this;

        try{
            this.model.update({_id: id}, json, function(err) {
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
        }
        catch(err){
            fn(err, null);
        }
    },

    insert : function(json, fn){
        var instance = new this.model(json);

        instance.save( function(err){
            fn(err, instance);
        });
    },

    destroy : function(id, fn){
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
