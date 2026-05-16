const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const { createBookCopyPayload } = require('../utils/qrPayloads');

const createCopyQrData = async (bookId, copyId) => QRCode.toDataURL(createBookCopyPayload(bookId.toString(), copyId.toString()));

const ensureBookCopies = async (book) => {
  const existingCopies = await BookCopy.find({ book: book._id }).sort({ copyNumber: 1 });

  if (existingCopies.length === book.totalCopies) {
    return existingCopies;
  }

  const copies = [];

  for (let index = 1; index <= book.totalCopies; index += 1) {
    let copy = existingCopies.find((item) => item.copyNumber === index);

    if (!copy) {
      copy = await BookCopy.create({
        book: book._id,
        copyNumber: index,
      });
    }

    if (!copy.qrCodeDataUrl) {
      copy.qrCodeDataUrl = await createCopyQrData(book._id, copy._id);
      await copy.save();
    }

    copies.push(copy);
  }

  return copies;
};

const listBooks = async (_req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    const booksWithCopies = await Promise.all(
      books.map(async (book) => {
        const copies = await BookCopy.find({ book: book._id }).sort({ copyNumber: 1 });
        return {
          ...book.toObject(),
          copies,
        };
      })
    );

    return res.json(booksWithCopies);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, author, category, totalCopies } = req.body;

    const total = Number(totalCopies);
    if (!title || !author || !Number.isFinite(total) || total < 1) {
      return res.status(400).json({ message: 'Valid title, author, and totalCopies are required' });
    }

    const book = await Book.create({
      title,
      author,
      category,
      totalCopies: total,
      availableCopies: total,
    });

    const copies = await ensureBookCopies(book);
    book.qrCodeDataUrl = copies[0]?.qrCodeDataUrl || '';
    await book.save();

    return res.status(201).json({
      ...book.toObject(),
      copies,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBookQr = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const copies = await ensureBookCopies(book);

    return res.json({
      bookId: book._id,
      copies,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadQrPdf = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.bookIds) ? req.body.bookIds : [];
    const books = await Book.find({ _id: { $in: ids } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="book-qrs.pdf"');

    const doc = new PDFDocument({ margin: 24, size: 'A4' });
    doc.pipe(res);

    const pageWidth = doc.page.width - 48;
    const cellSize = pageWidth / 5;
    let position = 0;

    for (const book of books) {
      const copies = await ensureBookCopies(book);

      for (const copy of copies) {
        const row = Math.floor(position / 5) % 5;
        const column = position % 5;
        const x = 24 + column * cellSize;
        const y = 24 + row * cellSize;

        if (position > 0 && position % 25 === 0) {
          doc.addPage({ margin: 24, size: 'A4' });
        }

        doc.rect(x, y, cellSize - 8, cellSize - 8).stroke('#d4d4d8');
        doc.fontSize(10).text(book.title, x + 8, y + 8, { width: cellSize - 24, ellipsis: true });
        doc.fontSize(8).text(`Author: ${book.author}`, x + 8, y + 24, { width: cellSize - 24, ellipsis: true });
        doc.fontSize(8).text(`Copy ${copy.copyNumber}`, x + 8, y + 38);
        doc.image(copy.qrCodeDataUrl, x + 18, y + 54, { fit: [cellSize - 44, cellSize - 74], align: 'center' });
        position += 1;
      }
    }

    doc.end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listBooks, addBook, getBookQr, downloadQrPdf };
