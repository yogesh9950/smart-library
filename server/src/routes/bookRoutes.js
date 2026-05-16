const express = require('express');
const { addBook, downloadQrPdf, getBookQr, listBooks } = require('../controllers/bookController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listBooks);
router.post('/', protect, isAdmin, addBook);
router.get('/:id/qr', protect, getBookQr);
router.post('/qr/pdf', protect, isAdmin, downloadQrPdf);

module.exports = router;
