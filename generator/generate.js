/**
 * Created by User on 07.06.2017.
 */
const fs = require('fs');
const csvWriter = require('csv-write-stream');
let config = require ('../config');

module.exports.generateBooks = function () {
    return new Promise((resolve,reject) => {
        let csvBooksStream = csvWriter();

        csvBooksStream.on('finish', () => {resolve('Books generation finished')});
        csvBooksStream.on('error', () => {reject('Books generation error')});

        csvBooksStream.pipe(fs.createWriteStream(config.books.filename));
        let i = config.books.length;
        write();
        function write() {
            let ok = true;
            do {
                i--;
                if (i === 0) {
                    csvBooksStream.write({id: 'id_' + i, title: 'title_' + i});
                    csvBooksStream.end();
                } else {
                    ok = csvBooksStream.write({id: 'id_' + i, title: 'title_' + i});
                }
            }
            while (i > 0 && ok);
            if (i > 0) {
                csvBooksStream.once('drain', write);
            }
        }
    });
};


module.exports.generateAuthors = function () {
    return new Promise((resolve,reject) => {
        let csvAuthorsStream = csvWriter();

        csvAuthorsStream.on('finish', () => {resolve('Authors generation finished')});
        csvAuthorsStream.on('error', () => {reject('Authors generation error')});

        csvAuthorsStream.pipe(fs.createWriteStream(config.authors.filename));
        let i = config.authors.length;
        write();
        function write() {
            let ok = true;
            do {
                i--;
                if (i === 0) {
                    csvAuthorsStream.write({id: 'id_' + i, firstName: 'firstName_' + i, lastName: 'lastName_' + i});
                    csvAuthorsStream.end();
                } else {
                    ok = csvAuthorsStream.write({id: 'id_' + i, firstName: 'firstName_' + i, lastName: 'lastName_' + i});
                }
            }
            while (i > 0 && ok);
            if (i > 0) {
                csvAuthorsStream.once('drain', write);
            }
        }
    });
};