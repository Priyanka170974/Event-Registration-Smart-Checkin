import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { TicketCard } from '../components/ticket/TicketCard';
import { PageLoader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { useApiData } from '../hooks/useApiData';

export function TicketPage() {
  const { ticketId } = useParams();
  const [saved, setSaved] = useState(null);
  const { data, loading, error, refetch } = useApiData(`/registrations/ticket/${encodeURIComponent(ticketId)}`);
  const registration = data?.registration || saved;

  useEffect(() => {
    if (data?.registration) setSaved(data.registration);
  }, [data]);

  if (loading && !registration) return <div className="public-page"><PublicNavbar /><PageLoader label="Loading your ticket…" /></div>;
  if (error && !registration) return <div className="public-page"><PublicNavbar /><main className="page-section"><div className="container"><div className="form-alert">{error}</div><Link to="/events" className="text-link back-link"><ArrowLeft size={16} />Browse events</Link></div></main></div>;
  if (!registration) return <div className="public-page"><PublicNavbar /><main className="not-found"><TicketIcon size={28} /><h1>Ticket not found.</h1><Link to="/events" className="button button-primary">Browse events</Link></main></div>;

  return <div className="public-page"><PublicNavbar /><main className="ticket-page"><div className="container"><div className="ticket-page-top"><Link to={`/events/${registration.event._id}`} className="text-link back-link"><ArrowLeft size={16} />Back to event</Link><Button variant="ghost" size="sm" onClick={refetch}><RefreshCw size={15} />Refresh status</Button></div><div className="ticket-page-heading"><span className="eyebrow">DIGITAL PASS</span><h1>Your EventFlow ticket.</h1><p>Show this QR code at the event entrance. A volunteer will verify it against live event data.</p></div><TicketCard registration={registration} /></div></main></div>;
}
