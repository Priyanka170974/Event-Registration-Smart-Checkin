import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PageLoader } from '../components/common/Loader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useApiData } from '../hooks/useApiData';
import { formatDate, formatTime } from '../utils/format';

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApiData(`/events/${id}`);
  const event = data?.event;

  if (loading) return <div className="public-page"><PublicNavbar /><PageLoader label="Loading event…" /></div>;
  if (error || !event) return <div className="public-page"><PublicNavbar /><main className="page-section"><div className="container"><div className="form-alert">{error || 'Event not found.'}</div><Link className="text-link back-link" to="/events"><ArrowLeft size={16} />Back to events</Link></div></main></div>;

  const full = event.registrationStatus === 'FULL';
  return <div className="public-page"><PublicNavbar /><main className="event-detail-page"><div className="container"><Link className="text-link back-link" to="/events"><ArrowLeft size={16} />Back to events</Link><div className="event-detail-hero"><div className="event-detail-copy"><div className="event-card-topline"><span className="eyebrow">EVENT LISTING</span><StatusBadge status={event.registrationStatus} /></div><h1>{event.name}</h1><p>{event.description}</p><div className="detail-facts"><span><CalendarDays size={18} /><strong>{formatDate(event.date, true)}</strong></span><span><Clock3 size={18} /><strong>{formatTime(event.time)}</strong></span><span><MapPin size={18} /><strong>{event.venue}</strong></span><span><Users size={18} /><strong>{event.capacity} capacity</strong></span></div></div><div className="detail-registration-card"><span className="eyebrow">YOUR NEXT STEP</span><h2>{full ? 'This room is full.' : 'Save your seat.'}</h2><p>{full ? 'Registration is closed because every available seat has been reserved.' : 'A digital ticket with a real QR code will be ready immediately.'}</p><div className="detail-capacity"><ProgressBar value={event.registered} max={event.capacity} label={`${event.registered} of ${event.capacity} registered`} /><strong>{event.remainingSeats} seats remaining</strong></div><button className="button button-primary button-full" disabled={full} onClick={() => navigate(`/events/${event._id}/register`)}>{full ? 'Registration closed' : 'Register for this event'}<ArrowRight size={17} /></button></div></div><div className="event-detail-foot"><span>Hosted by {event.organizer?.name || 'EventFlow organizer'}</span><span>Capacity is protected at the database level.</span></div></div></main></div>;
}
