/**
 * Created by User on 08.06.2017.
 */
const chai = require('chai');
const config = require('./config');
const fs = require('fs');
const assert = chai.assert;
const expect = chai.expect;
let LineByLineReader = require('line-by-line');

describe('STREAMS', () => {


    describe('CSV tests', () => {

        it('BOOKS.CSV consist ' + config.books.length + ' books', (done) => {
            let transformBooks = new LineByLineReader(config.books.filename);
            let counter = 0;
            transformBooks.on('line', (line) => {
                counter++;
            });
            transformBooks.on('error', (err) => {
                throw err;
            });
            transformBooks.on('end', () => {
                assert.equal(counter - 1, config.books.length);
                done();
            })
        });

        it('AUTHORS.CSV consist ' + config.authors.length + ' authors', (done) => {
            let transformAuthors = new LineByLineReader(config.authors.filename);
            let counter = 0;
            transformAuthors.on('line', (line) => {
                counter++;
            });
            transformAuthors.on('error', (err) => {
                throw err;
            });
            transformAuthors.on('end', () => {
                assert.equal(counter - 1, config.authors.length);
                done();
            })
        });
    });

    describe('JSON tests', () => {

        it('authors.json consist all books from authors.csv', (done) => {
            let authorsCsvStream = new LineByLineReader(config.authors.filename);
            let authorsCsvArr = [];
            let authorsJSONArr = [];
            authorsCsvStream.on('line', (line) => {
                let arr = line.split(',');
                authorsCsvArr.push(arr[0]);
            });
            authorsCsvStream.on('error', (err) => {
                throw err;
            });
            authorsCsvStream.on('end', () => {
                fs.readFile(config.authors.json, 'utf-8', (err, data)=> {
                    authorsCsvArr.shift();
                    authorsJSONArr = JSON.parse(data);
                    authorsJSONArr = authorsJSONArr.map((elem) => {
                        return elem.id;
                    });
                    let i = 0;
                    authorsCsvArr.map((elem) => {
                        assert.equal(authorsJSONArr[i], elem);
                        i++;
                    });
                    assert.equal(authorsCsvArr.length, authorsJSONArr.length);
                    done();
                });
            })
        });

        it('books.json consist all books from books.csv', (done) => {
            let booksCsvStream = new LineByLineReader(config.authors.filename);
            let booksCsvArr = [];
            let booksJSONArr = [];
            booksCsvStream.on('line', (line) => {
                let arr = line.split(',');
                booksCsvArr.push(arr[0]);
            });
            booksCsvStream.on('error', (err) => {
                throw err;
            });
            booksCsvStream.on('end', () => {
                readFile(config.authors.json)
                    .then((data) => {
                        booksCsvArr.shift();
                        booksJSONArr = JSON.parse(data);
                        booksJSONArr = booksJSONArr.map((elem) => {
                            return elem.id;
                        });
                        let i = 0;
                        booksCsvArr.map((elem) => {
                            assert.equal(booksJSONArr[i], elem);
                            i++;
                        });
                        assert.equal(booksCsvArr.length, booksJSONArr.length);
                        done();
                    })
                    .catch((err) => {throw err});
            })
        });

        it('books-to-authors.json author length between 1 and 3', (done) => {
            readFile(config.books_to_authors.filename)
                .then((data) => {
                    let authorCounter = 0;
                    let books_to_json_arr = JSON.parse(data);
                    [].concat(books_to_json_arr).map((elem) => {
                        assert.equal(elem.authors.length === 1 || elem.authors.length === 2 || elem.authors.length === 3, true);
                        authorCounter += elem.authors.length;
                    });
                    console.log(authorCounter + ' - Authors used');
                    done();
                })
                .catch((err) => {throw err});
        });

        /*it('AUTHORS.CSV consist ' + config.authors.length + ' authors', (done) => {
        });*/
    });
});

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) reject (err);
            else resolve (data);
        })
    });
}