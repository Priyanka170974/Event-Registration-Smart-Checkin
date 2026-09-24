import {
  ArrowRight,
  CalendarCheck2,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { EventCard } from '../components/events/EventCard';
import { useApiData } from '../hooks/useApiData';
import { PageLoader } from '../components/common/Loader';

export function LandingPage() {
  const { data, loading, error } = useApiData('/events?status=open&limit=3');
  const events = data?.events || [];

  return (
    <div className="public-page">
      <PublicNavbar />
      <main>
        <section className="hero-section">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow eyebrow-light">
                <Sparkles size={14} /> THE OPERATING SYSTEM FOR GREAT EVENTS
              </span>
              <h1>Make every arrival feel <em>effortless.</em></h1>
              <p>
                One calm workspace for registration, capacity, digital tickets, and smart
                check-in — from first invite to final guest.
              </p>
              <div className="hero-actions">
                <Link to="/events" className="button button-light">
                  Explore events <ArrowRight size={17} />
                </Link>
                <Link to="/signup" className="hero-text-link">
                  Create your first event <ArrowRight size={16} />
                </Link>
              </div>
              <div className="hero-proof">
                <span><Check size={15} /> Strict capacity control</span>
                <span><Check size={15} /> Duplicate-safe check-in</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="EventFlow workflow illustration">
              <div className="hero-card hero-card-main">
                <div className="hero-card-top">
                  <span className="mini-label">WORKFLOW PREVIEW</span>
                  <span className="live-dot">Live</span>
                </div>
                <div className="hero-event-name">From invite to arrival</div>
                <div className="hero-event-date">Real records. One connected flow.</div>
                <div className="hero-progress-label">
                  <span>Secure event operations</span>
                  <strong>Ready</strong>
                </div>
                <div className="hero-progress"><span /></div>
                <div className="hero-stat-row">
                  <div><strong>Atomic</strong><small>capacity</small></div>
                  <div><strong>Unique</strong><small>tickets</small></div>
                  <div><strong>Once</strong><small>check-in</small></div>
                </div>
              </div>
              <div className="hero-floating hero-floating-top">
                <QrCode size={18} />
                <span>QR payload ready</span>
                <strong>Real verification</strong>
              </div>
              <div className="hero-floating hero-floating-bottom">
                <ShieldCheck size={18} />
                <span>Protected check-in</span>
                <strong>Exactly once</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <div className="section-heading centered">
              <span className="eyebrow">A BETTER EVENT DAY</span>
              <h2>Everything your front desk needs.</h2>
              <p>Thoughtful tools for organizers, volunteers, and every attendee in between.</p>
            </div>
            <div className="feature-grid">
              <Feature
                icon={CalendarCheck2}
                title="Registration that holds"
                text="Capacity is enforced by the database, not a hopeful button. Every seat is real."
              />
              <Feature
                icon={QrCode}
                title="Tickets that travel"
                text="Give guests a crisp digital pass with a real QR code and a downloadable PDF backup."
              />
              <Feature
                icon={ShieldCheck}
                title="Check-in you can trust"
                text="An atomic backend update means one ticket can only be consumed once."
              />
            </div>
          </div>
        </section>

        <section className="section upcoming-section">
          <div className="container">
            <div className="section-heading section-heading-row">
              <div>
                <span className="eyebrow">OPEN FOR REGISTRATION</span>
                <h2>Find your next room.</h2>
              </div>
              <Link className="text-link" to="/events">View all events <ArrowRight size={16} /></Link>
            </div>
            {loading ? (
              <PageLoader label="Loading live events…" />
            ) : error ? (
              <div className="form-alert">
                Events are temporarily unavailable. <Link to="/events">Try again</Link>.
              </div>
            ) : events.length ? (
              <div className="event-grid">
                {events.map((event) => <EventCard key={event._id} event={event} />)}
              </div>
            ) : (
              <div className="empty-inline">No open events yet. Check back soon.</div>
            )}
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-inner">
            <div>
              <span className="eyebrow eyebrow-light">READY WHEN YOU ARE</span>
              <h2>Turn the door into a welcome.</h2>
              <p>Bring your next event into focus with a workspace that keeps the details moving.</p>
            </div>
            <Link to="/signup" className="button button-light">
              Start with EventFlow <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <div className="container footer-inner">
          <span className="brand"><span className="brand-mark"><Sparkles size={16} /></span>EventFlow</span>
          <span>Registration, refined.</span>
          <span>© {new Date().getFullYear()} EventFlow</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="feature-card">
      <span className="feature-icon"><Icon size={20} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
