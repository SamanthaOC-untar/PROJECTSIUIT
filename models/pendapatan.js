const Joi = require('joi');
const mongoose = require('mongoose');


const pendapatanSchema = new mongoose.Schema({
  sumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  jumlah: {
    type: Number,
    required: true,
    min: 1000,
    max: 1000000000
  },
  tanggal: {
    type: Date,
    required: true,
    default: Date.now
  },
  kategori: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  }
});


const Pendapatan = mongoose.model('Pendapatan', pendapatanSchema);


function validatePendapatan(pendapatan) {
  const schema = Joi.object({
    sumber: Joi.string().min(3).max(50).required().trim(),
    jumlah: Joi.number().min(1000).max(1000000000).required(),
    tanggal: Joi.date().iso().default(() => new Date()),
    kategori: Joi.string().min(3).max(50).required().trim()
  });


  return schema.validate(pendapatan);
}


module.exports = Pendapatan;
module.exports.validate = validatePendapatan;
