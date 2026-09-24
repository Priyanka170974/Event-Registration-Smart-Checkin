import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Keyboard,
  ShieldCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageIntro } from '../../components/layout/PageIntro';
import { PageLoader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QrScanner } from '../../components/qr/QrScanner';
import { CheckInResult } from '../../components/checkin/CheckInResult';
import { useApiData } from '../../hooks/useApiData';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { checkInService } from '../../services/checkInService';
import { getApiError } from '../../services/api';
import { parseQrPayload } from '../../utils/qr';
import { formatDate } from '../../utils/format';

export function VolunteerDashboard() {
  const { data, loading, error: eventsError, refetch } = useApiData('/events?limit=100');
  const { refresh } = useDataRefresh();
  const events = useMemo(() => data?.events || [], [data]);
  const [selectedEventId, setSelectedEventId] = useState(
    () => window.localStorage.getItem('eventflow_checkin_event') || '',
  );
  const [manualTicket, setManualTicket] = useState('');
  const [lastAttemptedTicket, setLastAttemptedTicket] = useState('');
  const [result, setResult] = useState(null);
  const [checkInError, setCheckInError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const selectedEvent = useMemo(
    () => events.find((event) => event._id === selectedEventId) || null,
    [events, selectedEventId],
  );

  useEffect(() => {
    if (loading && !data) return;
    if (!events.length) {
      if (selectedEventId) setSelectedEventId('');
      return;
    }
    if (!selectedEventId || !events.some((event) => event._id === selectedEventId)) {
      setSelectedEventId(events[0]._id);
    }
  }, [data, events, loading, selectedEventId]);

  useEffect(() => {
    if (selectedEventId) window.localStorage.setItem('eventflow_checkin_event', selectedEventId);
  }, [selectedEventId]);

  const performCheckIn = useCallback(async (
    rawTicket,
    eventId = selectedEventId,
    source = 'verify',
  ) => {
    const ticketId = rawTicket?.trim().toUpperCase();
    if (!ticketId || !eventId || processingRef.current) return null;

    processingRef.current = true;
    setProcessing(true);
    setResult(null);
    setCheckInError(null);
    setLastAttemptedTicket(ticketId);

    try {
      const response = source === 'scan'
        ? await checkInService.scan({ eventId, ticketId })
        : await checkInService.verify({ eventId, ticketId });
      setResult(response);
      refresh();
      toast.success('Guest checked in.');
      return response;
    } catch (requestError) {
      const message = getApiError(requestError, 'This ticket could not be verified.');
      setCheckInError({
        message,
        code: requestError?.response?.data?.code,
        ticket: requestError?.response?.data?.ticket,
      });
      toast.error(message);
      return null;
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }, [refresh, selectedEventId]);

  const handleDecoded = useCallback(async (decodedText) => {
    const payload = parseQrPayload(decodedText);
    if (!payload?.ticketId) return null;

    const effectiveEventId = payload.eventId || selectedEventId;
    if (payload.eventId) setSelectedEventId(payload.eventId);
    return performCheckIn(payload.ticketId, effectiveEventId, 'scan');
  }, [performCheckIn, selectedEventId]);

  function submitManual(event) {
    event.preventDefault();
    performCheckIn(manualTicket, selectedEventId, 'verify');
  }

  if (loading && !data) return <PageLoader />;

  return (
    <div className="dashboard-page volunteer-page">
      <PageIntro
        eyebrow="VOLUNTEER DESK"
        title="Welcome guests with confidence."
        description="Scan a QR code or enter a ticket ID. The server makes the final call every time."
      >
        <span className="secure-pill"><ShieldCheck size={15} />Live verification</span>
      </PageIntro>

      {eventsError && (
        <div className="form-alert">
          <span>{eventsError}</span>
          <button type="button" className="text-link" onClick={refetch}>Retry</button>
        </div>
      )}

      <div className="volunteer-event-bar">
        <div>
          <span className="eyebrow">ACTIVE CHECK-IN DESK</span>
          <h2>Choose an event</h2>
        </div>
        <label className="select-field">
          <span>Event</span>
          <select
            value={selectedEventId}
            onChange={(event) => {
              setSelectedEventId(event.target.value);
              setResult(null);
              setCheckInError(null);
              setLastAttemptedTicket('');
            }}
          >
            <option value="" disabled>Select an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>{event.name}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedEvent && (
        <div className="stat-grid stat-grid-compact volunteer-stats">
          <StatCard
            label="Registered"
            value={`${selectedEvent.registered} / ${selectedEvent.capacity}`}
            detail="Across this event"
            icon={Users}
            tone="teal"
          />
          <StatCard
            label="Checked in"
            value={selectedEvent.checkedIn}
            detail={selectedEvent.registrationStatus === 'FULL' ? 'Registration closed' : 'Registration open'}
            icon={CheckCircle2}
            tone="green"
          />
          <StatCard
            label="Seats remaining"
            value={selectedEvent.remainingSeats}
            detail={formatDate(selectedEvent.date)}
            icon={ClipboardCheck}
            tone="amber"
          />
        </div>
      )}

      <div className="checkin-grid">
        <QrScanner onDecoded={handleDecoded} />
        <section className="manual-card">
          <div className="scanner-header">
            <div>
              <span className="eyebrow">BACKUP VERIFICATION</span>
              <h2>Enter a ticket ID</h2>
            </div>
            <Keyboard size={20} className="heading-icon" />
          </div>
          <p>Use this when a camera is unavailable or a guest has a printed ticket.</p>
          <form onSubmit={submitManual}>
            <FormField label="Ticket ID" name="manualTicket" hint="Example: EVT-2026-A7K92P">
              <input
                id="manualTicket"
                name="manualTicket"
                value={manualTicket}
                onChange={(event) => {
                  setManualTicket(event.target.value);
                  setCheckInError(null);
                }}
                placeholder="EVT-YYYY-XXXXXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck="false"
                required
              />
            </FormField>
            <Button
              type="submit"
              loading={processing}
              disabled={!selectedEventId || !manualTicket.trim()}
              className="button-full"
            >
              <Camera size={16} />Verify ticket <ArrowRight size={16} />
            </Button>
          </form>
          <div className="manual-note">
            <ShieldCheck size={15} />
            <span>Backend verification checks the event and rejects every duplicate check-in.</span>
          </div>
        </section>
      </div>

      {(result || checkInError) && (
        <CheckInResult
          result={result}
          error={checkInError}
          ticketId={lastAttemptedTicket}
        />
      )}

      {selectedEvent && (
        <div className="desk-status-line">
          <span>Registration status</span>
          <StatusBadge status={selectedEvent.registrationStatus} />
        </div>
      )}
    </div>
  );
}
