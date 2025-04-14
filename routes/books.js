const Book = require('../models/book');
const {validate} = require('../models/book');
const mongoose = require('mongoose');
const multer = require('multer');
const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const fileStorageEngine = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,'./eBook');
  },
  filename: (req,file,cb) => {
    cb(null,Date.now() + "--" + file.originalname);
  },
});

const upload = multer({storage: fileStorageEngine});

// Buat ambil semua buku
//router.get('/api/books', (req, res) => {
//  res.send(books);
//});

// Buat ambil semua buku tapi async
router.get('/', async (req,res) => {
  try{
    const books = await Book.find().sort('name');
    console.log("Data buku yang dikirim:", books);
    res.json(books);
  } catch(error){
      res.status(404).send('Buku yang dicari tidak ada!');
  }
});

// Buat ambil 1 spesific buku dengan mencari nomor buku
router.get('/search/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    console.log("ID yang diterima:", req.params.id);
    if (!book) {
      return res.status(404).send('Buku dengan nomor tersebut tidak ditemukan!');
    }
    
    res.send(book);
  } catch(error) {
    res.status(500).send('Terjadi kesalahan server.');
  }
});

// Endpoint khusus untuk mengunggah file
router.post('/upload', upload.single('ebook'), (req, res) => {
  if (!req.file) {
      return res.status(400).send({ error: "File tidak ditemukan" });
  }
  res.send({ filepath: req.file.path }); // Kembalikan path file
});

//Buat Nambah buku
router.post('/', upload.single('ebook'), async (req, res) => {
  console.log("Data yang diterima dari frontend:", req.body);
  console.log("File yang diunggah:", req.file);
  
  try {
    // Validasi request body
    const { error } = validate(req.body);
    if (error) {
      console.error("Validasi gagal:", error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }

    // Cek apakah nomor buku sudah ada
    const existingBook = await Book.findOne({ nomorbuku: req.body.nomorbuku });
    if (existingBook) {
      return res.status(400).send('Nomor buku sudah digunakan');
    }

    // Buat buku baru
    const book = new Book({ 
      nomorbuku: req.body.nomorbuku,
      name: req.body.name,
      halaman: parseInt(req.body.halaman),
      penulis: req.body.penulis,
      lokasi: req.body.lokasi,
      filepath: req.file ? `/eBook/${req.file.filename}` : null
    });

    // Simpan ke database
    await book.save();
    
    res.status(201).send({ 
      message: "Buku berhasil disimpan!", 
      book: {
        _id: book._id,
        nomorbuku: book.nomorbuku,
        name: book.name,
        halaman: book.halaman,
        penulis: book.penulis,
        lokasi: book.lokasi,
        filepath: book.filepath
      }
    });
    
  } catch (error) {
    console.error("Error saat menyimpan buku:", error);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Buat Update buku
router.put('/:id', upload.single('ebook'), async (req, res) => {
  try {
    console.log("Data yang diterima:", req.body);
    console.log("File yang diunggah:", req.file);
    console.log("ID yang diterima untuk update:", req.params.id);
    console.log("Data yang diterima untuk update:", req.body);

    // Validasi input
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // Cek apakah nomor buku sudah digunakan oleh buku lain
    if (req.body.nomorbuku) {
      const existingBook = await Book.findOne({ 
        nomorbuku: req.body.nomorbuku,
        _id: { $ne: req.params.id } // Exclude current book from check
      });
      
      if (existingBook) {
        return res.status(400).send('Nomor buku sudah digunakan oleh buku lain');
      }
    }

    // Data yang mau di update
    const updateData = {
      nomorbuku: req.body.nomorbuku,
      name: req.body.name,
      halaman: parseInt(req.body.halaman),
      penulis: req.body.penulis,
      lokasi: req.body.lokasi
    };

    // Handle file upload jika ada
    if (req.file) {
      updateData.filepath = `/eBook/${req.file.filename}`;
      
      // Hapus file lama jika ada
      const oldBook = await Book.findById(req.params.id);
      if (oldBook && oldBook.filepath) {
        const oldFilePath = path.join(__dirname, '..', 'public', oldBook.filepath);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Gagal menghapus file lama:', err);
        });
      }
    }

    // Update buku
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).send('Buku dengan ID tersebut tidak ditemukan');
    }

    res.send({
      message: 'Buku berhasil diperbarui',
      book: updatedBook
    });

  } catch (error) {
    console.error("Error saat mengupdate buku:", error);
    res.status(500).send('Terjadi kesalahan server saat mengupdate buku');
  }
});


//Buat Hapus buku
router.delete('/:id', async (req,res) => {
  try {
    // Cari buku berdasarkan ID
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Buku yang ingin dihapus tidak ada!');

    // Hapus file jika ada filepath
    if (book.filepath) {
      const filePath = path.join(__dirname, '..', book.filepath); // Path absolut ke file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Gagal menghapus file:", err);
        } else {
          console.log("File berhasil dihapus:", filePath);
        }
      });
    }

    // Hapus buku dari database
    await Book.findByIdAndDelete(req.params.id);

    res.send(book);
  } catch (error) {
    console.error("Error saat menghapus buku:", error);
    res.status(500).send('Terjadi kesalahan saat menghapus buku.');
  }
  });

module.exports = router;