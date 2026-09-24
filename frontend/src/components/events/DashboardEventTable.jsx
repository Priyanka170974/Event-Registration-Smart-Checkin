import { ArrowUpRight, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime } from '../../utils/format';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';

export function DashboardEventTable({ events = [], actionLabel = 'Manage' }) {
  return <div className="table-card"><div className="table-card-header"><div><span className="eyebrow">EVENT PULSE</span><h2>Capacity at a glance</h2></div><span className="table-count">{events.length} {events.length === 1 ? 'event' : 'events'}</span></div><div className="responsive-table"><table><thead><tr><th>Event</th><th>When</th><th>Capacity</th><th>Checked in</th><th>Status</th><th /></tr></thead><tbody>{events.map((event) => <tr key={event._id}><td><div className="table-event-name"><span className="table-event-icon"><MapPin size={15} /></span><span><strong>{event.name}</strong><small>{event.venue}</small></span></div></td><td><span>{formatDate(event.date)}</span><small>{formatTime(event.time)}</small></td><td className="capacity-cell"><div><strong>{event.registered} / {event.capacity}</strong><small>{event.remainingSeats} remaining</small></div><ProgressBar value={event.registered} max={event.capacity} /></td><td><span className="checkin-cell"><CheckCircle2 size={15} />{event.checkedIn}</span><small>{event.checkInPercentage}% of guests</small></td><td><StatusBadge status={event.registrationStatus} /></td><td><Link className="icon-link" to={`/organizer/events/${event._id}`} aria-label={`${actionLabel} ${event.name}`}><ArrowUpRight size={17} /></Link></td></tr>)}</tbody></table></div></div>;
}
