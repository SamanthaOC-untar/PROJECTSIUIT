const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user'); // pastikan path-nya sesuai struktur kamu
const { validate } = require('../models/user');

// GET login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

// POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.render('login', { error: 'Username tidak ditemukan' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.render('login', { error: 'Password salah' });
    }

    req.session.user = { id: user._id, username: user.username };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Terjadi kesalahan saat login' });
  }
});

// GET logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

// GET signup page
router.get('/sign', (req, res) => {
  res.render('sign'); // sign.ejs
});

router.post('/signup', async (req, res) => {
  console.log("User mau daftar:");
  const { email, username, password } = req.body;
  console.log(email)
  console.log(username)
  console.log(password)

  // VALIDASI
  const { error } = validate({ email, username, password });
  if (error) return console.log('validate gagal');//res.render('sign', { error: error.details[0].message });
  console.log("User validasi:");

  // CEK USER SUDAH ADA
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render('sign', { error: 'Username sudah terdaftar' });
  }
  console.log("cek user sudah ada:");

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("hash password:");

  // SIMPAN USER
  const newUser = new User({ email, username, password: hashedPassword });
  await newUser.save();

  console.log("User berhasil daftar:", username);

  // REDIRECT KE LOGIN
  res.redirect('/auth/login?signupSuccess=true');
});

module.exports = router;
