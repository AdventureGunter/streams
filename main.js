/**
 * Created by User on 08.06.2017.
 */
const generator = require('./generator/generate');
const parser = require('./parser/parse');
const config = require('./config');
const runTimer = require('./timer/timer');
const mongooseRequests = require ('./db/mongooseRequests');
const mongoose = require('./db/mongooseConfig');
let Author = require('./models/author');

runTimer();

mongoose.connect(config.mongoose.url, function(){
    console.log('Connected to db');
    //mongoose.connection.db.dropDatabase();
})
    /*.then(generator.generateAuthors)
    .then((msg) => {console.log(msg)})
    .then(parser.parseAuthorsToDB)
    .then((msg) => {console.log(msg)})
    .then(generator.generateBooks)
    .then((msg) => {console.log(msg)})
    .then(parser.parseBooksToDB)
    .then((msg) => {console.log(msg)})
    .then(() => Author.find().sort({id: -1}))*/
    /*.then((msg) => {console.log(msg)})
    .then(parser.parseBookFromDBtoJson)
    .then((msg) => {console.log(msg)})
    .then(() => mongooseRequests.findAllBooksForAuthor('593d994c2ceecd265c3fd2da'))
    .then((msg) => {console.log(msg)})
    .then(mongooseRequests.skip10authorsANDfindBooksForEach3dAuthor)
    .then((msg) => {console.log(msg)})
    .then(() => mongooseRequests.findAuthorsForBook('593d9ea12ceecd265c4257c9'))
    .then((msg) => {console.log(msg)})
    .then(mongooseRequests.populate1st10books)*/
    .then(mongooseRequests.createAuthorListWithBookCounter)
    .then((msg) => {console.log(msg)})
    .then(mongooseRequests.findBooksWithIdFinis0)
    .then((msg) => {console.log(msg)})
    .then(mongooseRequests.createBookListWithAuthorsObj)
    .then(() => Author.find().limit(10))
    .then((msg) => {
        console.log(msg);
         return mongoose.disconnect();

    })
    .then(() => {
        process.exit();
    })
    .catch(err => {console.log(err) } );
