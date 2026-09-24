import { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Settings2,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/format';

const organizerLinks = [
  { to: '/organizer', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/organizer/events', label: 'My events', icon: CalendarDays },
  { to: '/organizer/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/organizer/events/new', label: 'Create event', icon: Sparkles },
  { to: '/organizer/statistics', label: 'Statistics', icon: BarChart3 },
];

const volunteerLinks = [
  { to: '/volunteer', label: 'Check-in desk', icon: QrCode, end: true },
  { to: '/volunteer/history', label: 'How it works', icon: ClipboardList },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = user.role === 'organizer' ? organizerLinks : volunteerLinks;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand-row">
          <NavLink to="/" className="brand brand-on-dark" onClick={() => setSidebarOpen(false)}>
            <span className="brand-mark"><CalendarDays size={18} /></span><span>EventFlow</span>
          </NavLink>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X size={19} /></button>
        </div>
        <div className="workspace-label">{user.role === 'organizer' ? 'ORGANIZER SPACE' : 'VOLUNTEER SPACE'}</div>
        <nav className="dashboard-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Settings2 size={16} />
            <span>{user.role === 'organizer' ? 'Your event command center' : 'Fast, friendly check-in'}</span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}><LogOut size={17} />Log out</button>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar overlay" />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="mobile-sidebar-button icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={20} /></button>
          <div className="topbar-context">
            <span className="topbar-kicker">EVENTFLOW / {user.role === 'organizer' ? 'CONSOLE' : 'CHECK-IN'}</span>
            <span className="topbar-location">{getPageName(location.pathname)}</span>
          </div>
          <div className="topbar-actions">
            <div className="topbar-user">
              <span className="avatar">{getInitials(user.name)}</span>
              <span><strong>{user.name}</strong><small>{user.role}</small></span>
            </div>
          </div>
        </header>
        <main className="dashboard-content"><Outlet /></main>
      </div>
    </div>
  );
}

function getPageName(pathname) {
  if (pathname.includes('/statistics')) return 'Statistics';
  if (pathname.includes('/registrations')) return 'Registrations';
  if (pathname.includes('/events/new')) return 'Create event';
  if (pathname.includes('/events')) return 'My events';
  if (pathname.includes('/volunteer/history')) return 'Volunteer guide';
  if (pathname.includes('/volunteer')) return 'Check-in desk';
  return 'Overview';
}
