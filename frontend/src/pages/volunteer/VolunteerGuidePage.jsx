import { ArrowLeft, CheckCircle2, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro } from '../../components/layout/PageIntro';

export function VolunteerGuidePage() {
  return <div className="dashboard-page"><Link to="/volunteer" className="text-link back-link"><ArrowLeft size={16} />Back to check-in</Link><PageIntro eyebrow="VOLUNTEER GUIDE" title="A smooth welcome is a workflow." description="Three simple steps keep the entrance calm and the event data accurate." /><div className="guide-grid"><GuideStep number="01" icon={QrCode} title="Scan the ticket" text="Ask the attendee to open their digital pass and point the camera at the QR code. You can also enter the Ticket ID manually." /><GuideStep number="02" icon={ShieldCheck} title="Trust the result" text="The API checks that the ticket exists, belongs to the selected event, and has not already been used." /><GuideStep number="03" icon={CheckCircle2} title="Welcome the guest" text="A green result means the ticket was atomically checked in. An amber result means it was already consumed." /></div><div className="guide-callout"><Smartphone size={20} /><div><strong>Camera fallback is always available.</strong><p>If permission is denied or the browser cannot access a camera, the manual verification form works without changing the workflow.</p></div></div></div>;
}

function GuideStep({ number, icon: Icon, title, text }) {
  return <article className="guide-step"><span className="guide-number">{number}</span><span className="guide-icon"><Icon size={20} /></span><h2>{title}</h2><p>{text}</p></article>;
}
