const express = require('express');
const {
  createIssueRequest,
  getAllIssues,
  getStudentIssues,
  returnBook,
  updateIssueStatus,
} = require('../controllers/issueController');
const { protect, isAdmin, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, isStudent, createIssueRequest);
router.get('/my', protect, isStudent, getStudentIssues);
router.get('/', protect, isAdmin, getAllIssues);
router.patch('/:id/status', protect, isAdmin, updateIssueStatus);
router.post('/return', protect, isAdmin, returnBook);

module.exports = router;
