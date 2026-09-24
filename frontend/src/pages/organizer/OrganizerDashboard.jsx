import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Percent,
  Plus,
  TicketCheck,
  Users,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../../components/layout/PageIntro';
import { StatCard } from '../../components/common/StatCard';
import { DashboardEventTable } from '../../components/events/DashboardEventTable';
import { PageLoader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { useApiData } from '../../hooks/useApiData';
import { useAuth } from '../../context/AuthContext';

export function OrganizerDashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApiData('/dashboard/overview');
  const summary = data?.summary || {};
  const events = data?.events || [];

  if (loading && !data) return <PageLoader />;

  return (
    <div className="dashboard-page">
      <PageIntro
        eyebrow="ORGANIZER OVERVIEW"
        title={`Good morning, ${user.name.split(' ')[0]}.`}
        description="Here’s the live pulse across your events."
      >
        <Link to="/organizer/events/new" className="button button-primary">
          <Plus size={17} />Create event
        </Link>
      </PageIntro>

      {error && (
        <div className="form-alert">
          <span>{error}</span>
          <button type="button" className="text-link" onClick={refetch}>Retry</button>
        </div>
      )}

      <div className="stat-grid">
        <StatCard
          label="Total events"
          value={summary.totalEvents ?? 0}
          detail="Across your workspace"
          icon={CalendarDays}
          tone="teal"
        />
        <StatCard
          label="Event capacity"
          value={summary.totalCapacity ?? 0}
          detail="Seats planned"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Total registered"
          value={summary.totalRegistered ?? 0}
          detail="Live registrations"
          icon={UserCheck}
          tone="amber"
        />
        <StatCard
          label="Total checked in"
          value={summary.totalCheckedIn ?? 0}
          detail="Verified arrivals"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Remaining seats"
          value={summary.remainingSeats ?? 0}
          detail="Across all events"
          icon={TicketCheck}
          tone="teal"
        />
        <StatCard
          label="Check-in rate"
          value={`${summary.checkInPercentage ?? 0}%`}
          detail="Of registered attendees"
          icon={Percent}
          tone="blue"
        />
      </div>

      <div className="dashboard-split dashboard-split-top">
        <div className="insight-card">
          <div className="insight-icon"><CircleDollarSign size={20} /></div>
          <div>
            <span className="eyebrow">SEAT UTILIZATION</span>
            <strong>
              {summary.totalCapacity
                ? Math.round((summary.totalRegistered / summary.totalCapacity) * 100)
                : 0}%
            </strong>
            <p>{summary.remainingSeats ?? 0} seats are still available across your events.</p>
          </div>
          <div className="mini-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="quick-actions">
          <span className="eyebrow">QUICK ACTIONS</span>
          <Link to="/organizer/events">
            <span><CalendarDays size={17} />Manage your events</span><ArrowRight size={16} />
          </Link>
          <Link to="/organizer/registrations">
            <span><TicketCheck size={17} />Review registrations</span><ArrowRight size={16} />
          </Link>
          <Link to="/organizer/statistics">
            <span><CheckCircle2 size={17} />View live statistics</span><ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="section-block-header">
        <div>
          <span className="eyebrow">YOUR EVENTS</span>
          <h2>Keep an eye on the room.</h2>
        </div>
        <Link className="text-link" to="/organizer/events">View all <ArrowRight size={16} /></Link>
      </div>

      {events.length ? (
        <DashboardEventTable events={events.slice(0, 4)} />
      ) : (
        <EmptyState
          title="Create your first event"
          description="Set the details, share the registration link, and watch the pulse in real time."
          action={<Link to="/organizer/events/new" className="button button-primary"><Plus size={16} />Create event</Link>}
        />
      )}
    </div>
  );
}
