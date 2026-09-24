import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { TicketCard } from '../components/ticket/TicketCard';
import { PageLoader } from '../components/common/Loader';
import { useApiData } from '../hooks/useApiData';

function readSavedTicket() {
  const saved = window.sessionStorage.getItem('eventflow_last_ticket');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    window.sessionStorage.removeItem('eventflow_last_ticket');
    return null;
  }
}

export function RegistrationSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedRegistration, setSavedRegistration] = useState(() => readSavedTicket());
  const initial = location.state?.registration || savedRegistration;
  const ticketUrl = useMemo(
    () => initial?.ticketId ? `/registrations/ticket/${encodeURIComponent(initial.ticketId)}` : null,
    [initial?.ticketId],
  );
  const { data, loading, error } = useApiData(ticketUrl, { enabled: Boolean(ticketUrl) });
  const registration = data?.registration || initial;

  if (!registration && loading) {
    return <div className="public-page"><PublicNavbar /><PageLoader label="Preparing your ticket…" /></div>;
  }
  if (!registration) return <Navigate to="/events" replace />;

  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="success-page">
        <div className="container">
          <div className="success-heading">
            <span className="success-icon"><CheckCircle2 size={27} /></span>
            <span className="eyebrow">YOU'RE ON THE LIST</span>
            <h1>Your place is saved.</h1>
            <p>
              Keep this ticket handy. Present the QR code at check-in — each ticket can be used
              exactly once.
            </p>
          </div>

          <TicketCard registration={registration} />

          <div className="success-next">
            <div>
              <Mail size={17} />
              <span>Your confirmation is tied to <strong>{registration.attendeeEmail}</strong>.</span>
            </div>
            <Link className="text-link" to={`/tickets/${encodeURIComponent(registration.ticketId)}`}>
              Open live ticket <ArrowRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            className="button button-secondary success-done"
            onClick={() => {
              window.sessionStorage.removeItem('eventflow_last_ticket');
              setSavedRegistration(null);
              navigate('/events');
            }}
          >
            <Sparkles size={16} />Done
          </button>

          {error && (
            <p className="muted-text success-refresh-note">
              Live status refresh is unavailable. Your saved ticket remains available offline in this tab.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
