const Joi = require('joi');
const mongoose = require('mongoose');

const Pengeluaran = mongoose.model('Pengeluaran', new mongoose.Schema({
    sumber: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    jumlah: {
        type: Number,
        required: true,
        min: 0
    },
    tanggal: {
        type: Date,
        required: true,
        default: Date.now
    },
    kategori: {
        type: String,
        required: true
    }
}));

function validatePengeluaran(pengeluaran) {
    const schema = Joi.object({
        sumber: Joi.string().min(3).max(50).required().trim(),
        jumlah: Joi.number().min(0).required(),
        tanggal: Joi.date().default(Date.now),
        kategori: Joi.string().required()
    });

    return schema.validate(pengeluaran);
}

module.exports = Pengeluaran;
module.exports.validate = validatePengeluaran;