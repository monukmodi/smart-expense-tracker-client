import React from 'react';

export default function Spinner({ size = 28, color = '#22d3ee', label }) {
  const border = Math.max(2, Math.round(size / 8));
  const style = {
    width: size,
    height: size,
    border: `${border}px solid rgba(255,255,255,0.1)`,
    borderTop: `${border}px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };
  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
      <div style={style} />
      {label ? <div style={{ color: '#9ca3af', fontSize: 13 }}>{label}</div> : null}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
