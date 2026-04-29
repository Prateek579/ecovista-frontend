import { useState, useEffect } from 'react';
import API from '../api/axios';
import Loader from '../components/Loader';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filters, setFilters] = useState({ countries: [], states: [], districts: [] });
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaderboard(); }, [country, state, district]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (country) params.set('country', country);
      if (state) params.set('state', state);
      if (district) params.set('district', district);
      const res = await API.get(`/leaderboard?${params.toString()}`);
      setLeaderboard(res.data.leaderboard);
      setFilters(res.data.filters);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">🏆 Leaderboard</h1>

      {/* Filters */}
      <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="form-label">Country</label>
            <select className="form-select" value={country} onChange={(e) => { setCountry(e.target.value); setState(''); setDistrict(''); }}>
              <option value="">All Countries</option>
              {filters.countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="form-label">State</label>
            <select className="form-select" value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }} disabled={!country}>
              <option value="">All States</option>
              {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="form-label">District</label>
            <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
              <option value="">All Districts</option>
              {filters.districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? <Loader /> : leaderboard.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="leaderboard-table">
            <thead>
              <tr><th>Rank</th><th>Name</th><th>Location</th><th>CO₂ Saved</th><th>Days</th></tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td><div className={`rank-badge ${getRankClass(entry.rank)}`}>{entry.rank}</div></td>
                  <td style={{ fontWeight: 600 }}>{entry.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{[entry.district, entry.state, entry.country].filter(Boolean).join(', ')}</td>
                  <td><span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{entry.totalCO2Saving.toFixed(2)} kg</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{entry.daysTracked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card no-hover" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
          <h3>No entries yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Start tracking to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
}
