import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { WASTE_CATEGORIES, WASTE_ITEMS, WASTE_QUANTITIES } from '../utils/constants';

export default function WasteDetail() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [recycled, setRecycled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const catInfo = WASTE_CATEGORIES.find((c) => c.key === category);
  const items = WASTE_ITEMS[category] || [];
  const quantities = WASTE_QUANTITIES[category] || [];

  const toggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0 || !quantity) {
      setError('Select items and quantity');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/waste', { category, items: selectedItems, quantityLabel: quantity, recycled, date: today });
      navigate('/waste', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/waste')}>← Back</button>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{catInfo?.icon} {catInfo?.label}</h1>
      </div>
      {error && <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0, marginBottom: 16 }}>{error}</div>}
      <div className="glass-card no-hover">
        <h3 style={{ marginBottom: 16 }}>Select Items</h3>
        <div className="chip-grid" style={{ marginBottom: 24 }}>
          {items.map((item) => (
            <button key={item} className={`chip ${selectedItems.includes(item) ? 'selected' : ''}`} onClick={() => toggleItem(item)}>{item}</button>
          ))}
        </div>
        <h3 style={{ marginBottom: 12 }}>Quantity</h3>
        <div className="chip-grid" style={{ marginBottom: 24 }}>
          {quantities.map((q) => (
            <button key={q} className={`chip ${quantity === q ? 'selected' : ''}`} onClick={() => setQuantity(q)}>{q}</button>
          ))}
        </div>
        <h3 style={{ marginBottom: 12 }}>Disposal Method</h3>
        <div className="toggle-group" style={{ marginBottom: 24 }}>
          <button className={`toggle-btn ${!recycled ? 'active' : ''}`} onClick={() => setRecycled(false)} style={!recycled ? { background: 'linear-gradient(135deg, var(--accent-rose), #dc2626)' } : {}}>🗑️ Thrown Away</button>
          <button className={`toggle-btn ${recycled ? 'active' : ''}`} onClick={() => setRecycled(true)}>♻️ Recycled</button>
        </div>
        <button className="btn btn-primary btn-block btn-lg" onClick={handleSubmit} disabled={submitting || selectedItems.length === 0 || !quantity}>
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
