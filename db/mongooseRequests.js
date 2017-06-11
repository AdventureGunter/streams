/**
 * Created by User on 12.06.2017.
 */
let Author = require('../models/author');
let Book = require('../models/book');
let fs = require('fs');

function findAllBooksForAuthor (authorID) {
    return Author.findOne({_id: authorID})
        .then(() => Book.find({authors : authorID}))
        .catch((err) => err)
}

module.exports.findAuthorsForBook = function (booksId) {
    return Book.findOne({_id : booksId})
        .then((book) => {
            return Author.find({_id : book.authors})
        })
        .catch((err) => err)
};

module.exports.findAllBooksForAuthor = findAllBooksForAuthor;

module.exports.populate1st10books = function () {
    return new Promise((resolve, reject) => {
        Book
            .find().limit(10)
            .populate(
                'authors'
            )
            .exec((err, data) => {
                if (err) reject (err);
                resolve (data);
            });
    })
};

module.exports.skip10authorsANDfindBooksForEach3dAuthor = function () {
    return new Promise((resolve, reject) => {
        let BookCounter = 0;
        const skip10authorsANDfindBooksForEach3dAuthor = fs.createWriteStream('./json/allBooksForEach3dAuthor.json', 'UTF-8');
        let stream = Author.find().skip(10).cursor();
        let counter = 1;
        let writeString = '';
        skip10authorsANDfindBooksForEach3dAuthor.write('[' + '\r\n');
        stream.on('data', (data) => {
            console.log(BookCounter);
            if (BookCounter === 1500) {
                console.log(BookCounter);
                stream.pause();
                skip10authorsANDfindBooksForEach3dAuthor.write(writeString);
                writeString = '';
                BookCounter = 0;
                stream.resume();
            }
            BookCounter++;
            if (counter === 3) {
                stream.pause();
                findAllBooksForAuthor(data._id)
                    .then((books) => {
                        if(books.length === 0){
                            writeString += '{\"err\" : \"No books for author\", \"id\" : \"' + data._id +'\"}' + ',\r\n';
                            stream.resume();
                            counter = 1;
                        }
                        else {
                            writeString += JSON.stringify(books) + ',\r\n';
                            counter = 1;
                            stream.resume();
                        }

                    })
                    .catch((err) => err)
            }
            else counter++
        });
        stream.on('end', () => {
            skip10authorsANDfindBooksForEach3dAuthor.write(writeString);
            skip10authorsANDfindBooksForEach3dAuthor.write('\r\n]');
            resolve('reading done');
        });
        stream.on('error', (err) => {
            reject(err);
        })
    })
};