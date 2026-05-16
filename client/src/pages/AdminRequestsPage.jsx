import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useLibraryData } from '../hooks/useLibraryData';

const AdminRequestsPage = () => {
  const { issues, loading, error, refresh } = useLibraryData();

  const updateStatus = async (issueId, status) => {
    await api.patch(`/issues/${issueId}/status`, { status });
    await refresh();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Student Requests</h1>
          <p className="text-sm text-slate-500">Student QR scan.</p>
        </div>
        <button onClick={refresh} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Refresh</button>
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3">Student</th>
              <th className="pb-3">Book</th>
              <th className="pb-3">Copy</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="py-4 text-slate-500" colSpan="5">Loading requests...</td></tr>
            ) : issues.length ? (
              issues.map((issue) => (
                <tr key={issue._id} className="border-b border-slate-100 align-top">
                  <td className="py-4">
                    <p className="font-medium text-slate-900">{issue.student?.name}</p>
                    <p className="text-slate-500">{issue.student?.email}</p>
                  </td>
                  <td className="py-4 text-slate-700">
                    <p className="font-medium text-slate-900">{issue.book?.title}</p>
                    <p className="text-slate-500">{issue.book?.author}</p>
                  </td>
                  <td className="py-4 text-slate-700">Copy {issue.bookCopy?.copyNumber}</td>
                  <td className="py-4"><StatusBadge status={issue.status} /></td>
                  <td className="py-4">
                    {issue.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(issue._id, 'approved')} className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white">Accept</button>
                        <button onClick={() => updateStatus(issue._id, 'rejected')} className="rounded-xl bg-rose-600 px-4 py-2 font-medium text-white">Reject</button>
                      </div>
                    ) : issue.status === 'approved' ? (
                      <div className="space-y-2">
                        <span className="block text-xs font-medium text-slate-500">Return QR for student</span>
                        {issue.returnQrCodeDataUrl ? (
                          <img src={issue.returnQrCodeDataUrl} alt="Return QR" className="h-28 w-28 rounded-xl border border-slate-200 bg-white p-2" />
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="py-4 text-slate-500" colSpan="5">No requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
