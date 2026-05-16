const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    copyNumber: {
      type: Number,
      required: true,
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'issued'],
      default: 'available',
    },
  },
  { timestamps: true }
);

bookCopySchema.index({ book: 1, copyNumber: 1 }, { unique: true });

module.exports = mongoose.model('BookCopy', bookCopySchema);
