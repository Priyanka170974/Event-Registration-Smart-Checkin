import { useState } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageIntro } from '../../components/layout/PageIntro';
import { EventForm } from '../../components/events/EventForm';
import { eventService } from '../../services/eventService';
import { getApiError } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { refresh } = useDataRefresh();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload) {
    setLoading(true);
    setError('');
    try {
      await eventService.create(payload);
      refresh();
      toast.success('Event created. Your registration page is live.');
      navigate('/organizer/events');
    } catch (requestError) {
      const message = getApiError(requestError, 'Unable to create the event.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="dashboard-page"><Link to="/organizer/events" className="text-link back-link"><ArrowLeft size={16} />Back to events</Link><PageIntro eyebrow="NEW EVENT" title="Give your next idea a room." description="Create a clear, welcoming event page in a few minutes. Registration capacity is enforced automatically." /><div className="create-event-layout"><div className="form-card"><div className="form-card-heading"><span className="form-heading-icon"><Sparkles size={18} /></span><div><h2>Event details</h2><p>Tell attendees exactly what to expect.</p></div></div>{error && <div className="form-alert" role="alert">{error}</div>}<EventForm onSubmit={handleSubmit} loading={loading} /></div><aside className="form-side-note"><span className="side-note-icon"><Check size={17} /></span><h3>Built-in safeguards</h3><ul><li>Capacity is checked inside a database transaction.</li><li>Every registration gets a unique ticket ID.</li><li>QR codes are generated from the saved ticket data.</li><li>Only your account can edit this event.</li></ul></aside></div></div>;
}
