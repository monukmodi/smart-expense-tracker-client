import React, { useState } from 'react';
import { createTransaction } from '../services/transactions.js';

export default function TransactionForm({ onCreated, submitLabel = 'Add Transaction', onCancel }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const created = await createTransaction({ amount: amt, category, date, description });
      setAmount('');
      setCategory('General');
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      if (onCreated) onCreated(created);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create transaction';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}> 
        <div style={styles.field}> 
          <label style={styles.label}>Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={styles.input}
          />
        </div>
        <div style={styles.field}> 
          <label style={styles.label}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
            <option>General</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Health</option>
            <option>Utilities</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>
        </div>
        <div style={styles.field}> 
          <label style={styles.label}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
        </div>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" style={styles.input} />
      </div>

      {error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {onCancel ? (
          <button type="button" onClick={onCancel} disabled={loading} style={styles.cancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={loading} style={styles.submit}> 
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    background: 'rgba(17,24,39,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr',
    gap: 12,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
  },
  input: {
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#e5e7eb',
    borderRadius: 8,
    padding: '10px 12px',
    outline: 'none',
  },
  errorBox: {
    background: 'rgba(239,68,68,.08)',
    color: '#fecaca',
    border: '1px solid rgba(239,68,68,.25)',
    padding: '10px 12px',
    borderRadius: 10,
    fontSize: 13,
    marginTop: 12,
  },
  submit: {
    marginTop: 12,
    width: '100%',
    background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
    color: '#05202d',
    border: 'none',
    borderRadius: 10,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  cancel: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#e5e7eb',
    borderRadius: 10,
    padding: '10px 14px',
    cursor: 'pointer',
    flexShrink: 0,
  },
}
