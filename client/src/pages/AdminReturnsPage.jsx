import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/client';
import { useLibraryData } from '../hooks/useLibraryData';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const AdminReturnsPage = () => {
  const { issues, refresh } = useLibraryData();
  const [message, setMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(true);
  const qrRef = useRef(null);

  const pendingReturns = useMemo(
    () => issues.filter((issue) => issue.status === 'approved'),
    [issues]
  );

  const oldHistory = useMemo(
    () => issues.filter((issue) => issue.status === 'returned'),
    [issues]
  );

  useEffect(() => {
    if (!scannerOpen) {
      return undefined;
    }

    const qr = new Html5Qrcode('return-reader');
    qrRef.current = qr;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        const preferred = devices.find((item) => /back|rear|environment/i.test(item.label)) || devices[0];
        if (!preferred) {
          setMessage('No camera found');
          return;
        }

        await qr.start(
          preferred.id,
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.2 },
          async (decodedText) => {
            try {
              const { data } = await api.post('/issues/return', { qrValue: decodedText });
              setMessage(`Returned: ${data.book?.title} | ${data.student?.name} | ${data.student?.rid || ''}`);
              await refresh();
            } catch (err) {
              setMessage(err.response?.data?.message || 'Return failed');
            }
          },
          () => {}
        );
      } catch (_error) {
        setMessage('Camera permission allow ');
      }
    };

    startScanner();

    return () => {
      if (qrRef.current?.isScanning) {
        qrRef.current.stop().catch(() => {});
      }
      qrRef.current = null;
    };
  }, [refresh, scannerOpen]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Book Return Tracker</h1>
        {message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Not Returned</h2>
        <p className="mt-1 text-sm text-slate-500">Not return books by students.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Student</th>
                <th className="pb-3">RID</th>
                <th className="pb-3">Mail</th>
                <th className="pb-3">Book</th>
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
                  <td className="py-4 text-slate-700">{formatDate(issue.issuedAt)}</td>
                </tr>
              )) : <tr><td className="py-4 text-slate-500" colSpan="5">No pending returns.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Return Scanner</h2>
        <div id="return-reader" className="mt-4 min-h-[320px] overflow-hidden rounded-2xl" />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Old Data</h2>
        <p className="mt-1 text-sm text-slate-500">student old book data record.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Student</th>
                <th className="pb-3">RID</th>
                <th className="pb-3">Mail</th>
                <th className="pb-3">Book</th>
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
                  <td className="py-4 text-slate-700">{formatDate(issue.issuedAt)}</td>
                  <td className="py-4 text-slate-700">{formatDate(issue.returnedAt)}</td>
                </tr>
              )) : <tr><td className="py-4 text-slate-500" colSpan="6">No old return data yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminReturnsPage;
