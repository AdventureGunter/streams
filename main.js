/**
 * Created by User on 08.06.2017.
 */
const generator = require('./generator/generate');
const parser = require('./parser/parse');
const config = require('./config');
const runTimer = require('./timer/timer');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

runTimer();

mongoose.connect(config.mongoose.url)
    .then(
        () => {console.log('connected to db successfully')},
        (err) => {throw err}
    )
    .then(generator.generateBooks)
    .then((msg) => {console.log(msg)})
    .then(generator.generateAuthors)
    .then((msg) => {console.log(msg)})
    .then(parser.parseAuthorsToDB)
    .then((msg) => {console.log(msg)})
    .then(parser.parseBooksToDB)
    .then((msg) => {console.log(msg)})
    .then(parser.parseBookFromDBtoJson)
    .then((msg) => {
        console.log(msg);
        process.exit();
    })
    /*.then(generator.generateBooks)
    .then((msg) => {console.log(msg)})
    .then(generator.generateAuthors)
    .then((msg) => {console.log(msg)})
    .then(parser.parseAuthors)
    .then((msg) => {console.log(msg)})
    .then(parser.parseBooks)
    .then((msg) => {console.log(msg)})
    .then(parser.parseBookToAuthorsJson)
    .then((msg) => {
        console.log(msg);
        process.exit();
    })*/
    .catch(err => {console.log(err) } );
