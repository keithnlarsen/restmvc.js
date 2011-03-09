exports.person = function (mongoose) {
    // Standard Mongoose stuff here...
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
