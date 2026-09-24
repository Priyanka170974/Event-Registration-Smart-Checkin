import { useMemo, useState } from 'react';
import { ArrowRight, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageIntro } from '../../components/layout/PageIntro';
import { PageLoader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { RegistrationTable } from '../../components/events/RegistrationTable';
import { useApiData } from '../../hooks/useApiData';
import { downloadTicketPdf } from '../../utils/pdf';

export function RegistrationsPage() {
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useApiData('/events/manage?limit=100');
  const events = useMemo(() => eventsData?.events || [], [eventsData]);
  const [eventId, setEventId] = useState('');
  const [query, setQuery] = useState('');
  const selectedEventId = events.some((item) => item._id === eventId) ? eventId : events[0]?._id || '';

  const {
  data,
  loading,
  error,
  refetch,
} = useApiData(
  selectedEventId ? `/registrations?eventId=${selectedEventId}` : null,
  { enabled: Boolean(selectedEventId) },
);

  const registrations = useMemo(() => {
    const rows = data?.registrations || [];
    const search = query.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter((registration) => (
      `${registration.attendeeName} ${registration.attendeeEmail} ${registration.ticketId}`
        .toLowerCase()
        .includes(search)
    ));
  }, [data, query]);

  async function handleDownload(registration) {
    try {
      await downloadTicketPdf(registration);
    } catch {
      toast.error('The PDF could not be generated.');
    }
  }

  if (eventsLoading) return <PageLoader />;

  return (
    <div className="dashboard-page">
      <PageIntro
        eyebrow="ATTENDEES"
        title="Registration desk."
        description="Review every guest, ticket, and check-in timestamp across your events."
      >
        <Link to="/organizer/events" className="button button-secondary">
          <Users size={16} />All events <ArrowRight size={16} />
        </Link>
      </PageIntro>

      {eventsError && <div className="form-alert">{eventsError}</div>}

      {!events.length && !eventsError ? (
        <EmptyState
          title="No events to manage yet"
          description="Create an event before reviewing registrations."
          action={<Link to="/organizer/events/new" className="button button-primary">Create event</Link>}
        />
      ) : (
        <>
          <div className="registration-desk-toolbar">
            <label className="select-field">
              <span>Event</span>
              <select
                value={selectedEventId}
                onChange={(event) => setEventId(event.target.value)}
              >
                {events.map((event) => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
            </label>
            <label className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, or ticket ID"
                aria-label="Search registrations"
              />
            </label>
          </div>

          {error ? (
            <div className="form-alert">
              <span>{error}</span>
              <button type="button" className="text-link" onClick={refetch}>Retry</button>
            </div>
          ) : loading ? (
            <PageLoader label="Loading registrations…" />
          ) : registrations.length ? (
            <RegistrationTable registrations={registrations} onDownload={handleDownload} />
          ) : (
            <EmptyState
              title="No registrations found"
              description={query
                ? 'Try a different search.'
                : 'Share your public event page to welcome your first guests.'}
            />
          )}
        </>
      )}
    </div>
  );
}
