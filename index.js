const mongoose = require('mongoose');
const pendapatanRoutes = require('./routes/pendapatans');
const Pendapatan = require('./models/pendapatan');
const pengeluaranRoutes = require('./routes/pengeluarans');
const Pengeluaran = require('./models/pengeluaran');
const Joi = require('joi');
const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const app = express();
const path = require('path'); // Import path module

// Tambahkan di sini (tanpa mengubah yang lain)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Konfigurasi views directory

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

mongoose.connect('mongodb://localhost:27017/projectsiuit')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/pendapatan', pendapatanRoutes);
app.use('/api/pengeluaran', pengeluaranRoutes);


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

app.get('/pengeluaran', async (req,res) => {
  try{
    // console.log("Pengeluaran model:", Pengeluaran); INI BUAT APA CO
    /*
    TODO:
    Pengeluaran data ambil dari API jangan dari model mongose langsung
    */
    const pengeluaranData = await Pengeluaran.find().sort('name'); // Kan pake API knp ada request di sini
    console.log(pengeluaranData);
    res.render('pengeluaran', { data: pengeluaranData });
  } catch(error){
    console.error("Error mengambil data pengeluaran:", error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data pengeluaran.');
  }
});

app.get('/test', async (req,res) => {
  try{
    var Data = [{ message: 'Please Add a Title 1' }, { message: 'Please Add a Title 2' } ]
    res.render('test', {data: Data});
  } catch(error){
    console.error(error);
    res.status(500).send('Terjadi kesalahan dalam mengambil data pengeluaran.');
  }
});

const port = process.env.PORT || 4000;
app.listen(port,() => console.log(`Listening on port ${port}...`));

console.log('http://localhost:4000/')