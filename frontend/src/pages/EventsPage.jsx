import { useMemo, useState } from 'react';
import { CalendarDays, Filter, Search, Sparkles } from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { EventCard } from '../components/events/EventCard';
import { PageLoader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { useApiData } from '../hooks/useApiData';

export function EventsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { data, loading, error, refetch } = useApiData('/events?limit=100');
  const events = useMemo(() => data?.events || [], [data]);

  const filtered = useMemo(
    () => events.filter((event) => {
      const searchText = `${event.name} ${event.description} ${event.venue}`.toLowerCase();
      const matchesQuery = !query || searchText.includes(query.trim().toLowerCase());
      const matchesFilter = filter === 'all' || event.registrationStatus === filter;
      return matchesQuery && matchesFilter;
    }),
    [events, filter, query],
  );

  function clearFilters() {
    setQuery('');
    setFilter('all');
  }

  return (
    <div className="public-page">
      <PublicNavbar />
      <main className="page-section">
        <div className="container">
          <div className="page-intro public-intro">
            <div>
              <span className="eyebrow"><Sparkles size={14} /> FIND YOUR NEXT ROOM</span>
              <h1>Events worth showing up for.</h1>
              <p>Browse live listings, check remaining seats, and reserve your place in a few clicks.</p>
            </div>
          </div>

          <div className="event-toolbar">
            <label className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by event, venue, or theme"
                aria-label="Search events"
              />
            </label>
            <div className="filter-pills" aria-label="Filter events by registration status">
              <Filter size={15} />
              {['all', 'OPEN', 'FULL'].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? 'filter-pill active' : 'filter-pill'}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all' ? 'All events' : value === 'OPEN' ? 'Open' : 'Full'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <PageLoader label="Loading live events…" />
          ) : error ? (
            <div className="form-alert">
              <span>{error}</span>
              <button type="button" className="text-link" onClick={refetch}>Try again</button>
            </div>
          ) : filtered.length ? (
            <>
              <div className="results-heading">
                <span>{filtered.length} live {filtered.length === 1 ? 'listing' : 'listings'}</span>
              </div>
              <div className="event-grid event-grid-public">
                {filtered.map((event) => <EventCard key={event._id} event={event} />)}
              </div>
            </>
          ) : (
            <EmptyState
              title="No events match"
              description="Try a different search or browse all listings."
              action={(
                <button type="button" className="button button-secondary button-sm" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            />
          )}
        </div>
      </main>
      <footer className="public-footer">
        <div className="container footer-inner">
          <span className="brand"><span className="brand-mark"><CalendarDays size={16} /></span>EventFlow</span>
          <span>Live listings, thoughtfully made.</span>
          <span>© {new Date().getFullYear()} EventFlow</span>
        </div>
      </footer>
    </div>
  );
}
