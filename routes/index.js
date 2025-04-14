const express = require('express');
const router = express.Router();
const Book = require('../models/book');

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const books = await Book.find().sort('name');
        res.render('index', { books }); //  render views/index.ejs
    } catch (error) {
        console.error("Error mengambil buku:", error);
        res.status(500).send("Terjadi kesalahan.");
    }
});

module.exports = router;