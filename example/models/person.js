module.exports.person = function (mongoose) {
    // Standard Mongoose stuff here...
    var schema = mongoose.Schema;
//    var objectId = schema.ObjectId;

    mongoose.model('Person', new schema({
//        _id: objectId,
        firstName: String,
        lastName: String,
        initial: String,
        dateOfBirth: Date
    }));
    
    return mongoose.model('Person');
};
