/**
 * Created by User on 12.06.2017.
 */
const mongoose = require('mongoose');
const config  = require('../config');
mongoose.Promise = global.Promise;

mongoose.connect(config.mongoose.url, function(){
    console.log('Connected to db');
   // mongoose.connection.db.dropDatabase();
});

module.exports = mongoose;