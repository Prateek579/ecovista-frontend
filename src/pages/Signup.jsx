import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Signup() {


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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup({
        ...form,
        age: parseInt(form.age),
      });
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



  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <h1>🌿 EcoVista</h1>
          <p>Create your account</p>
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
                disabled={false}
              />
            </div>
          </div>

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
                required={true}
                minLength={6}
              />
            </div>

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



        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
