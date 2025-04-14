// Import modul yang diperlukan
const Pengeluaran = require('../models/pengeluaran'); // Model Mongoose untuk data pengeluaran
const { validate } = require('../models/pengeluaran'); // Fungsi validasi Joi
const express = require('express'); // Framework Express
const router = express.Router(); // Membuat router modular

// [1] ENDPOUNT GET /pengeluaran - Mendapatkan semua data pengeluaran
router.get('/pengeluaran', async (req, res) => {
  try {
    // Ambil parameter query bulan dan tahun (opsional)
    const { bulan, tahun } = req.query;
    let query = {}; // Objek query awal
    
    // Jika ada parameter bulan dan tahun, buat filter tanggal
    if (bulan && tahun) {
      // Tanggal awal bulan (contoh: 1 Mei 2023)
      const startDate = new Date(tahun, bulan - 1, 1);
      // Tanggal akhir bulan (contoh: 31 Mei 2023 23:59:59)
      const endDate = new Date(tahun, bulan, 0, 23, 59, 59);
      // Tambahkan filter ke query
      query.tanggal = { $gte: startDate, $lte: endDate };
    }

    // Ambil data dari database dengan:
    // - Filter query (jika ada)
    // - Urutkan dari tanggal terbaru (descending)
    const pengeluaran = await Pengeluaran.find(query).sort('-tanggal');
    
    // Kirim response sukses dengan:
    // - Data pengeluaran
    // - Total jumlah pengeluaran
    res.json({
      success: true,
      data: pengeluaran,
      total: pengeluaran.reduce((sum, item) => sum + item.jumlah, 0)
    });
  } catch (error) {
    // Handle error
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengeluaran',
      error: error.message
    });
  }
});

// [2] ENDPOINT GET /pengeluaran/:id - Mendapatkan data spesifik by ID
router.get('/pengeluaran/:id', async (req, res) => {
  try {
    // Cari data pengeluaran berdasarkan ID
    const pengeluaran = await Pengeluaran.findById(req.params.id);
    
    // Jika tidak ditemukan
    if (!pengeluaran) {
      return res.status(404).json({
        success: false,
        message: 'Data pengeluaran tidak ditemukan'
      });
    }
    
    // Jika ditemukan, kirim data
    res.json({ 
      success: true, 
      data: pengeluaran 
    });
  } catch (error) {
    // Handle error
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
});

// [3] ENDPOINT POST /pengeluaran - Menambah data baru
router.post('/pengeluaran', async (req, res) => {
  try {
    // Validasi input menggunakan Joi
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Buat objek pengeluaran baru
    const pengeluaran = new Pengeluaran({ 
      sumber: req.body.sumber,
      jumlah: req.body.jumlah,
      tanggal: req.body.tanggal || new Date(), // Default tanggal sekarang
      kategori: req.body.kategori
    });

    // Simpan ke database
    await pengeluaran.save();
    
    // Response sukses
    res.status(201).json({ 
      success: true,
      message: "Pengeluaran berhasil dicatat!",
      data: pengeluaran
    });
  } catch (error) {
    // Handle error
    res.status(500).json({
      success: false,
      message: 'Gagal mencatat pengeluaran',
      error: error.message
    });
  }
});

// [4] ENDPOINT PUT /pengeluaran/:id - Mengupdate data
router.put('/pengeluaran/:id', async (req, res) => {
  try {
    // Validasi input
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Update data di database
    const updatedPengeluaran = await Pengeluaran.findByIdAndUpdate(
      req.params.id,
      {
        sumber: req.body.sumber,
        jumlah: req.body.jumlah,
        tanggal: req.body.tanggal,
        kategori: req.body.kategori
      },
      { 
        new: true, // Mengembalikan data yang sudah diupdate
        runValidators: true // Menjalankan validasi schema
      }
    );

    // Jika data tidak ditemukan
    if (!updatedPengeluaran) {
      return res.status(404).json({
        success: false,
        message: 'Data pengeluaran tidak ditemukan'
      });
    }

    // Response sukses
    res.json({
      success: true,
      message: 'Data berhasil diperbarui',
      data: updatedPengeluaran
    });
  } catch (error) {
    // Handle error
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data',
      error: error.message
    });
  }
});

// [5] ENDPOINT DELETE /pengeluaran/:id - Menghapus data
router.delete('/pengeluaran/:id', async (req, res) => {
  try {
    // Cari dan hapus data berdasarkan ID
    const pengeluaran = await Pengeluaran.findByIdAndDelete(req.params.id);
    
    // Jika data tidak ditemukan
    if (!pengeluaran) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }
    
    // Response sukses
    res.json({
      success: true,
      message: 'Data berhasil dihapus',
      data: pengeluaran
    });
  } catch (error) {
    // Handle error
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data',
      error: error.message
    });
  }
});

// Export router untuk digunakan di file lain
module.exports = router;