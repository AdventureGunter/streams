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
}, {timestamps : true});

authorSchema.index({id : 1}, {sparse: true});
authorSchema.index({firstName: 1, lastName: 1}, {unique: true});

/*authorSchema.pre('save', (next) => {
    this.createdAt = new Date();
    next();
});

authorSchema.pre('update', (next) => {
    this.updatedAt= new Date();
    next();
});

authorSchema.pre('findOneAndUpdate', (next) => {
    this.updatedAt = new Date(next);
    next();

});*/

let Author = mongoose.model('Author', authorSchema);

module.exports = Author;