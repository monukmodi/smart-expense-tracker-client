import React from 'react';

export default function Input({ label, type = 'text', error, helperText, style, ...rest }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      {label && (
        <span
          style={{
            display: 'block',
            marginBottom: 8,
            color: '#d1d5db',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </span>
      )}
      <input
        type={type}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 10,
          border: `1px solid ${error ? 'rgba(239, 68, 68, .6)' : 'rgba(255,255,255,.12)'}`,
          background: 'rgba(2, 6, 23, .6)',
          color: '#f3f4f6',
          outline: 'none',
          transition: 'border-color .2s ease',
          ...style,
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(34,211,238,.6)')}
        onBlur={(e) => (e.target.style.borderColor = error ? 'rgba(239, 68, 68, .6)' : 'rgba(255,255,255,.12)')}
        {...rest}
      />
      {helperText && (
        <small style={{ color: error ? '#ef4444' : '#9ca3af', display: 'block', marginTop: 6 }}>
          {helperText}
        </small>
      )}
    </label>
  );
}
