import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  rid: '',
  email: '',
  password: '',
  role: 'student',
};

const AuthPage = () => {
  const { isAuthenticated, user, login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // REDIRECT AFTER LOGIN
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin' : '/student'}
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    // FULL NAME VALIDATION
    if (isRegister && !form.name.trim()) {
      setError('Full name is required');
      return;
    }

    // STUDENT RID VALIDATION
    if (
      isRegister &&
      !/^R\d{5}$/i.test(form.rid.trim())
    ) {
      setError('RID format must be like R43123');
      return;
    }

    // FIXED ADMIN LOGIN
    if (!isRegister && form.role === 'admin') {
      if (
        form.email !== 'admin@smartlibrary.dev' ||
        form.password !== 'Admin@123'
      ) {
        setError('Invalid Admin Email or Password');
        return;
      }
    }

    // EMAIL PASSWORD CHECK
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      await login(
        {
          ...form,
          name: form.name.trim(),
          rid: form.rid.trim().toUpperCase(),
          email: form.email.trim(),
        },
        isRegister
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">

        {/* LEFT SIDE */}
        <section className="bg-gradient-to-br from-indigo-700 via-slate-900 to-slate-950 p-10 text-white">

          <div className="inline-flex rounded-2xl bg-white/10 p-3">
            <BookOpen className="h-8 w-8" />
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-indigo-200">
            Smart Library
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Manage books, QR codes, issues, approvals, and returns in one workspace.
          </h1>

          <ul className="mt-8 space-y-4 text-sm text-slate-200">
            <li>Students can register using their R ID.</li>
            <li>Students can track issue and return dates.</li>
          </ul>

        </section>

        {/* RIGHT SIDE */}
        <section className="p-8 sm:p-10">

          <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-600">
            {isRegister ? 'Create Student Account' : 'Welcome Back'}
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            {isRegister ? 'Student Registration' : 'Login to Dashboard'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">

            {/* REGISTER ONLY */}
            {isRegister && (
              <>
                {/* FULL NAME */}
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                {/* RID */}
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                  placeholder="R ID (example: R43123)"
                  value={form.rid}
                  onChange={(e) =>
                    setForm({ ...form, rid: e.target.value })
                  }
                />
              </>
            )}

            {/* LOGIN ROLE SELECT */}
            {!isRegister && (
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="student">Student Login</option>
                <option value="admin">Admin Login</option>
              </select>
            )}

            {/* EMAIL */}
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              placeholder={
                form.role === 'admin'
                  ? 'Admin Mail ID'
                  : 'University Mail ID'
              }
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            {/* PASSWORD */}
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            {/* ADMIN LOGIN INFO */}
            {!isRegister && form.role === 'admin' && (
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                <p>
                  <strong>Admin Email:</strong> admin@smartlibrary.dev
                </p>

                <p>
                  <strong>Password:</strong> Admin@123
                </p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </p>
            )}

            {/* BUTTON */}
            <button
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : isRegister
                ? 'Register'
                : 'Login'}
            </button>

          </form>

          {/* TOGGLE BUTTON */}
          <button
            onClick={() => {
              setIsRegister((value) => !value);
              setError('');
              setForm(initialForm);
            }}
            className="mt-4 text-sm font-medium text-slate-600 underline-offset-4 hover:text-indigo-600 hover:underline"
          >
            {isRegister
              ? 'Already have an account? Login'
              : 'Need a student account? Register'}
          </button>

        </section>
      </div>
    </div>
  );
};

export default AuthPage;