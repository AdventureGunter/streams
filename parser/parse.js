/**
 * Created by User on 07.06.2017.
 */
const fs = require('fs');
const csv2json = require('csv2json');
const LineByLineReader = require('line-by-line');
const mongoose = require('../db/mongooseConfig');

process.setMaxListeners(20);

let Author = require('../models/author');
let Book = require('../models/book');
let config = require('../config');

function delay (duration) {
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, duration)
    });
}

module.exports.parseBookToAuthorsJson =  function () {
    return new Promise((resolve, reject) => {
        const booksToAuthors = fs.createWriteStream(config.books_to_authors.filename);
        booksToAuthors.on('finish', () => {resolve('parse Book To AuthorsJson json finished')});
        booksToAuthors.on('error', () => {reject('parse Book To AuthorsJson json ERROR')});
        booksToAuthors.on('drain', () => {console.log('darin')});
        let bookObj = {id:'', title: '', authors: []};

        let transformBooks = new LineByLineReader(config.books.filename),
            transformAuth = new LineByLineReader(config.authors.filename);

        transformAuthSetEvents();
        transformBooksSetEvents();

        let isFirstBookLine = true;
        let isFirsAuthtLine = true;

        let booksToAuthorsCounter = 0;
        let authorsCounter = 0;
        let authorsRandCounter = 0;


        function transformBooksSetEvents() {
            transformBooks.on('line', function(line) {

                if (!isFirstBookLine) {

                    let arr = line.split(',');

                    bookObj.id = arr[0];
                    bookObj.title = arr[1];

                    authorsRandCounter =
                        Math.floor(Math.random() * (config.books_to_authors.from_number - config.books_to_authors.to_number) + config.books_to_authors.to_number);
                    transformBooks.pause();
                    transformAuth.resume();

                }
                else isFirstBookLine = false;
            });
        }

        function transformAuthSetEvents() {
            transformAuth.on('line', function(line) {

                if (!isFirsAuthtLine) {

                    let arr = line.split(',');
                    if(arr[0] === 'id_0') {
                        authorsCounter = 0;
                        isFirsAuthtLine = true;
                        transformAuth = new LineByLineReader(config.authors.filename);
                        transformAuthSetEvents();
                    }
                    bookObj.authors.push({
                        id : arr[0],
                        firstName: arr[1],
                        lastName: arr[2]
                    });
                    authorsCounter++;
                    authorsRandCounter --;

                    if (authorsRandCounter === 0) {
                        transformAuth.pause();
                        if (booksToAuthorsCounter === config.books.length - 1) {
                            booksToAuthors.write(JSON.stringify(bookObj) + '\r\n]');
                            console.log('finished ' + booksToAuthorsCounter + ' ' + bookObj.id);
                            booksToAuthors.end();
                        }
                        else  {
                            booksToAuthors.write(JSON.stringify(bookObj) + ',\r\n');
                            booksToAuthorsCounter++;
                            bookObj = {id:'', title: '', authors: []};
                        }

                        transformBooks.resume();
                    }
                }
                else {
                    if (booksToAuthorsCounter === 0) booksToAuthors.write('[\r\n');
                    isFirsAuthtLine = false;
                }
            });
        }

    });
};

module.exports.parseAuthors = function () {
    return new Promise((resolve, reject) => {

        let authorsWS = fs.createWriteStream(config.authors.json);
        authorsWS.on('finish', () => {resolve('Authors parse finished')});
        authorsWS.on('error', () => {reject('Authors parse error')});

        fs.createReadStream(config.authors.filename)
            .pipe(csv2json({
            }))
            .pipe(authorsWS);
    });
};

module.exports.parseBooks = function() {
    return new Promise((resolve, reject) => {

        let booksWS = fs.createWriteStream(config.books.json);
        booksWS.on('finish', () => {resolve('Books parse finished')});
        booksWS.on('error', () => {reject('Books parse error')});

        fs.createReadStream(config.books.filename)
            .pipe(csv2json({
            }))
            .pipe(booksWS);
    });
};


// --------- DB parsers --------- //

// --------- Book handlers ------ //

module.exports.parseBooksToDB = function() {
    return new Promise((resolve, reject) => {
        let currDate = Date.now();
        let booksReadByLineStream = new LineByLineReader(config.books.filename, {start: 9});
        let createPromArr = [];
        let counter = 0;

        booksReadByLineStream.on('line', (line) => {
            counter++;

            createPromArr.push(generateBookCreateProm(line));

            if (createPromArr.length === 250 || counter === config.books.length)  {
                console.log(counter);
                booksReadByLineStream.pause();
                Promise.all(createPromArr)
                    .then(() => {
                        createPromArr = [];
                        if (process.memoryUsage().heapUsed >= 1048576*40) {
                            return delay(24000)
                        }
                    })
                    .then(() => {
                        createPromArr = [];
                    })
                    .then(() => {
                        booksReadByLineStream.resume();
                    })
                    .catch((err) => {console.log(err)});
            }
        });
        booksReadByLineStream.on('error', (err) => {
            reject (err);
        });
        booksReadByLineStream.on('end', () => {
            console.log(Date.now() - currDate);
            resolve ('Books parsed to mongoose')
        })
    });
};

function generateBookCreateProm (line) {
    let lineBookArr = line.split(',');
    let authorsRandCounter =
        Math.floor(Math.random() * (config.books_to_authors.from_number - config.books_to_authors.to_number) + config.books_to_authors.to_number);

    return Author.find().limit(authorsRandCounter).skip(Math.random() * (1 - config.authors.length) + config.authors.length)
        .then((obj) => {
            return findOrCreate(Book, {
                id: lineBookArr[0],
                title: lineBookArr[1],
                authors: obj
            })
        })
        .catch((err) => {console.log(err)})
}

module.exports.parseBookFromDBtoJson = function  () {
    let counter = 0;
    return new Promise((resolve, reject) => {

        const booksDBToJson = fs.createWriteStream(config.mongoose.booksJsonPath, 'UTF-8');
        Book.find().cursor({transform: transformToJson}).pipe(booksDBToJson);
        booksDBToJson.on('finish', () => {
            resolve('parse Book From DB To json finished')
        });
        booksDBToJson.on('error', (err) => {
            reject(err)
        });
    });

    function transformToJson (data) {
        counter++;
        if (counter === 1) return '[' + '\r\n' + JSON.stringify(data) + ",";
        if (counter === config.books.length) return '\r\n' + JSON.stringify(data) + '\r\n]';
        return '\r\n' + JSON.stringify(data) + ",";
    }
};

// --------- Author handlers ------ //

module.exports.parseAuthorsToDB = function() {
    return new Promise((resolve, reject) => {
        let currDate = Date.now();
        let authorsReadByLineStream = new LineByLineReader(config.authors.filename, {start: 22});
        let createPromArr = [];
        let counter = 0;

        authorsReadByLineStream.on('line', (line) => {
            counter++;
            createPromArr.push(generateAuthorCreatProm(line));
            if (createPromArr.length === 250 || counter === config.authors.length)  {
                console.log(counter);
                authorsReadByLineStream.pause();

                Promise.all(createPromArr)
                    .then(() => {
                        createPromArr = [];
                        if (process.memoryUsage().heapUsed >= 1048576*40) {
                            return delay(24000)
                        }
                    })
                    .then(() => {
                        return createPromArr = [];
                    })
                    .then(() => {
                        return authorsReadByLineStream.resume();
                    })
                    .catch((err) => {console.log(err)});
            }

        });
        authorsReadByLineStream.on('error', (err) => {
            reject (err);
        });
        authorsReadByLineStream.on('end', () => {
            console.log(Date.now() - currDate);
            resolve ('Authors parsed to mongoose')
        })
    });
};

function generateAuthorCreatProm (line) {
    let lineAuthorArr = line.split(',');

    return findOrCreate(Author, {
        id: lineAuthorArr[0],
        firstName: lineAuthorArr[1],
        lastName: lineAuthorArr[2]
    }).catch((err) => {console.log(err)})
}


function findOrCreate (Model, creatingObj) {
    return Model.findOneAndUpdate({id: creatingObj.id}, creatingObj, {upsert : true})
        .catch((err) => err)
}


// SUPER AHUENNA9 FI4A, NIKOMU NE PIZDIT`

/*
 module.exports.parseAuthorsToDB = function() {
 return new Promise((resolve, reject) => {

 class myEmmiter extends EventEmitter {
 constructor() {
 super();
 }
 }
 const myEmmiter1 = new myEmmiter();
 myEmmiter1.setMaxListeners(0);
 let currDate = Date.now();
 let counter = 0;
 let linesInBytes = 22;
 let delTime = 400;
 let createPromArr = [];

 myEmmiter1.on('length', (stream) =>{
 /!*if (counter > 2000) {
 delTime = 4;
 }*!/
 stream.end();
 Promise.all(createPromArr.reduce((Promises, authorObj) => {
 Promises.push(findOrCreate(Author,authorObj));
 return Promises;
 }, []))
 .then(() => {

 if (counter < 2000) {
 console.log(counter);
 return delay(200)
 }
 })
 .then(() => {
 createPromArr = [];
 return setStreamEvents();
 })
 });

 myEmmiter1.on('last', (stream) =>{
 console.log(counter);
 stream.end();
 Promise.all(createPromArr.reduce((Promises, authorObj) => {
 Promises.push(findOrCreate(Author,authorObj));
 return Promises;
 }, []))
 .then(() => {
 createPromArr = [];
 resolve('Authors Parsed to DB');
 console.log(Date.now() - currDate);
 })
 });

 function setStreamEvents () {
 let authorsReadByLineStream = new LineByLineReader(config.authors.filename,
 {start : linesInBytes}
 );
 authorsReadByLineStream.on('line', (line) => {
 linesInBytes += String(line).split('').length + 1;
 let lineAuthorArr = line.split(',');
 let authorObj = {
 id: lineAuthorArr[0],
 firstName: lineAuthorArr[1],
 lastName: lineAuthorArr[2]
 };
 createPromArr.push(authorObj);
 counter++;
 authorsReadByLineStream.pause();
 if (counter === config.authors.length) {
 myEmmiter1.emit('last', authorsReadByLineStream);
 console.log(counter);
 }
 else if (createPromArr.length === 20) {
 myEmmiter1.emit('length', authorsReadByLineStream);
 }
 else authorsReadByLineStream.resume();
 });

 authorsReadByLineStream.on('error', (err) => {
 reject (err);
 });
 authorsReadByLineStream.on('end', () => {
 })
 }
 setStreamEvents();
 })
 };*/
