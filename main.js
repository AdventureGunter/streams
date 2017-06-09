/**
 * Created by User on 08.06.2017.
 */
const generator = require('./generator/generate');
const parser = require('./parser/parse');
const config = require('./config');
const runTimer = require('./timer/timer');

runTimer();

mongoose.connect(config.mongoose.url)
    .then(() => {console.log('connected to db success')})
    .then(generator.generateBooks)
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
    })
    .catch(err => {console.log(err) } );
