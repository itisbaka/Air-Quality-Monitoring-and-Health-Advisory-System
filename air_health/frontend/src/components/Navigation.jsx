import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-800 text-white px-4 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">Air Health Dashboard</span>
          <nav className="hidden sm:flex gap-2">
            <Link className="hover:text-slate-200" to="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-slate-200" to="/register">
              Register
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm">{user.username}</span>
              <button
                type="button"
                className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
