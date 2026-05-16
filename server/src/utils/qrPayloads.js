const createBookCopyPayload = (bookId, copyId) => JSON.stringify({ type: 'book-copy', bookId, copyId });
const createReturnPayload = (issueId, copyId) => JSON.stringify({ type: 'return', issueId, copyId });

const parseQrPayload = (value) => {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
};

module.exports = { createBookCopyPayload, createReturnPayload, parseQrPayload };
