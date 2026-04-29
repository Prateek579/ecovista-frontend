import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { FOOD_OPTIONS } from '../utils/constants';

export default function FoodSelection() {
  const { meal, type } = useParams();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Get food options based on meal and type
  const options = FOOD_OPTIONS[meal]?.[type] || [];
  const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);
  const typeLabel = type === 'veg' ? '🥦 Vegetarian' : '🍗 Non-Vegetarian';

  const toggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await API.post('/food', {
        meal,
        items: selectedItems,
        type,
        date: today,
      });
      navigate('/food', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save food data');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/food')}
        >
          ← Back
        </button>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{mealLabel}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{typeLabel}</p>
        </div>
      </div>

      {error && (
        <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="glass-card no-hover">
        <h3 style={{ marginBottom: 4 }}>Select your items</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          Tap to select what you had for {meal}
        </p>

        <div className="chip-grid">
          {options.map((item) => (
            <button
              key={item}
              className={`chip ${selectedItems.includes(item) ? 'selected' : ''}`}
              onClick={() => toggleItem(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-glass-strong)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Selected: {selectedItems.length} items
            </span>
          </div>
        )}

        <button
          className="btn btn-primary btn-block btn-lg"
          style={{ marginTop: 24 }}
          onClick={handleSubmit}
          disabled={submitting || selectedItems.length === 0}
        >
          {submitting ? 'Saving...' : `Submit ${mealLabel}`}
        </button>
      </div>
    </div>
  );
}
