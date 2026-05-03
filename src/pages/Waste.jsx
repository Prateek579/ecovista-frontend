import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';
import { WASTE_CATEGORIES } from '../utils/constants';

export default function Waste() {
  const [wasteData, setWasteData] = useState([]);
  const [skipped, setSkipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
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
      setIsLocked(wasteObj.isLocked || false);
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
      setIsLocked(wasteObj.isLocked || true);
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
      setIsLocked(true);
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
              <h3 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>Today's Entries</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wasteData.map((entry, idx) => {
                  const cat = WASTE_CATEGORIES.find((c) => c.key === entry.category);
                  return (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{cat?.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{cat?.label}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {entry.items.join(', ')} • {entry.quantityLabel}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--accent-rose)', fontWeight: 700, fontSize: '1rem' }}>
                          {entry.co2Emission.toFixed(4)} kg
                        </div>
                        {entry.co2Saving > 0 && (
                          <div style={{ color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 600 }}>
                            🌿 {entry.co2Saving.toFixed(4)} saved
                          </div>
                        )}
                        {entry.recycled && <span className="badge badge-success" style={{ marginTop: 4 }}>Recycled</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Category cards */}
      <div className={`grid-auto ${isLocked ? 'card-disabled' : ''}`}>
        {WASTE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className="glass-card"
            onClick={() => !isLocked && navigate(`/waste/${cat.key}`)}
            style={{ 
              textAlign: 'center', 
              cursor: isLocked ? 'default' : 'pointer', 
              opacity: isLocked ? 0.7 : 1,
              borderBottom: `4px solid ${cat.color}`,
              background: `linear-gradient(180deg, var(--bg-card) 0%, ${cat.color}15 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '160px'
            }}
            disabled={isLocked}
          >
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: 12,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
            }}>
              {cat.icon}
            </div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>{cat.label}</h4>
            {submittedCategories.includes(cat.key) && (
              <span className="badge badge-success" style={{ marginTop: 12, background: 'var(--primary)', color: 'white' }}>Added</span>
            )}
          </button>
        ))}
      </div>

      {!isLocked && (
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
