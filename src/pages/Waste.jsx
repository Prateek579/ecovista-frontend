import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { WASTE_CATEGORIES } from '../utils/constants';

export default function Waste() {
  const [wasteData, setWasteData] = useState([]);
  const [skipped, setSkipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchWaste();
  }, []);

  const fetchWaste = async () => {
    try {
      const res = await API.get(`/waste?date=${today}`);
      const wasteObj = res.data.waste || {};
      const entries = Array.isArray(wasteObj) ? wasteObj : (wasteObj.entries || []);
      setWasteData(entries);
      setSkipped(wasteObj.skipped || false);
      setSubmitted(wasteObj.submitted || entries.length > 0 || false);
    } catch (error) {
      console.error('Failed to fetch waste:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePrevious = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/waste/previous', { date: today });
      const wasteObj = res.data.waste || {};
      const entries = Array.isArray(wasteObj) ? wasteObj : (wasteObj.entries || []);
      setWasteData(entries);
      setSkipped(wasteObj.skipped || false);
      setSubmitted(wasteObj.submitted || entries.length > 0 || false);
      showMessage('Previous waste data copied!');
    } catch (error) {
      showMessage(error.response?.data?.error || 'No previous data found', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/waste/skip', { date: today });
      setWasteData([]);
      setSkipped(true);
      setSubmitted(true);
      showMessage('Waste skipped for today');
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to skip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // Build list of already submitted categories
  const submittedCategories = wasteData.map((w) => w.category);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">🗑️ Waste Management</h1>

      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      {/* Today's Entries / Skip Status */}
      {submitted && (
        <div className="glass-card no-hover" style={{ marginBottom: 24, borderLeft: `4px solid ${skipped ? 'var(--accent-amber)' : 'var(--primary-light)'}` }}>
          {skipped ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ margin: 0 }}>⏭️ Tracking Skipped for Today</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Waste management tracking has been skipped for today.</p>
            </div>
          ) : (
            <>
              <h3 style={{ marginBottom: 16 }}>Today's Entries</h3>
              {wasteData.map((entry, idx) => {
                const cat = WASTE_CATEGORIES.find((c) => c.key === entry.category);
                return (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: idx < wasteData.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.3rem' }}>{cat?.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat?.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {entry.items.join(', ')} • {entry.quantityLabel}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {entry.co2Emission.toFixed(4)} kg
                      </div>
                      {entry.co2Saving > 0 && (
                        <div style={{ color: 'var(--primary-light)', fontSize: '0.75rem' }}>
                          🌿 {entry.co2Saving.toFixed(4)} saved
                        </div>
                      )}
                      {entry.recycled && <span className="badge badge-success">Recycled</span>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Category cards */}
      <div className={`grid-auto ${submitted ? 'card-disabled' : ''}`}>
        {WASTE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className="glass-card"
            onClick={() => !submitted && navigate(`/waste/${cat.key}`)}
            style={{ textAlign: 'center', cursor: submitted ? 'default' : 'pointer', opacity: submitted ? 0.7 : 1 }}
            disabled={submitted}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{cat.icon}</div>
            <h4>{cat.label}</h4>
            {submittedCategories.includes(cat.key) && (
              <span className="badge badge-success" style={{ marginTop: 8 }}>Added</span>
            )}
          </button>
        ))}
      </div>

      {!submitted && (
        <div className="btn-group" style={{ marginTop: 24 }}>
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
