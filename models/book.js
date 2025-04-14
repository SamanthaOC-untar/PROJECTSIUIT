const Joi = require('joi');
const mongoose = require('mongoose');

const Book = mongoose.model('Book', new mongoose.Schema({
    nomorbuku: {
        type: Number,
        required: true, 
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    halaman: {
        type: Number,
        required: true
    },
    penulis: {
        type: String,
        required: true
    },
    lokasi: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
    },
}));

function validateBook(book) {
    const schema = Joi.object({
      nomorbuku: Joi.number().required(),
      name: Joi.string().required(),
      halaman: Joi.number().integer().required(),
      penulis: Joi.string().required(),
      lokasi: Joi.string().required(),
      filepath: Joi.string().optional(),
    });
  
    return schema.validate(book);
  }

module.exports = Book;
module.exports.validate = validateBook;