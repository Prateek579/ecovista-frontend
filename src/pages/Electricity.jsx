import { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';
import { ELECTRICITY_APPLIANCES } from '../utils/constants';

export default function Electricity() {
  const [selectedKeys, setSelectedKeys] = useState([]); // keys of selected (not yet saved) appliances
  const [hours, setHours] = useState({}); // { applianceKey: hoursValue }
  const [savedAppliances, setSavedAppliances] = useState([]); // entries from backend
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get(`/electricity?date=${today}`);
      const data = res.data.electricity;
      setSavedAppliances(data?.entries || []);
      setSkipped(data?.skipped || false);
      setSubmitted(data?.submitted || false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const isSaved = (key) => savedAppliances.some((e) => e.appliance === key);
  const getSavedEntry = (key) => savedAppliances.find((e) => e.appliance === key);

  const toggleSelect = (key) => {
    if (isSaved(key)) return;
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    const valid = selectedKeys.filter((key) => {
      const h = parseFloat(hours[key]);
      return h && h > 0;
    });

    if (valid.length === 0) {
      showMsg('Enter hours for selected appliances', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/electricity', {
        appliances: valid.map((key) => ({ appliance: key, hours: parseFloat(hours[key]) })),
        date: today,
      });
      setSavedAppliances(res.data.electricity.entries || []);
      setSkipped(false);
      setSubmitted(true);
      setSelectedKeys([]);
      setHours({});
      showMsg(`${valid.length} appliance(s) saved!`);
    } catch (err) {
      showMsg(err.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/electricity/previous', { date: today });
      setSavedAppliances(res.data.electricity.entries || []);
      setSkipped(false);
      setSubmitted(true);
      setSelectedKeys([]);
      showMsg('Previous data copied!');
    } catch (err) {
      showMsg(err.response?.data?.error || 'No previous data', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await API.post('/electricity/skip', { date: today });
      setSavedAppliances([]);
      setSkipped(true);
      setSubmitted(true);
      setSelectedKeys([]);
      showMsg('Electricity skipped');
    } catch (err) {
      showMsg('Failed to skip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const totalCO2 = savedAppliances.reduce((s, e) => s + (e.co2Emission || 0), 0);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">⚡ Electricity</h1>

      {message && <div className={`toast toast-${message.type}`}>{message.text}</div>}

      {/* Summary Area */}
      {(submitted) && (
        <div className="glass-card no-hover" style={{ marginBottom: 24, borderLeft: `4px solid ${skipped ? 'var(--accent-amber)' : 'var(--primary-light)'}` }}>
          {skipped ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ margin: 0 }}>⏭️ Tracking Skipped for Today</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>You have chosen to skip electricity logging for today.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Electricity Emission</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{totalCO2.toFixed(4)} kg CO₂</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{savedAppliances.length}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Appliances Logged</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection Grid */}
      <div className={`glass-card no-hover ${submitted ? 'card-disabled' : ''}`} style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>{submitted ? 'Appliances Recorded' : 'Step 1: Select Used Appliances'}</h3>
        <div className="chip-grid">
          {ELECTRICITY_APPLIANCES.map((app) => {
            const saved = isSaved(app.key);
            const selected = selectedKeys.includes(app.key);
            const entry = getSavedEntry(app.key);

            return (
              <button
                key={app.key}
                className={`chip ${selected ? 'selected' : ''} ${saved ? 'saved' : ''}`}
                onClick={() => toggleSelect(app.key)}
                disabled={saved || submitted}
                style={{
                  opacity: (saved || submitted && !saved) ? 0.6 : 1,
                  background: saved ? 'var(--bg-glass-strong)' : undefined,
                  border: saved ? '1px solid var(--primary-light)' : undefined,
                  cursor: (saved || submitted) ? 'default' : 'pointer'
                }}
              >
                <span style={{ marginRight: 6 }}>{app.icon}</span>
                {app.label}
                {saved && <span style={{ marginLeft: 8, fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)' }}>✅ {entry?.hours}h</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Section */}
      {selectedKeys.length > 0 && (
        <div className="glass-card no-hover animate-slide-up" style={{ marginBottom: 24, borderTop: '2px solid var(--primary-light)' }}>
          <h3 style={{ marginBottom: 16 }}>Step 2: Enter Usage Hours</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedKeys.map((key) => {
              const app = ELECTRICITY_APPLIANCES.find((a) => a.key === key);
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.5rem', width: 32 }}>{app?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app?.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typical: {app?.watts}W</div>
                  </div>
                  <div style={{ width: 100 }}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Hours"
                      value={hours[key] || ''}
                      onChange={(e) => setHours({ ...hours, [key]: e.target.value })}
                      min="0"
                      max="24"
                      step="0.5"
                      style={{ padding: '8px 10px', textAlign: 'center', fontSize: '0.9rem' }}
                    />
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => toggleSelect(key)} style={{ padding: '6px 10px' }}>✕</button>
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 24 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : `🚀 Log ${selectedKeys.length} Item(s)`}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!submitted && (
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={handlePrevious} disabled={submitting}>
            📋 Save as Previous
          </button>
          <button className="btn btn-warning" onClick={handleSkip} disabled={submitting}>
            ⏭️ Skip for Day
          </button>
        </div>
      )}
    </div>
  );
}
