import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import API from '../api/axios';
import Loader from '../components/Loader';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [rangeData, setRangeData] = useState([]);
  const [prediction, setPrediction] = useState([]);
  const [predMethod, setPredMethod] = useState('');
  const [predMessage, setPredMessage] = useState('');
  const [insights, setInsights] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [forecastDays, setForecastDays] = useState(10);
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(false);

  useEffect(() => { fetchAnalytics(); }, [selectedDate]);
  useEffect(() => { fetchPrediction(); }, [forecastDays]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const end = selectedDate;
      const start = new Date(new Date(end).getTime() - 30 * 86400000).toISOString().split('T')[0];
      const [rangeRes, insightRes] = await Promise.all([
        API.get(`/analytics/range?start=${start}&end=${end}`),
        API.get(`/analytics/insights?date=${end}`),
      ]);
      setRangeData(rangeRes.data.data);
      setInsights(insightRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPrediction = async () => {
    setPredLoading(true);
    setPredMessage('');
    try {
      const res = await API.get(`/analytics/predict?days=${forecastDays}`);
      setPrediction(res.data.prediction || []);
      setPredMethod(res.data.method || '');
      if (res.data.message) {
        setPredMessage(res.data.message);
      }
    } catch (e) {
      console.error(e);
      setPredMessage('Failed to generate prediction. Please try again.');
    }
    finally { setPredLoading(false); }
  };

  const navigateDate = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const pieData = insights ? [
    { name: 'Travel', value: insights.categoryBreakdown.travel },
    { name: 'Food', value: insights.categoryBreakdown.food },
    { name: 'Waste', value: insights.categoryBreakdown.waste },
    { name: 'Electricity', value: insights.categoryBreakdown.electricity },
  ].filter((d) => d.value > 0) : [];

  if (loading) return <Loader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">📊 Analytics</h1>

      {/* Date Navigation */}
      <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateDate(-1)}>← Prev</button>
          <input type="date" className="form-input" style={{ width: 'auto' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <button className="btn btn-secondary btn-sm" onClick={() => navigateDate(1)}>Next →</button>
        </div>
      </div>

      {/* Section 1: Emission vs Saving Chart */}
      <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Daily CO₂ Emission vs Saving</h3>
        {rangeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
              <Legend />
              <Bar dataKey="totalCO2Emission" name="Emission" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCO2Saving" name="Saving" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data for this period</p>}
      </div>

      {/* Prediction */}
      <div className="glass-card no-hover" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3>🔮 Forecast</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`btn btn-sm ${forecastDays === 10 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForecastDays(10)}>10 Days</button>
            <button className={`btn btn-sm ${forecastDays === 30 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForecastDays(30)}>30 Days</button>
            <button className="btn btn-outline btn-sm" onClick={fetchPrediction} disabled={predLoading}>{predLoading ? '...' : 'Predict'}</button>
          </div>
        </div>
        {prediction.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={prediction}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                <Legend />
                <Line type="monotone" dataKey="emission" name="Predicted Emission" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="saving" name="Predicted Saving" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Method: {predMethod}</p>
          </>
        ) : predLoading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Loading prediction...</p>
        ) : predMessage ? (
          <p style={{ color: 'var(--accent-amber)', textAlign: 'center', padding: 20 }}>⚠️ {predMessage}</p>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Click "Predict" to generate forecast</p>
        )}
      </div>

      {/* Section 2: Category Breakdown */}
      <div className="grid-2">
        <div className="glass-card no-hover">
          <h3 style={{ marginBottom: 16 }}>Category Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value.toFixed(2)}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data for this date</p>}
        </div>

        <div className="glass-card no-hover">
          <h3 style={{ marginBottom: 16 }}>💡 Insights</h3>
          {insights ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest Emission</div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{insights.highestCategory.category} — {insights.highestCategory.value.toFixed(4)} kg</div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>30-Day Average</div>
                <div style={{ fontWeight: 700 }}>{insights.insights.averageDailyEmission.toFixed(4)} kg/day</div>
              </div>
              {insights.insights.isSpike && (
                <div style={{ padding: 12, background: 'rgba(244,63,94,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244,63,94,0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>⚠️ Spike Detected</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>+{insights.insights.spikePercentage}% above average</div>
                </div>
              )}
              <div style={{ padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>Today's Saving</div>
                <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>🌿 {insights.insights.todaySaving.toFixed(4)} kg</div>
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-muted)' }}>No insights available</p>}
        </div>
      </div>
    </div>
  );
}
