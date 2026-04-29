import { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';
import { TRAVEL_MODES } from '../utils/constants';

export default function Travel() {
  // travelData is an object: { bike: {}, car: {}, public_transport: {} }
  // Exactly like foodData: { breakfast: {}, lunch: {}, dinner: {} }
  const [travelData, setTravelData] = useState({ bike: {}, car: {}, public_transport: {} });
  const [distances, setDistances] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTravel();
  }, []);

  const fetchTravel = async () => {
    try {
      const res = await API.get(`/travel?date=${today}`);
      setTravelData(res.data.travel);
    } catch (error) {
      console.error('Failed to fetch travel:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Save a mode — exactly like food submit
  const handleSave = async (modeKey) => {
    const dist = parseFloat(distances[modeKey]);
    if (!dist || dist <= 0) {
      showMessage('Enter a valid distance', 'error');
      return;
    }
    console.log("dsfd")
    setSubmitting(true);
    try {
      const res = await API.post('/travel', { mode: modeKey, distance: dist, date: today });

      // if (res.data && res.data.mode) {
      //   setTravelData((prev) => ({ ...prev, [modeKey]: res.data.mode }));
      //   setDistances((prev) => ({ ...prev, [modeKey]: '' }));
      //   showMessage(`${TRAVEL_MODES.find((m) => m.key === modeKey)?.label} saved!`);
      // } else {
      //   console.error('Unexpected API response:', res.data);
      //   throw new Error('Server returned invalid data');
      // }
    } catch (err) {
      console.error('Travel save error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save';
      showMessage(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Previous — exactly like food previous
  const handlePrevious = async (modeKey) => {
    setSubmitting(true);
    try {
      const res = await API.post('/travel/previous', { mode: modeKey, date: today });
      setTravelData((prev) => ({ ...prev, [modeKey]: res.data.mode }));
      showMessage(`Previous ${TRAVEL_MODES.find((m) => m.key === modeKey)?.label} data copied!`);
    } catch (error) {
      showMessage(error.response?.data?.error || 'No previous data found', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Skip — exactly like food skip
  const handleSkip = async (modeKey) => {
    setSubmitting(true);
    try {
      const res = await API.post('/travel/skip', { mode: modeKey, date: today });
      setTravelData((prev) => ({ ...prev, [modeKey]: res.data.mode }));
      showMessage(`${TRAVEL_MODES.find((m) => m.key === modeKey)?.label} skipped for today`);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to skip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const CO2_RATES = {
    bike: '0.05 kg/km',
    car: '0.21 kg/km',
    public_transport: '0.089 kg/km',
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">🚗 Travel</h1>

      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      <div className="grid-3">
        {TRAVEL_MODES.map((mode, index) => {
          const data = travelData[mode.key];
          const isSubmitted = data?.submitted;

          // ── Submitted & NOT skipped → show recorded summary (disabled card) ──
          if (isSubmitted && !data.skipped) {
            return (
              <div
                key={mode.key}
                className="travel-card travel-card-disabled"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="travel-card-icon-wrap travel-card-icon-done">
                  <span className="travel-card-icon">✅</span>
                </div>
                <h4 className="travel-card-title">{mode.label}</h4>
                <div className="travel-card-summary">
                  <div className="travel-card-stat">
                    <span className="travel-card-stat-label">Distance</span>
                    <span className="travel-card-stat-value">{data.distance} km</span>
                  </div>
                  <div className="travel-card-stat">
                    <span className="travel-card-stat-label">CO₂ Emitted</span>
                    <span className="travel-card-stat-value travel-card-emission">
                      {data.co2Emission?.toFixed(4)} kg
                    </span>
                  </div>
                </div>
                <span className="badge badge-success" style={{ marginTop: 12 }}>Recorded</span>
              </div>
            );
          }

          // ── Submitted & skipped → show skipped card (disabled card) ──
          if (isSubmitted && data.skipped) {
            return (
              <div
                key={mode.key}
                className="travel-card travel-card-disabled"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="travel-card-icon-wrap travel-card-icon-skipped">
                  <span className="travel-card-icon">⏭️</span>
                </div>
                <h4 className="travel-card-title">{mode.label}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  No travel recorded
                </p>
                <span className="badge badge-warning" style={{ marginTop: 12 }}>Skipped</span>
              </div>
            );
          }

          // ── Active card — distance input + Save / Previous / Skip ──
          return (
            <div
              key={mode.key}
              className="travel-card travel-card-active"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="travel-card-icon-wrap">
                <span className="travel-card-icon">{mode.icon}</span>
              </div>
              <h4 className="travel-card-title">{mode.label}</h4>
              <p className="travel-card-rate">{CO2_RATES[mode.key]}</p>

              <div className="travel-card-input-group">
                <input
                  type="number"
                  className="form-input travel-card-input"
                  placeholder="Distance (km)"
                  value={distances[mode.key] || ''}
                  onChange={(e) => setDistances({ ...distances, [mode.key]: e.target.value })}
                  min="0"
                  step="0.1"
                />
              </div>

              <button
                className="btn btn-primary btn-block travel-card-submit"
                onClick={() => handleSave(mode.key)}
                disabled={submitting || !distances[mode.key] || parseFloat(distances[mode.key]) <= 0}
              >
                💾 Save
              </button>

              <div className="travel-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePrevious(mode.key)}
                  disabled={submitting}
                >
                  📋 Previous
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleSkip(mode.key)}
                  disabled={submitting}
                >
                  ⏭️ Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
