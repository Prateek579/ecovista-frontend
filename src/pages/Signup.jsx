import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const isGoogleFlow = searchParams.get('google') === 'true';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    country: '',
    state: '',
    district: '',
  });
  const [googleData, setGoogleData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isGoogleFlow) {
      const pending = localStorage.getItem('ecovista_google_pending');
      if (pending) {
        const data = JSON.parse(pending);
        setGoogleData(data);
        setForm((prev) => ({ ...prev, name: data.name || '', email: data.email || '' }));
      }
    }
  }, [isGoogleFlow]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isGoogleFlow && googleData) {
        // Complete Google signup with profile data
        const pendingCredential = localStorage.getItem('ecovista_google_credential');
        await googleAuth(pendingCredential, {
          age: parseInt(form.age),
          gender: form.gender,
          country: form.country,
          state: form.state,
          district: form.district,
        });
        localStorage.removeItem('ecovista_google_pending');
        localStorage.removeItem('ecovista_google_credential');
      } else {
        await signup({
          ...form,
          age: parseInt(form.age),
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      if (err.response?.data?.details) {
        const messages = err.response.data.details.map((d) => d.message).join(', ');
        setError(messages);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleAuth(credentialResponse.credential);
      if (result.needsProfile) {
        setGoogleData(result.googleData);
        setForm((prev) => ({
          ...prev,
          name: result.googleData.name || '',
          email: result.googleData.email || '',
        }));
        localStorage.setItem('ecovista_google_credential', credentialResponse.credential);
        // Switch to profile completion mode
        navigate('/signup?google=true', { replace: true });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <h1>🌿 EcoVista</h1>
          <p>{isGoogleFlow ? 'Complete your profile' : 'Create your account'}</p>
        </div>

        {error && (
          <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isGoogleFlow}
              />
            </div>
          </div>

          {!isGoogleFlow && (
            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required={!isGoogleFlow}
                minLength={6}
              />
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-age">Age</label>
              <input
                id="signup-age"
                type="number"
                name="age"
                className="form-input"
                placeholder="25"
                value={form.age}
                onChange={handleChange}
                required
                min={1}
                max={120}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-gender">Gender</label>
              <select
                id="signup-gender"
                name="gender"
                className="form-select"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-country">Country</label>
            <input
              id="signup-country"
              type="text"
              name="country"
              className="form-input"
              placeholder="India"
              value={form.country}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-state">State</label>
              <input
                id="signup-state"
                type="text"
                name="state"
                className="form-input"
                placeholder="Maharashtra"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-district">District</label>
              <input
                id="signup-district"
                type="text"
                name="district"
                className="form-input"
                placeholder="Pune"
                value={form.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {!isGoogleFlow && (
          <>
            <div className="auth-divider">or continue with</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed')}
                theme="filled_black"
                shape="pill"
                size="large"
              />
            </div>
          </>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
