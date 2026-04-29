import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Loader from '../components/Loader';

export default function Food() {
  const [foodData, setFoodData] = useState({ breakfast: {}, lunch: {}, dinner: {} });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const meals = [
    { key: 'breakfast', label: 'Breakfast', icon: '🥞', time: 'Morning' },
    { key: 'lunch', label: 'Lunch', icon: '🍛', time: 'Afternoon' },
    { key: 'dinner', label: 'Dinner', icon: '🍽️', time: 'Evening' },
  ];

  useEffect(() => {
    fetchFood();
  }, []);

  const fetchFood = async () => {
    try {
      const res = await API.get(`/food?date=${today}`);
      setFoodData(res.data.food);
    } catch (error) {
      console.error('Failed to fetch food:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePrevious = async (meal) => {
    setSubmitting(true);
    try {
      const res = await API.post('/food/previous', { meal, date: today });
      setFoodData((prev) => ({ ...prev, [meal]: res.data.meal }));
      showMessage(`Previous ${meal} data copied!`);
    } catch (error) {
      showMessage(error.response?.data?.error || 'No previous data found', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async (meal) => {
    setSubmitting(true);
    try {
      const res = await API.post('/food/skip', { meal, date: today });
      setFoodData((prev) => ({ ...prev, [meal]: res.data.meal }));
      showMessage(`${meal} skipped for today`);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Failed to skip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openFoodSelection = (meal, type) => {
    navigate(`/food/${meal}/${type}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container animate-fade-in">
      <h1 className="page-title">🍽️ Food</h1>

      {message && (
        <div className={`toast toast-${message.type}`}>{message.text}</div>
      )}

      <div className="grid-3">
        {meals.map((meal) => {
          const data = foodData[meal.key];
          const isSubmitted = data?.submitted;

          // Card disappears after submission (shows mini summary instead)
          if (isSubmitted && !data.skipped) {
            return (
              <div key={meal.key} className="glass-card" style={{ textAlign: 'center', opacity: 0.7 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
                <h4>{meal.label}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  {data.co2Emission?.toFixed(4)} kg CO₂
                </p>
                <span className="badge badge-success" style={{ marginTop: 8 }}>Recorded</span>
              </div>
            );
          }

          if (isSubmitted && data.skipped) {
            return (
              <div key={meal.key} className="glass-card" style={{ textAlign: 'center', opacity: 0.7 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⏭️</div>
                <h4>{meal.label}</h4>
                <span className="badge badge-warning" style={{ marginTop: 8 }}>Skipped</span>
              </div>
            );
          }

          return (
            <div key={meal.key} className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{meal.icon}</div>
              <h4>{meal.label}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>{meal.time}</p>

              <div className="toggle-group" style={{ marginBottom: 16 }}>
                <button
                  className="toggle-btn"
                  onClick={() => openFoodSelection(meal.key, 'veg')}
                >
                  🥦 Veg
                </button>
                <button
                  className="toggle-btn"
                  onClick={() => openFoodSelection(meal.key, 'non_veg')}
                >
                  🍗 Non-Veg
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePrevious(meal.key)}
                  disabled={submitting}
                >
                  📋 Previous
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleSkip(meal.key)}
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
