import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/format';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';

export function EventCard({ event, compact = false }) {
  return (
    <article className={`event-card ${compact ? 'event-card-compact' : ''}`}>
      <div className="event-card-topline">
        <span className="eyebrow">EVENT</span>
        <StatusBadge status={event.registrationStatus} />
      </div>
      <h3>{event.name}</h3>
      {!compact && <p className="event-description">{event.description}</p>}
      <div className="event-meta">
        <span><CalendarDays size={15} />{formatDate(event.date)} · {formatTime(event.time)}</span>
        <span><MapPin size={15} />{event.venue}</span>
      </div>
      <div className="event-card-footer">
        <div className="event-capacity">
          <ProgressBar value={event.registered} max={event.capacity} label={`${event.registered} / ${event.capacity} registered`} />
          <span className="muted-text"><Users size={14} /> {event.remainingSeats} seats remaining</span>
        </div>
        <Link className="text-link" to={`/events/${event._id}`}>
          View details <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
