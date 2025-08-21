import React from 'react';

export default function Button({ children, type = 'button', variant = 'primary', style, ...rest }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid transparent',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all .2s ease',
  };

  const variants = {
    primary: {
      color: '#081018',
      background: 'linear-gradient(180deg, #22d3ee, #22c1ee)',
      boxShadow: '0 8px 20px rgba(34, 211, 238, .25)',
    },
    ghost: {
      color: '#e5e7eb',
      background: 'transparent',
      border: '1px solid rgba(255,255,255,.12)',
    },
  };

  return (
    <button type={type} style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}
