import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { PublicNavbar } from '../components/layout/PublicNavbar';

export function NotFoundPage() {
  return <div className="public-page"><PublicNavbar /><main className="not-found"><span className="empty-icon"><Compass size={25} /></span><span className="eyebrow">404 / OFF THE SCHEDULE</span><h1>That page missed its cue.</h1><p>Let’s get you back to a useful moment.</p><Link className="button button-primary" to="/"><ArrowLeft size={16} />Back home</Link></main></div>;
}
