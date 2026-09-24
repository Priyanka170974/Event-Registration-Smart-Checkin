import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, Plus, Search, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageIntro } from '../../components/layout/PageIntro';
import { PageLoader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useApiData } from '../../hooks/useApiData';
import { eventService } from '../../services/eventService';
import { getApiError } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { formatDate, formatTime } from '../../utils/format';

export function MyEventsPage() {
  const { data, loading, error, refetch } = useApiData('/events/manage?limit=100');
  const { refresh } = useDataRefresh();
  const [query, setQuery] = useState('');
  const events = useMemo(() => (data?.events || []).filter((event) => `${event.name} ${event.venue}`.toLowerCase().includes(query.toLowerCase())), [data, query]);

  async function removeEvent(event) {
    if (!window.confirm(`Delete “${event.name}” and all of its registrations? This cannot be undone.`)) return;
    try {
      await eventService.remove(event._id);
      refresh();
      toast.success('Event deleted.');
    } catch (requestError) {
      toast.error(getApiError(requestError, 'Unable to delete this event.'));
    }
  }

  return <div className="dashboard-page"><PageIntro eyebrow="EVENTS" title="Your events, in one view." description="Manage the details, registrations, and check-in pulse for every event you host."><Link to="/organizer/events/new" className="button button-primary"><Plus size={17} />Create event</Link></PageIntro><div className="list-toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your events" aria-label="Search your events" /></label><span className="list-count">{events.length} {events.length === 1 ? 'event' : 'events'}</span></div>{loading ? <PageLoader /> : error ? <div className="form-alert"><span>{error}</span><button className="text-link" onClick={refetch}>Retry</button></div> : events.length ? <div className="managed-event-list">{events.map((event) => <article className="managed-event-row" key={event._id}><div className="managed-event-icon"><CalendarDays size={19} /></div><div className="managed-event-info"><div className="managed-event-title"><h2>{event.name}</h2><StatusBadge status={event.registrationStatus} /></div><p><MapPin size={14} />{event.venue}<span>·</span>{formatDate(event.date)} · {formatTime(event.time)}</p><div className="managed-event-progress"><ProgressBar value={event.registered} max={event.capacity} label={`${event.registered} / ${event.capacity} registered`} /><span><Users size={14} />{event.remainingSeats} seats remaining</span></div></div><div className="managed-event-actions"><Link className="button button-secondary button-sm" to={`/organizer/events/${event._id}`}>Manage <ArrowRight size={15} /></Link><button className="icon-button danger-icon" onClick={() => removeEvent(event)} aria-label={`Delete ${event.name}`}><Trash2 size={16} /></button></div></article>)}</div> : <EmptyState title="No events yet" description="Create your first event and start accepting registrations." action={<Link to="/organizer/events/new" className="button button-primary"><Plus size={16} />Create event</Link>} />}</div>;
}
