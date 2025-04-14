const mongoose = require('mongoose');
const pendapatanRoutes = require('./routes/pendapatans');
const Pendapatan = require('./models/pendapatan');
const Joi = require('joi');
const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const app = express();
const path = require('path'); // Import path module

const session = require("express-session")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended:true }));

app.use(express.urlencoded({ extended: true }));

// session
app.use(session({
  secret : 'some_secret_key',
  resave : false,
  saveUninitialized : true,
}));

const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

//
app.set('view engine', 'ejs');
 
mongoose.connect('mongodb://localhost:27017/projectsiuit')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/pendapatan', pendapatanRoutes);


app.get('/pendapatan', async (req,res) => {
  try{
    console.log("Pendapatan model:", Pendapatan);
    const pendapatanData = await Pendapatan.find().sort('name');
    res.render('index', { pendapatan: pendapatanData });
  } catch(error){
    console.error("Error mengambil data pendapatan:", error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data pendapatan.');
  }
});

const port = process.env.PORT || 4000;
app.listen(port,() => console.log(`Listening on port ${port}...`));

console.log('http://localhost:4000/')