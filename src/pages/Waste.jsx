import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { WASTE_CATEGORIES } from '../utils/constants';

export default function Waste() {
  const [wasteData, setWasteData] = useState([]);
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
      setWasteData(res.data.waste);
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
      setWasteData(res.data.waste);
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
      await API.post('/waste/skip', { date: today });
      setWasteData([]);
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

      {/* Already submitted waste entries */}
      {wasteData.length > 0 && (
        <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
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
        </div>
      )}

      {/* Category cards */}
      <div className="grid-auto">
        {WASTE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className="glass-card"
            onClick={() => navigate(`/waste/${cat.key}`)}
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{cat.icon}</div>
            <h4>{cat.label}</h4>
            {submittedCategories.includes(cat.key) && (
              <span className="badge badge-success" style={{ marginTop: 8 }}>Added</span>
            )}
          </button>
        ))}
      </div>

      <div className="btn-group" style={{ marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={handlePrevious} disabled={submitting}>
          📋 Save as Previous
        </button>
        <button className="btn btn-warning" onClick={handleSkip} disabled={submitting}>
          ⏭️ Skip for Day
        </button>
      </div>
    </div>
  );
}
