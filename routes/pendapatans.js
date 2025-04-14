const Pendapatan = require('../models/pendapatan');
const { validate } = require('../models/pendapatan');
const express = require('express');
const router = express.Router();

// ==============================================
// 1. GET SEMUA DATA PENDAPATAN
// Endpoint: GET /pendapatan
// Fungsi: Mengambil semua data pendapatan diurutkan berdasarkan tanggal
// ==============================================
router.get('/pendapatan', async (req, res) => {
  try {
    // Ambil parameter query bulan dan tahun
    const { bulan, tahun } = req.query;
    let filter = {}; // Object untuk menyimpan filter
    
    // Jika ada parameter bulan dan tahun
    if (bulan && tahun) {
      const awalBulan = new Date(tahun, bulan - 1, 1); // Tanggal awal bulan
      const akhirBulan = new Date(tahun, bulan, 0, 23, 59, 59); // Tanggal akhir bulan
      filter.tanggal = { 
        $gte: awalBulan,  // Tanggal >= awal bulan
        $lte: akhirBulan  // Tanggal <= akhir bulan
      };
    }

    // Query ke database dengan filter
    const dataPendapatan = await Pendapatan.find(filter)
      .sort('-tanggal'); // Urutkan dari tanggal terbaru

    // Response ke client
    res.json({
      success: true,
      jumlahData: dataPendapatan.length,
      totalPendapatan: totalPendapatan,
      data: dataPendapatan
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mengambil data pendapatan',
      error: error.message 
    });
  }
});

// ==============================================
// 2. GET DATA PENDAPATAN SPESIFIK
// Endpoint: GET /pendapatan/:id
// Fungsi: Mengambil data pendapatan berdasarkan ID
// ==============================================
router.get('/pendapatan/:id', async (req, res) => {
  try {
    // Cari data berdasarkan ID parameter
    const pendapatan = await Pendapatan.findById(req.params.id);
    
    // Jika data ditemukan, kirim sebagai response
    res.json(pendapatan);
  } catch (error) {
    // Handle error server
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// ==============================================
// 3. TAMBAH DATA PENDAPATAN BARU
// Endpoint: POST /pendapatan
// Fungsi: Membuat record pendapatan baru
// ==============================================
router.post('/pendapatan', async (req, res) => {
  try {
    // Validasi input request body
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Buat object pendapatan baru
    const pendapatan = new Pendapatan({
      sumber: req.body.sumber,         // Sumber pendapatan
      jumlah: req.body.jumlah,         // Jumlah nominal
      tanggal: req.body.tanggal || new Date(),  // Pakai tanggal sekarang jika tidak diisi
      kategori: req.body.kategori      // Kategori pendapatan
    });

    // Simpan ke database
    await pendapatan.save();
    
    // Response sukses (status 201 - Created)
    res.status(201).json({
      message: 'Data pendapatan berhasil disimpan',
      data: pendapatan
    });
  } catch (error) {
    // Handle error penyimpanan
    res.status(500).json({ error: 'Gagal menyimpan pendapatan' });
  }
});

// ==============================================
// 4. UPDATE DATA PENDAPATAN
// Endpoint: PUT /pendapatan/:id
// Fungsi: Memperbarui data pendapatan yang sudah ada
// ==============================================
router.put('/pendapatan/:id', async (req, res) => {
  try {
    // Validasi input
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Update data di database
    const updatedPendapatan = await Pendapatan.findByIdAndUpdate(
      req.params.id,  // ID dari parameter URL
      {
        sumber: req.body.sumber,
        jumlah: req.body.jumlah,
        tanggal: req.body.tanggal,
        kategori: req.body.kategori
      },
      { 
        new: true,         // Mengembalikan data yang sudah diupdate
        runValidators: true  // Menjalankan validasi lagi saat update
      }
    );

    // Jika data tidak ditemukan
    if (!updatedPendapatan) {
      return res.status(404).json({ error: 'Data pendapatan tidak ditemukan' });
    }

    // Response sukses
    res.json({
      message: 'Data pendapatan berhasil diperbarui',
      data: updatedPendapatan
    });
  } catch (error) {
    // Handle error update
    res.status(500).json({ error: 'Gagal memperbarui pendapatan' });
  }
});

// ==============================================
// 5. HAPUS DATA PENDAPATAN
// Endpoint: DELETE /pendapatan/:id
// Fungsi: Menghapus data pendapatan dari database
// ==============================================
router.delete('/pendapatan/:id', async (req, res) => {
  try {
    // Cari dan hapus data berdasarkan ID
    const deletedPendapatan = await Pendapatan.findByIdAndDelete(req.params.id);
    
    // Jika data tidak ditemukan
    if (!deletedPendapatan) {
      return res.status(404).json({ error: 'Data pendapatan tidak ditemukan' });
    }
    
    // Response sukses
    res.json({
      message: 'Data pendapatan berhasil dihapus',
      data: deletedPendapatan
    });
  } catch (error) {
    // Handle error penghapusan
    res.status(500).json({ error: 'Gagal menghapus pendapatan' });
  }
});

// Export router untuk digunakan di file lain
module.exports = router;