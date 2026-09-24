import { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { Button } from '../components/common/Button';
import { FormField } from '../components/common/FormField';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(form);
      toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}.`);
      const requestedPath = location.state?.from?.pathname;
      const destination = requestedPath
        || (loggedInUser.role === 'organizer' ? '/organizer' : '/volunteer');
      navigate(destination, { replace: true });
    } catch (requestError) {
      const message = getApiError(requestError, 'Unable to sign in.');
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
          <section className="auth-aside">
            <span className="eyebrow eyebrow-light">WELCOME BACK</span>
            <h1>Your next great event is already in motion.</h1>
            <p>Sign in to see registrations, keep an eye on capacity, or welcome guests at the door.</p>
            <div className="auth-aside-note">
              <ShieldCheck size={18} />
              <span>Secure sessions with role-based access.</span>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-heading">
              <span className="auth-icon"><LogIn size={20} /></span>
              <h2>Log in to EventFlow</h2>
              <p>Use your organizer or volunteer account.</p>
            </div>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} noValidate>
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
              <FormField label="Password" name="password">
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={update}
                    placeholder="Your password"
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
              <Button type="submit" loading={loading} className="button-full">
                Log in <ArrowRight size={17} />
              </Button>
            </form>
            <p className="auth-switch">New to EventFlow? <Link to="/signup">Create an account</Link></p>
          </section>
        </div>
      </main>
    </div>
  );
}
