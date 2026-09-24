import { useState } from 'react';
import { Check, Download, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatDateTime, formatTime } from '../../utils/format';
import { downloadTicketPdf } from '../../utils/pdf';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

export function TicketCard({ registration, compact = false }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  async function handleDownload() {
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadTicketPdf(registration);
    } catch {
      setDownloadError('The PDF could not be generated. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (!registration) return null;
  const { event } = registration;

  return (
    <article className={`digital-ticket ${compact ? 'digital-ticket-compact' : ''}`}>
      <div className="ticket-main">
        <div className="ticket-brand-line"><span className="brand-mark"><TicketIcon size={16} /></span><span>EVENTFLOW PASS</span><StatusBadge status={registration.checkedIn ? 'success' : 'pending'}>{registration.checkedIn ? 'Checked in' : 'Valid ticket'}</StatusBadge></div>
        <div className="ticket-event-name">{event.name}</div>
        <div className="ticket-info-grid">
          <div><span>Attendee</span><strong>{registration.attendeeName}</strong></div>
          <div><span>Date</span><strong>{formatDate(event.date, true)}</strong></div>
          <div><span>Time</span><strong>{formatTime(event.time)}</strong></div>
          <div><span>Venue</span><strong>{event.venue}</strong></div>
        </div>
        <div className="ticket-id-row"><span>Ticket ID</span><strong>{registration.ticketId}</strong></div>
        {registration.checkedIn && <div className="ticket-checkin-note"><Check size={15} /> Checked in {formatDateTime(registration.checkedInAt)}</div>}
      </div>
      <div className="ticket-tear" />
      <div className="ticket-qr-panel">
        <div className="qr-frame"><QRCodeSVG value={registration.qrPayload || registration.ticketId} size={compact ? 112 : 148} bgColor="#ffffff" fgColor="#172a3a" level="H" includeMargin /></div>
        <strong>Scan to check in</strong>
        <span>One ticket · one entry</span>
        <MapPin size={14} />
        <small>{event.venue}</small>
        {!compact && <Button variant="secondary" size="sm" loading={downloading} onClick={handleDownload}><Download size={15} />Download PDF</Button>}
        {downloadError && <span className="inline-error">{downloadError}</span>}
      </div>
    </article>
  );
}
