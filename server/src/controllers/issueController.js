const QRCode = require('qrcode');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Issue = require('../models/Issue');
const { createReturnPayload, parseQrPayload } = require('../utils/qrPayloads');

const createIssueRequest = async (req, res) => {
  try {
    const payload = parseQrPayload(req.body.bookId || req.body.qrValue || '');
    const copyId = payload?.copyId;
    const bookId = payload?.bookId;

    if (!copyId || !bookId) {
      return res.status(400).json({ message: 'Invalid book QR payload' });
    }

    const [book, copy] = await Promise.all([Book.findById(bookId), BookCopy.findById(copyId)]);

    if (!book || !copy || copy.book.toString() !== book._id.toString()) {
      return res.status(404).json({ message: 'Book copy not found' });
    }

    if (copy.status !== 'available' || book.availableCopies < 1) {
      return res.status(400).json({ message: 'Selected copy is not available' });
    }

    const existingActive = await Issue.findOne({
      bookCopy: copyId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingActive) {
      return res.status(400).json({ message: 'Request already exists for this copy' });
    }

    const issue = await Issue.create({
      book: bookId,
      bookCopy: copyId,
      student: req.user._id,
      status: 'pending',
    });

    const populatedIssue = await issue.populate(['book', 'bookCopy', 'student']);
    return res.status(201).json(populatedIssue);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ student: req.user._id })
      .populate('book')
      .populate('bookCopy')
      .sort({ createdAt: -1 });

    return res.json(issues);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllIssues = async (_req, res) => {
  try {
    const issues = await Issue.find()
      .populate('book')
      .populate('bookCopy')
      .populate('student', 'name rid email role')
      .sort({ createdAt: -1 });

    return res.json(issues);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id).populate('book').populate('bookCopy');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    if (issue.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    issue.status = status;

    if (status === 'approved') {
      issue.issuedAt = new Date();
      issue.book.availableCopies -= 1;
      issue.bookCopy.status = 'issued';
      issue.returnQrCodeDataUrl = await QRCode.toDataURL(
        createReturnPayload(issue._id.toString(), issue.bookCopy._id.toString())
      );
      await issue.book.save();
      await issue.bookCopy.save();
    }

    await issue.save();
    const populated = await issue.populate('student', 'name rid email role');
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const payload = parseQrPayload(req.body.qrValue || '');
    const issueId = payload?.issueId;
    const copyId = payload?.copyId;

    if (!issueId || !copyId) {
      return res.status(400).json({ message: 'Invalid return QR payload' });
    }

    const issue = await Issue.findById(issueId)
      .populate('book')
      .populate('bookCopy')
      .populate('student', 'name email');

    if (!issue || issue.bookCopy._id.toString() !== copyId || issue.status !== 'approved') {
      return res.status(404).json({ message: 'No approved issue found for this return QR' });
    }

    issue.status = 'returned';
    issue.returnedAt = new Date();
    issue.book.availableCopies += 1;
    issue.bookCopy.status = 'available';

    await issue.book.save();
    await issue.bookCopy.save();
    await issue.save();

    return res.json(issue);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createIssueRequest,
  getStudentIssues,
  getAllIssues,
  updateIssueStatus,
  returnBook,
};
