const Joi = require('joi');
const mongoose = require('mongoose');

// Schema Mongoose untuk User
const User = mongoose.model('User', new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // opsional, kalau mau email tidak boleh duplikat
  },
  username: {
    type: String,
    required: true,
    unique: true // opsional, supaya username tidak duplikat
  },
  password: {
    type: String,
    required: true
  }
}));

// Validasi input dengan Joi
function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(3).required()
  });

  return schema.validate(user);
}

module.exports = User;
module.exports.validate = validateUser;
