/**
 * Created by User on 09.06.2017.
 */
const mongoose = require('../db/mongooseConfig');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    title:  {
        type: String,
        required: true,
        trim: true
    },
    authors: [{
        type : Schema.Types.ObjectId,
        ref: 'Author',
        required: true,
        index: true
    }]
});
/*
bookSchema.pre('save', (next) => {
    this.createdAt = new Date();
    next();
});

bookSchema.pre('update', (next) => {
    this.updatedAt= new Date();
    next();
});

bookSchema.pre('findOneAndUpdate', (next) => {
    this.updatedAt = new Date();
    next();
});*/

let Book = mongoose.model('Book', bookSchema);

module.exports = Book;