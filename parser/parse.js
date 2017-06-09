/**
 * Created by User on 07.06.2017.
 */
const fs = require('fs');
const csv2json = require('csv2json');
let config = require('../config');

module.exports.parseBookToAuthorsJson =  function () {
    return new Promise((resolve, reject) => {
        const booksToAuthors = fs.createWriteStream(config.books_to_authors.filename);
        booksToAuthors.on('finish', () => {resolve('parse Book To AuthorsJson json finished')});
        booksToAuthors.on('error', () => {reject('parse Book To AuthorsJson json ERROR')});
        booksToAuthors.on('drain', () => {console.log('darin')});
        let bookObj = {id:'', title: '', authors: []};


        let LineByLineReader = require('line-by-line'),
            transformBooks = new LineByLineReader(config.books.filename),
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
                        console.log('AAAAAAAAAAAAAA');
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