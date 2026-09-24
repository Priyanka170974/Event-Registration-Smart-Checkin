import { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Sparkles, UserRound, UsersRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'organizer' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'organizer' ? '/organizer' : '/volunteer', { replace: true });
    }
  }, [navigate, user]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Complete all fields to create your account.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (form.password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      setError('Include an uppercase letter, a lowercase letter, and a number.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await signup(form);
      toast.success('Your EventFlow workspace is ready.');
      navigate(newUser.role === 'organizer' ? '/organizer' : '/volunteer', { replace: true });
    } catch (requestError) {
      const message = getApiError(requestError, 'Unable to create your account.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-page auth-page">
      <PublicNavbar />
      <main className="auth-main">
        <div className="auth-shell">
          <section className="auth-aside auth-aside-signup">
            <span className="eyebrow eyebrow-light">MAKE ROOM FOR BETTER</span>
            <h1>One workspace. Two clear roles. Zero guesswork.</h1>
            <p>Organizers shape the experience. Volunteers make the welcome effortless.</p>
            <div className="role-preview">
              <div>
                <span className="role-preview-icon"><Sparkles size={16} /></span>
                <strong>Organizer</strong>
                <small>Create events and see the pulse.</small>
              </div>
              <div>
                <span className="role-preview-icon"><UsersRound size={16} /></span>
                <strong>Volunteer</strong>
                <small>Scan, verify, and welcome guests.</small>
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-heading">
              <span className="auth-icon"><UserRound size={20} /></span>
              <h2>Create your account</h2>
              <p>Start with the role that fits your event day.</p>
            </div>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <FormField label="Full name" name="name">
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={update}
                  placeholder="Your name"
                  required
                />
              </FormField>
              <FormField label="Email address" name="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@example.com"
                  required
                />
              </FormField>
              <FormField label="Password" name="password" hint="8+ characters with upper, lower, and a number">
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update}
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </FormField>
              <fieldset className="role-fieldset">
                <legend className="form-label">I'm joining as</legend>
                <div className="role-options">
                  <label className={`role-option ${form.role === 'organizer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="organizer"
                      checked={form.role === 'organizer'}
                      onChange={update}
                    />
                    <Sparkles size={17} />
                    <span><strong>Organizer</strong><small>Create and manage events</small></span>
                  </label>
                  <label className={`role-option ${form.role === 'volunteer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="volunteer"
                      checked={form.role === 'volunteer'}
                      onChange={update}
                    />
                    <UsersRound size={17} />
                    <span><strong>Volunteer</strong><small>Check in attendees</small></span>
                  </label>
                </div>
              </fieldset>
              <Button type="submit" loading={loading} className="button-full">
                Create account <ArrowRight size={17} />
              </Button>
            </form>
            <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          </section>
        </div>
      </main>
    </div>
  );
}
