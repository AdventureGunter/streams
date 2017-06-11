/**
 * Created by User on 09.06.2017.
 */
const mongoose = require('../db/mongooseConfig');
const Schema = mongoose.Schema;

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

let Author = mongoose.model('Author', authorSchema);

module.exports = Author;