const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    bookCopy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookCopy',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'returned'],
      default: 'pending',
    },
    returnQrCodeDataUrl: {
      type: String,
      default: '',
    },
    issuedAt: Date,
    returnedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);
