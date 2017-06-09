/**
 * Created by User on 09.06.2017.
 */
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const mongoose_simple_random = require('mongoose-simple-random');

let Book = require('./book');

const authorSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    }
});

authorSchema.plugin(mongoose_simple_random);
authorSchema.statics.findRandomAuthorsIDs = function(limit) {
    return new Promise((resolve, reject) => {
        this.findRandom({}, {}, {limit: limit}, (err, results) => {
            if (!err) {
                let authors = results.map((elem) => {
                    return elem._id;
                });
                resolve(authors);
            }
            else reject (err);
        });
    })
};

authorSchema.methods.findAllBooks = function () {
    return new Promise((resolve, reject) => {
        Book.find({authors : this._id}, function (err, res) {
            if (err) reject (err);
            resolve (res);
        })
    });

};

let Author = mongoose.model('Author', authorSchema);

module.exports = Author;