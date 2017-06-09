/**
 * Created by User on 09.06.2017.
 */
const mongoose = require('mongoose');
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
        required: true
        //unique: true || не работает???в новой монге есть тчо-то для этого, нужно гуглить
    }]
});


bookSchema.method.findAuthors = function () {
    return this.get('authors');
};


let Book = mongoose.model('Book', bookSchema);

module.exports = Book;