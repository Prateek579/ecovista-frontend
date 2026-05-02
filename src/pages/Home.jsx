import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import API from '../api/axios';
import Loader from '../components/Loader';

export default function Home() {
  const [summary, setSummary] = useState({ totalCO2Emission: 0, totalCO2Saving: 0, daysTracked: 0 });
  const [todayData, setTodayData] = useState(null);
  const [googleFit, setGoogleFit] = useState(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, dailyRes, fitRes] = await Promise.all([
        API.get('/analytics/summary'),
        API.get(`/analytics/daily?date=${today}`),
        API.get(`/googlefit?date=${today}`),
      ]);
      setSummary(summaryRes.data);
      setTodayData(dailyRes.data.data);
      setGoogleFit(fitRes.data.googleFit);
      setIsGoogleConnected(fitRes.data.isGoogleConnected);

      // If already connected, do a background sync to get latest data
      if (fitRes.data.isGoogleConnected) {
        performAutoSync();
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAutoSync = async () => {
    setSyncing(true);
    try {
      const res = await API.get('/googlefit/auto-sync');
      setGoogleFit(res.data.googleFit);
      // Refresh summary
      const summaryRes = await API.get('/analytics/summary');
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Auto sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setSyncing(true);
      try {
        // Send the code to backend to exchange for refresh token
        const res = await API.post('/googlefit/connect', { code: codeResponse.code });
        setIsGoogleConnected(true);
        // After connecting, do the first sync
        performAutoSync();
      } catch (error) {
        console.error('Failed to connect Google Fit:', error);
        alert('Connection failed. Make sure you have added GOOGLE_CLIENT_SECRET to your server .env');
      } finally {
        setSyncing(false);
      }
    },
    flow: 'auth-code',
    scope: 'openid email https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.location.read',
    prompt: 'consent',
  });

  const syncGoogleFit = () => {
    setSyncing(true);
    googleLogin();
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="stat-card emission">
          <div className="category-icon waste">💨</div>
          <div>
            <div className="stat-value">{summary.totalCO2Emission.toFixed(2)}</div>
            <div className="stat-label">Total CO₂ Emission (kg)</div>
          </div>
        </div>

        <div className="stat-card saving">
          <div className="category-icon saving">🌱</div>
          <div>
            <div className="stat-value">{summary.totalCO2Saving.toFixed(2)}</div>
            <div className="stat-label">Total CO₂ Saved (kg)</div>
          </div>
        </div>
      </div>

      {/* Google Fit Section */}
      <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3>🏃 Google Fit Activity</h3>
          {!isGoogleConnected && (
            <button
              className="btn btn-outline btn-sm"
              onClick={syncGoogleFit}
              disabled={syncing}
            >
              {syncing ? 'Connecting...' : '🔗 Connect Google Fit'}
            </button>
          )}
          {isGoogleConnected && syncing && (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>🔄 Auto-syncing...</span>
          )}
        </div>

        {googleFit?.synced ? (
          <div className="grid-3">
            <div className="glass-card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🚶</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{googleFit.walkingKm.toFixed(2)} km</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Walking</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🏃</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{googleFit.runningKm.toFixed(2)} km</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Running</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🚴</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{googleFit.cyclingKm.toFixed(2)} km</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cycling</div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            Sync your Google Fit to track walking, running, and cycling CO₂ savings.
          </p>
        )}

        {googleFit?.co2Saving > 0 && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <span className="badge badge-success">
              🌿 {googleFit.co2Saving.toFixed(4)} kg CO₂ saved today
            </span>
          </div>
        )}
      </div>

      {/* Today's Overview */}
      <div className="glass-card no-hover">
        <h3 style={{ marginBottom: 16 }}>📅 Today's Overview</h3>

        {todayData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span>🚗 Travel</span>
              <span style={{ fontWeight: 600 }}>
                {(todayData.travel?.bike?.submitted || todayData.travel?.car?.submitted || todayData.travel?.public_transport?.submitted)
                  ? `${((todayData.travel?.bike?.co2Emission || 0) + (todayData.travel?.car?.co2Emission || 0) + (todayData.travel?.public_transport?.co2Emission || 0)).toFixed(4)} kg`
                  : <span className="badge badge-warning">Pending</span>
                }
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span>🍽️ Food</span>
              <span style={{ fontWeight: 600 }}>
                {((todayData.food?.breakfast?.co2Emission || 0) +
                  (todayData.food?.lunch?.co2Emission || 0) +
                  (todayData.food?.dinner?.co2Emission || 0)).toFixed(4)} kg
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span>🗑️ Waste</span>
              <span style={{ fontWeight: 600 }}>
                {(Array.isArray(todayData.waste) 
                  ? todayData.waste 
                  : (todayData.waste?.entries || [])
                ).reduce((s, w) => s + (w.co2Emission || 0), 0).toFixed(4)} kg
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span>⚡ Electricity</span>
              <span style={{ fontWeight: 600 }}>
                {(todayData.electricity?.entries?.reduce((s, e) => s + (e.co2Emission || 0), 0) || 0).toFixed(4)} kg
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-md)', marginTop: 8 }}>
              <span style={{ fontWeight: 700 }}>Today Total</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                  ↑ {todayData.totalCO2Emission?.toFixed(4)} kg emitted
                </div>
                <div style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.85rem' }}>
                  ↓ {todayData.totalCO2Saving?.toFixed(4)} kg saved
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            No data yet for today. Start tracking your carbon footprint!
          </p>
        )}
      </div>

      {/* Days tracked */}
      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        📊 {summary.daysTracked} days tracked
      </div>
    </div>
  );
}
