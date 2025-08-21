import React from 'react';

export default function Modal({ open, title, children, onClose, width = 520 }) {
  if (!open) return null;
  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={{ ...styles.modal, width }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}> 
          <div style={styles.title}>{title}</div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">✕</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'rgba(17,24,39,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  title: { fontWeight: 700, color: '#f3f4f6' },
  body: { padding: 14 },
  closeBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#e5e7eb',
    borderRadius: 8,
    padding: '4px 8px',
    cursor: 'pointer',
  },
};
