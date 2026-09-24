import { useState } from 'react';
import { CalendarDays, LogOut, Menu, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="public-nav">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark"><CalendarDays size={18} /></span>
          <span>EventFlow</span>
        </Link>
        <button className="nav-toggle icon-button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`public-links ${open ? 'is-open' : ''}`}>
          <NavLink to="/events" onClick={() => setOpen(false)}>Explore events</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to={user.role === 'organizer' ? '/organizer' : '/volunteer'} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <button className="nav-user" onClick={handleLogout}><span className="avatar avatar-small">{user.name.slice(0, 1).toUpperCase()}</span>{user.name}<LogOut size={15} /></button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink>
              <Link className="button button-primary button-sm" to="/signup" onClick={() => setOpen(false)}>Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
