import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PageLoader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { useApiData } from '../hooks/useApiData';
import { useDataRefresh } from '../context/DataRefreshContext';
import { registrationService } from '../services/registrationService';
import { getApiError } from '../services/api';
import { formatDate, formatTime } from '../utils/format';

export function RegisterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useDataRefresh();
  const { data: eventList, loading: listLoading, error: listError } = useApiData('/events?limit=100');
  const events = useMemo(() => eventList?.events || [], [eventList]);
  const [selectedId, setSelectedId] = useState(id || '');
  const [form, setForm] = useState({ attendeeName: '', attendeeEmail: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: selectedData, loading: detailLoading, error: detailError } = useApiData(
    selectedId ? `/events/${selectedId}` : null,
    { enabled: Boolean(selectedId) },
  );
  const event = selectedData?.event || events.find((item) => item._id === selectedId) || null;

  useEffect(() => {
    if (!selectedId && events.length) setSelectedId(events[0]._id);
  }, [events, selectedId]);

  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  const eventOptions = useMemo(() => {
    if (event && !events.some((item) => item._id === event._id)) return [event, ...events];
    return events;
  }, [event, events]);

  function update(inputEvent) {
    setForm((current) => ({
      ...current,
      [inputEvent.target.name]: inputEvent.target.value,
    }));
    setError('');
  }

  function changeEvent(nextEventId) {
    setSelectedId(nextEventId);
    setError('');
    navigate(`/events/${nextEventId}/register`, { replace: true });
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    if (!form.attendeeName.trim() || !form.attendeeEmail.trim()) {
      setError('Enter your full name and email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.attendeeEmail.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!selectedId) {
      setError('Choose an event before registering.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await registrationService.create({ ...form, eventId: selectedId });
      window.sessionStorage.setItem('eventflow_last_ticket', JSON.stringify(result.registration));
      refresh();
      toast.success('Your ticket is ready.');
      navigate('/registration/success', { state: { registration: result.registration } });
    } catch (requestError) {
      const message = getApiError(requestError, 'Registration could not be completed.');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (listLoading || (selectedId && detailLoading && !event)) {
    return <div className="public-page"><PublicNavbar /><PageLoader label="Preparing registration…" /></div>;
  }

  if (listError || detailError) {
    return (
      <div className="public-page">
        <PublicNavbar />
        <main className="page-section">
          <div className="container">
            <div className="form-alert">{listError || detailError}</div>
            <Link className="text-link back-link" to="/events"><ArrowLeft size={16} />Browse events</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="public-page">
        <PublicNavbar />
        <main className="page-section">
          <div className="container">
            <div className="form-alert">No events are available for registration right now.</div>
            <Link className="text-link back-link" to="/events"><ArrowLeft size={16} />Browse events</Link>
          </div>
        </main>
      </div>
    );
  }

  const full = event.registrationStatus === 'FULL';

  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="registration-page">
        <div className="container">
          <Link className="text-link back-link" to={`/events/${event._id}`}>
            <ArrowLeft size={16} />Back to event
          </Link>
          <div className="registration-grid">
            <section className="registration-copy">
              <span className="eyebrow">RESERVE YOUR PLACE</span>
              <h1>Let's make it official.</h1>
              <p>
                Register in under a minute. We'll create a secure digital ticket with a QR code
                you can present at the door.
              </p>
              <div className="registration-assurance">
                <span>
                  <ShieldCheck size={18} />
                  <strong>Capacity protected</strong>
                  <small>Seats are reserved atomically.</small>
                </span>
                <span>
                  <CheckCircle2 size={18} />
                  <strong>Instant ticket</strong>
                  <small>Your QR code is ready right away.</small>
                </span>
              </div>
            </section>

            <section className="registration-card">
              <div className="registration-card-heading">
                <div>
                  <span className="eyebrow">YOUR RESERVATION</span>
                  <h2>Register as an attendee</h2>
                </div>
                <StatusBadge status={event.registrationStatus} />
              </div>

              <FormField label="Choose an event" name="eventId">
                <select
                  id="eventId"
                  name="eventId"
                  value={selectedId}
                  onChange={(inputEvent) => changeEvent(inputEvent.target.value)}
                >
                  {eventOptions.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}{item.registrationStatus === 'FULL' ? ' — Full' : ''}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="selected-event-summary">
                <div><CalendarDays size={16} /><span>{formatDate(event.date, true)} · {formatTime(event.time)}</span></div>
                <div><MapPin size={16} /><span>{event.venue}</span></div>
                <div className="summary-capacity">
                  <Users size={16} />
                  <span>{event.registered} / {event.capacity} registered</span>
                </div>
                <ProgressBar value={event.registered} max={event.capacity} />
              </div>

              {error && <div className="form-alert" role="alert">{error}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <FormField label="Full name" name="attendeeName">
                  <input
                    id="attendeeName"
                    name="attendeeName"
                    autoComplete="name"
                    value={form.attendeeName}
                    onChange={update}
                    placeholder="As it should appear on your ticket"
                    required
                  />
                </FormField>
                <FormField
                  label="Email address"
                  name="attendeeEmail"
                  hint="We use this to identify your registration."
                >
                  <input
                    id="attendeeEmail"
                    name="attendeeEmail"
                    type="email"
                    autoComplete="email"
                    value={form.attendeeEmail}
                    onChange={update}
                    placeholder="you@example.com"
                    required
                  />
                </FormField>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={full || !selectedId}
                  className="button-full"
                >
                  {full ? 'Registration closed' : 'Create my ticket'}<ArrowRight size={17} />
                </Button>
              </form>
              <p className="form-legal">
                By registering, you agree to receive your event ticket and operational updates for this event.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
