import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Ticket,
  UserRound,
  XCircle,
} from 'lucide-react';
import { formatDateTime } from '../../utils/format';

export function CheckInResult({ result, error, ticketId }) {
  if (error) {
    const already = error.code === 'TICKET_ALREADY_CHECKED_IN';
    const eventName = error.ticket?.event?.name;
    const resolvedTicketId = error.ticket?.ticketId || ticketId;

    return (
      <section className={`checkin-result result-error ${already ? 'result-warning' : ''}`}>
        <div className="result-icon">
          {already ? <Clock3 size={23} /> : <XCircle size={23} />}
        </div>
        <div className="result-copy">
          <span className="eyebrow">VERIFICATION RESULT</span>
          <h3>{already ? 'Already checked in' : 'Ticket not accepted'}</h3>
          <p>{error.message || 'This ticket could not be checked in.'}</p>
          {resolvedTicketId && <code>{resolvedTicketId}</code>}
          {eventName && <small>{eventName}</small>}
          {already && (
            <small>
              Status: checked in{error.ticket?.checkedInAt
                ? ` at ${formatDateTime(error.ticket.checkedInAt)}`
                : ''}
            </small>
          )}
        </div>
        {!already && <AlertTriangle className="result-watermark" size={56} aria-hidden="true" />}
      </section>
    );
  }

  if (!result) return null;
  const { ticket } = result;

  return (
    <section className="checkin-result result-success">
      <div className="result-icon"><CheckCircle2 size={24} /></div>
      <div className="result-copy">
        <span className="eyebrow">VERIFICATION RESULT</span>
        <h3>Checked in successfully</h3>
        <p>{result.message || 'This ticket has been accepted.'}</p>
      </div>
      <div className="result-ticket-details">
        <div><UserRound size={15} /><span>Attendee</span><strong>{ticket.attendeeName}</strong></div>
        <div><CalendarDays size={15} /><span>Event</span><strong>{ticket.event?.name || 'Event'}</strong></div>
        <div><Ticket size={15} /><span>Ticket</span><strong>{ticket.ticketId}</strong></div>
        <div><Clock3 size={15} /><span>Status</span><strong>Checked in</strong></div>
        <div><Clock3 size={15} /><span>Time</span><strong>{formatDateTime(ticket.checkedInAt)}</strong></div>
      </div>
    </section>
  );
}
