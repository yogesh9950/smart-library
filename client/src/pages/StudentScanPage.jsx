import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/client';

const StudentScanPage = () => {
  const [message, setMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const html5QrCodeRef = useRef(null);
  const isHandlingScanRef = useRef(false);

  const requestIssue = async (qrValue) => {
    if (!qrValue) {
      setMessage('Please scan a valid book QR');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/issues', { qrValue });
      setMessage('Request sent to admin successfully. Admin accept karega to book issue ho jayegi.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Issue request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!scannerOpen) {
      return undefined;
    }

    const html5QrCode = new Html5Qrcode('student-reader');
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        const preferredCamera = devices.find((device) => /back|rear|environment/gi.test(device.label)) || devices[0];

        if (!preferredCamera) {
          setMessage('No camera found on this device');
          return;
        }

        await html5QrCode.start(
          preferredCamera.id,
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.2,
          },
          async (decodedText) => {
            if (isHandlingScanRef.current) {
              return;
            }

            isHandlingScanRef.current = true;
            await requestIssue(decodedText);
            await html5QrCode.stop();
            setScannerOpen(false);
            isHandlingScanRef.current = false;
          },
          () => {}
        );
      } catch (error) {
        setMessage('Camera permission allow.');
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
      html5QrCodeRef.current = null;
      isHandlingScanRef.current = false;
    };
  }, [scannerOpen]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Scan Store QR</h1>
        <p className="mt-1 text-sm text-slate-500">
          Scan book QR.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setMessage('');
              setScannerOpen(true);
            }}
            className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
            disabled={isSubmitting}
          >
            Restart Scanner
          </button>
        </div>

        {message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div id="student-reader" className="min-h-[320px] overflow-hidden rounded-2xl" />
      </section>
    </div>
  );
};

export default StudentScanPage;
