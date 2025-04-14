const Joi = require('joi');
const mongoose = require('mongoose');

const Tagihan = mongoose.model('Tagihan', new mongoose.Schema({
    namaTagihan: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    jumlahTagihan: {
        type: Number,
        required: true,
        min: 0
    },
    tanggalJatuhTempo: {
        type: Date,
        required: true
    },
    kategori: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30  // Batas maksimal karakter
    },
    status: {
        type: String,
        enum: ['belum dibayar', 'dibayar'],
        default: 'belum dibayar'
    }
}));

function validateTagihan(tagihan) {
    const schema = Joi.object({
        namaTagihan: Joi.string().min(3).max(50).required().trim(),
        jumlahTagihan: Joi.number().min(0).required(),
        tanggalJatuhTempo: Joi.date().required(),
        kategori: Joi.string().max(30).required().trim(),  // Tanpa enum
        status: Joi.string().valid('belum dibayar', 'dibayar').default('belum dibayar')
    });

    return schema.validate(tagihan);
}

module.exports = Tagihan;
module.exports.validate = validateTagihan;