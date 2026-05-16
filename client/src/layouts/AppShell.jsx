import { BookOpen, LogOut, QrCode, ShieldCheck } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="flex items-center gap-3 text-slate-900">
            <div className="rounded-xl bg-indigo-600 p-2 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Smart Library</p>
              <p className="text-lg font-semibold">QR Based Book Tracking</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
          <div className="mb-4 rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-sm text-slate-300">Signed in as</p>
            <p className="mt-1 text-xl font-semibold">{user?.name}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {user?.role}
            </div>
          </div>
          <nav className="space-y-2">
            {user?.role === 'admin' ? (
              <>
                <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`} to="/admin">
                  <BookOpen className="h-4 w-4" /> Dashboard
                </NavLink>
                <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`} to="/admin/requests">
                  <ShieldCheck className="h-4 w-4" /> Requests
                </NavLink>
                <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`} to="/admin/returns">
                  <QrCode className="h-4 w-4" /> Scan Return
                </NavLink>
              </>
            ) : (
              <>
                <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`} to="/student">
                  <BookOpen className="h-4 w-4" /> Dashboard
                </NavLink>
                <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`} to="/student/scan">
                  <QrCode className="h-4 w-4" /> Scan QR
                </NavLink>
              </>
            )}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
