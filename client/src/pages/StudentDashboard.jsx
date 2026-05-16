import { useMemo } from 'react';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import { useLibraryData } from '../hooks/useLibraryData';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const StudentDashboard = () => {
  const { issues, loading, error, refresh } = useLibraryData();

  const stats = useMemo(
    () => ({
      pending: issues.filter((issue) => issue.status === 'pending').length,
      approved: issues.filter((issue) => issue.status === 'approved').length,
      rejected: issues.filter((issue) => issue.status === 'rejected').length,
      returned: issues.filter((issue) => issue.status === 'returned').length,
    }),
    [issues]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending" value={stats.pending} helper="Admin review pending" />
        <StatCard label="Issued" value={stats.approved} helper="Books currently with you" />
        <StatCard label="Rejected" value={stats.rejected} helper="Requests rejected" />
        <StatCard label="Returned" value={stats.returned} helper="Returned successfully" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My Books</h1>
            <p className="text-sm text-slate-500">Book Issue details.</p>
          </div>
          <button onClick={refresh} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Refresh</button>
        </div>
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Book</th>
                <th className="pb-3">Copy</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Issue Date</th>
                <th className="pb-3">Return Date</th>
                <th className="pb-3">Return QR</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-4 text-slate-500" colSpan="6">Loading books...</td></tr>
              ) : issues.length ? (
                issues.map((issue) => (
                  <tr key={issue._id} className="border-b border-slate-100 align-top">
                    <td className="py-4">
                      <p className="font-medium text-slate-900">{issue.book?.title}</p>
                      <p className="text-slate-500">{issue.book?.author}</p>
                    </td>
                    <td className="py-4 text-slate-600">Copy {issue.bookCopy?.copyNumber}</td>
                    <td className="py-4"><StatusBadge status={issue.status} /></td>
                    <td className="py-4 text-slate-700">{formatDate(issue.issuedAt || issue.createdAt)}</td>
                    <td className="py-4 text-slate-700">{formatDate(issue.returnedAt)}</td>
                    <td className="py-4">
                      {issue.status === 'approved' && issue.returnQrCodeDataUrl ? (
                        <img src={issue.returnQrCodeDataUrl} alt="Return QR" className="h-28 w-28 rounded-xl border border-slate-200 bg-white p-2" />
                      ) : (
                        <span className="text-slate-400">{issue.status === 'returned' ? 'Returned' : 'Available after approval'}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="py-4 text-slate-500" colSpan="6">No books in your account. Scan store QR to request a book.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
