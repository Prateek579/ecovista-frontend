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
  const [aqi, setAqi] = useState(null);
  const [user, setUser] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, dailyRes, fitRes, profileRes] = await Promise.all([
        API.get('/analytics/summary'),
        API.get(`/analytics/daily?date=${today}`),
        API.get(`/googlefit?date=${today}`),
        API.get('/profile'),
      ]);
      setSummary(summaryRes.data);
      setTodayData(dailyRes.data.data);
      setGoogleFit(fitRes.data.googleFit);
      setIsGoogleConnected(fitRes.data.isGoogleConnected);
      setUser(profileRes.data.user);

      // If location exists, fetch AQI
      if (profileRes.data.user?.location?.lat) {
        fetchAQI();
      }

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

  const fetchAQI = async () => {
    try {
      const res = await API.get('/aqi');
      setAqi(res.data);
    } catch (error) {
      console.error('Failed to fetch AQI:', error);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await API.put('/profile', {
            location: { lat: latitude, lon: longitude },
          });
          setUser(res.data.user);
          // Fetch new AQI after location update
          fetchAQI();
          alert('Location updated successfully!');
        } catch (error) {
          console.error('Failed to update location:', error);
          alert('Failed to update location on server.');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        alert('Unable to retrieve your location. Please check permissions.');
      }
    );
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

  const getAQIColor = (aqiValue) => {
    if (!aqiValue) return 'var(--bg-glass)';
    if (aqiValue <= 50) return 'rgba(76, 175, 80, 0.15)'; // Good - Green
    if (aqiValue <= 100) return 'rgba(255, 235, 59, 0.15)'; // Moderate - Yellow
    if (aqiValue <= 150) return 'rgba(255, 152, 0, 0.15)'; // Unhealthy for sensitive - Orange
    if (aqiValue <= 200) return 'rgba(244, 67, 54, 0.15)'; // Unhealthy - Red
    if (aqiValue <= 300) return 'rgba(156, 39, 176, 0.15)'; // Very Unhealthy - Purple
    return 'rgba(121, 85, 72, 0.15)'; // Hazardous - Brown
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

      {/* AQI Section */}
      <div className="glass-card no-hover" style={{ marginBottom: 24, borderLeft: `8px solid ${aqi ? (aqi.aqi <= 50 ? '#4caf50' : aqi.aqi <= 100 ? '#ffeb3b' : aqi.aqi <= 150 ? '#ff9800' : '#f44336') : 'transparent'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>🌬️ Air Quality Index</h3>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={handleUpdateLocation}
            disabled={locationLoading}
          >
            {locationLoading ? 'Updating...' : user?.location?.lat ? '🔄 Update Location' : '📍 Set Location'}
          </button>
        </div>

        {user?.location?.lat ? (
          aqi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                padding: '12px 24px', 
                background: 'var(--bg-glass-strong)', 
                borderRadius: '16px',
                color: aqi.aqi <= 50 ? '#81c784' : aqi.aqi <= 100 ? '#fff176' : aqi.aqi <= 150 ? '#ffb74d' : '#e57373',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {aqi.aqi}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>{aqi.status}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>📍 {aqi.city}</div>
                {aqi.mockData && (
                  <div style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--accent-rose)', fontStyle: 'italic' }}>
                    Note: Add WAQI_TOKEN to server .env for real-time data.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="loader-mini"></div>
              <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Fetching live air quality data...</p>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--bg-glass-strong)', borderRadius: '12px' }}>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>Set your location to see real-time air quality in your area.</p>
            <button className="btn btn-primary" onClick={handleUpdateLocation} disabled={locationLoading}>
              📍 Enable Location Access
            </button>
          </div>
        )}
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
