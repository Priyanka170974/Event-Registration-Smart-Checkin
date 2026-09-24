import { useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Download, MapPin, Save, Trash2, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/common/Loader';
import { EventForm } from '../../components/events/EventForm';
import { RegistrationTable } from '../../components/events/RegistrationTable';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { useApiData } from '../../hooks/useApiData';
import { eventService } from '../../services/eventService';
import { getApiError } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { downloadTicketPdf } from '../../utils/pdf';
import { formatDate, formatTime } from '../../utils/format';

export function EventManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useDataRefresh();
  const { data: eventData, loading: eventLoading, error: eventError } = useApiData(`/events/${id}`);
  const { data: registrationData, loading: registrationLoading, error: registrationError } = useApiData(`/events/${id}/registrations`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const event = eventData?.event;
  const registrations = registrationData?.registrations || [];

  async function handleUpdate(payload) {
    setSaving(true);
    setError('');
    try {
      await eventService.update(id, payload);
      refresh();
      toast.success('Event details updated.');
    } catch (requestError) {
      const message = getApiError(requestError, 'Unable to update this event.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete “${event.name}” and all of its registrations? This cannot be undone.`)) return;
    try {
      await eventService.remove(id);
      refresh();
      toast.success('Event deleted.');
      navigate('/organizer/events');
    } catch (requestError) {
      toast.error(getApiError(requestError, 'Unable to delete this event.'));
    }
  }

  async function handleDownload(registration) {
    try {
      await downloadTicketPdf(registration);
    } catch {
      toast.error('The PDF could not be generated.');
    }
  }

  if (eventLoading || registrationLoading) return <PageLoader />;
  if (eventError || !event) return <div className="form-alert">{eventError || 'Event not found.'}</div>;

  return <div className="dashboard-page"><Link to="/organizer/events" className="text-link back-link"><ArrowLeft size={16} />Back to events</Link><div className="manage-heading"><div><span className="eyebrow">EVENT MANAGEMENT</span><h1>{event.name}</h1><p><CalendarDays size={15} />{formatDate(event.date, true)} · {formatTime(event.time)} <span>·</span> <MapPin size={15} />{event.venue}</p></div><Button variant="danger" onClick={handleDelete}><Trash2 size={16} />Delete event</Button></div><div className="stat-grid stat-grid-compact"><StatCard label="Registered" value={`${event.registered} / ${event.capacity}`} detail={`${event.remainingSeats} seats remaining`} icon={Users} tone="teal" /><StatCard label="Checked in" value={event.checkedIn} detail={`${event.checkInPercentage ?? 0}% of guests`} icon={CheckCircle2} tone="green" /></div><div className="manage-grid"><section className="form-card"><div className="form-card-heading"><div><h2>Edit event details</h2><p>Changes update the public event page immediately.</p></div><Save size={19} className="heading-icon" /></div>{error && <div className="form-alert">{error}</div>}<EventForm initialEvent={event} onSubmit={handleUpdate} loading={saving} submitLabel="Save changes" /></section><section className="event-preview-card"><span className="eyebrow">PUBLIC PREVIEW</span><h2>{event.name}</h2><p>{event.description}</p><div className="preview-facts"><span><CalendarDays size={15} />{formatDate(event.date, true)}</span><span><CalendarDays size={15} />{formatTime(event.time)}</span><span><MapPin size={15} />{event.venue}</span></div><div className="preview-status"><span>Registration</span><strong>{event.registrationStatus === 'FULL' ? 'Closed' : 'Open'}</strong></div><Link className="button button-secondary button-full" to={`/events/${event._id}`} target="_blank" rel="noreferrer">View public page <ArrowLeft size={15} className="rotate-180" /></Link></section></div><section className="section-block-header registrations-heading"><div><span className="eyebrow">LIVE ATTENDEES</span><h2>Check-in activity</h2></div><span className="muted-text">{registrations.length} registrations · updates automatically</span></section>{registrationError ? <div className="form-alert">{registrationError}</div> : <RegistrationTable registrations={registrations} onDownload={handleDownload} />}</div>;
}
