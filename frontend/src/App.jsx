import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { RegisterPage } from './pages/RegisterPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { TicketPage } from './pages/TicketPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { CreateEventPage } from './pages/organizer/CreateEventPage';
import { MyEventsPage } from './pages/organizer/MyEventsPage';
import { EventManagePage } from './pages/organizer/EventManagePage';
import { RegistrationsPage } from './pages/organizer/RegistrationsPage';
import { StatisticsPage } from './pages/organizer/StatisticsPage';
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { VolunteerGuidePage } from './pages/volunteer/VolunteerGuidePage';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/events/:id/register" element={<RegisterPage />} />
        <Route path="/tickets/:ticketId" element={<TicketPage />} />
        <Route path="/registration/success" element={<RegistrationSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute role="organizer" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/organizer/events" element={<MyEventsPage />} />
            <Route path="/organizer/events/new" element={<CreateEventPage />} />
            <Route path="/organizer/events/:id" element={<EventManagePage />} />
            <Route path="/organizer/events/:id/registrations" element={<RegistrationsPage />} />
            <Route path="/organizer/registrations" element={<RegistrationsPage />} />
            <Route path="/organizer/statistics" element={<StatisticsPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute role="volunteer" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/volunteer" element={<VolunteerDashboard />} />
            <Route path="/volunteer/history" element={<VolunteerGuidePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 4200, style: { background: '#172a3a', color: '#fff', border: '1px solid rgba(255,255,255,.12)' } }} />
    </>
  );
}
