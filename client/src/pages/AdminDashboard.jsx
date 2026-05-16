import { useMemo, useState } from 'react';
import api from '../api/client';
import BookGrid from '../components/BookGrid';
import StatCard from '../components/StatCard';
import { useLibraryData } from '../hooks/useLibraryData';

const initialForm = { title: '', author: '', category: 'General', totalCopies: 1 };
const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const downloadCsv = (filename, rows) => {
  const header = ['Student Name', 'RID', 'Email', 'Book', 'Copy', 'Issue Date', 'Return Date', 'Status'];
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard = () => {
  const { books, issues, loading, error, refresh } = useLibraryData();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pendingReturns = useMemo(() => issues.filter((issue) => issue.status === 'approved'), [issues]);
  const oldHistory = useMemo(() => issues.filter((issue) => issue.status === 'returned'), [issues]);

  const stats = useMemo(
    () => ({
      books: books.length,
      pending: issues.filter((issue) => issue.status === 'pending').length,
      approved: issues.filter((issue) => issue.status === 'approved').length,
      available: books.reduce((sum, book) => sum + book.availableCopies, 0),
      notReturnedStudents: new Set(pendingReturns.map((issue) => issue.student?._id)).size,
    }),
    [books, issues, pendingReturns]
  );

  const addBook = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await api.post('/books', form);
      setForm(initialForm);
      setMessage('Book added to store and all copy QR codes generated.');
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async (bookId) => {
    const response = await api.post('/books/qr/pdf', { bookIds: [bookId] }, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'book-copy-qrs.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOldData = () => {
    const rows = oldHistory.map((issue) => [
      issue.student?.name,
      issue.student?.rid,
      issue.student?.email,
      issue.book?.title,
      issue.bookCopy?.copyNumber ? `Copy ${issue.bookCopy.copyNumber}` : '',
      formatDate(issue.issuedAt || issue.createdAt),
      formatDate(issue.returnedAt),
      issue.status,
    ]);
    downloadCsv('old-student-history.csv', rows);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Book Titles" value={stats.books} helper="Store catalog" />
        <StatCard label="Pending Requests" value={stats.pending} helper="Students waiting" />
        <StatCard label="Issued Books" value={stats.approved} helper="Approved and active" />
        <StatCard label="Available Copies" value={stats.available} helper="Ready in store" />
        <StatCard label="Not Returned Students" value={stats.notReturnedStudents} helper="Students holding books" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={addBook} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Add Book In Store</h2>
          
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Book name" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Author name" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" type="number" min="1" placeholder="Total copies" value={form.totalCopies} onChange={(event) => setForm({ ...form, totalCopies: Number(event.target.value) })} />
            {message ? <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
            <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Book Store</h2>
              <p className="text-sm text-slate-500">PDF download QR book </p>
            </div>
            <button onClick={refresh} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Refresh</button>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Loading books...</p>
          ) : (
            <BookGrid
              books={books}
              renderActions={(book) => (
                <div className="space-y-2">
                  <button onClick={() => downloadPdf(book._id)} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                    Download All Copy QR
                  </button>
                  <p className="text-xs text-slate-500">Copies: {book.copies?.length || book.totalCopies}</p>
                </div>
              )}
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Students Not Returned Books</h2>
            <p className="text-sm text-slate-500">Not return books by students with details.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Student</th>
                <th className="pb-3">RID</th>
                <th className="pb-3">Mail</th>
                <th className="pb-3">Book</th>
                <th className="pb-3">Copy</th>
                <th className="pb-3">Issue Date</th>
              </tr>
            </thead>
            <tbody>
              {pendingReturns.length ? pendingReturns.map((issue) => (
                <tr key={issue._id} className="border-b border-slate-100">
                  <td className="py-4 text-slate-900">{issue.student?.name}</td>
                  <td className="py-4 text-slate-700">{issue.student?.rid}</td>
                  <td className="py-4 text-slate-700">{issue.student?.email}</td>
                  <td className="py-4 text-slate-700">{issue.book?.title}</td>
                  <td className="py-4 text-slate-700">Copy {issue.bookCopy?.copyNumber}</td>
                  <td className="py-4 text-slate-700">{formatDate(issue.issuedAt || issue.createdAt)}</td>
                </tr>
              )) : <tr><td className="py-4 text-slate-500" colSpan="6">No student currently holding a book.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Old Student Data</h2>
            <p className="text-sm text-slate-500">Old books data.</p>
          </div>
          <button onClick={exportOldData} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Download Excel CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Student</th>
                <th className="pb-3">RID</th>
                <th className="pb-3">Mail</th>
                <th className="pb-3">Book</th>
                <th className="pb-3">Copy</th>
                <th className="pb-3">Issue Date</th>
                <th className="pb-3">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {oldHistory.length ? oldHistory.map((issue) => (
                <tr key={issue._id} className="border-b border-slate-100">
                  <td className="py-4 text-slate-900">{issue.student?.name}</td>
                  <td className="py-4 text-slate-700">{issue.student?.rid}</td>
                  <td className="py-4 text-slate-700">{issue.student?.email}</td>
                  <td className="py-4 text-slate-700">{issue.book?.title}</td>
                  <td className="py-4 text-slate-700">Copy {issue.bookCopy?.copyNumber}</td>
                  <td className="py-4 text-slate-700">{formatDate(issue.issuedAt || issue.createdAt)}</td>
                  <td className="py-4 text-slate-700">{formatDate(issue.returnedAt)}</td>
                </tr>
              )) : <tr><td className="py-4 text-slate-500" colSpan="7">No old data yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
