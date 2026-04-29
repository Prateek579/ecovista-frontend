import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    country: user?.country || '',
    state: user?.state || '',
    district: user?.district || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showMsg = (text, type = 'success') => { setMessage({ text, type }); setTimeout(() => setMessage(null), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/profile', { ...form, age: parseInt(form.age) });
      updateUser(res.data.user);
      showMsg('Profile updated!');
    } catch (err) { showMsg(err.response?.data?.error || 'Update failed', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">👤 Profile</h1>
      {message && <div className={`toast toast-${message.type}`}>{message.text}</div>}

      <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" name="age" className="form-input" value={form.age} onChange={handleChange} min={1} max={120} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input type="text" name="country" className="form-input" value={form.country} onChange={handleChange} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-input" value={form.state} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input type="text" name="district" className="form-input" value={form.district} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      <button className="btn btn-danger btn-block" onClick={logout}>🚪 Logout</button>
    </div>
  );
}
