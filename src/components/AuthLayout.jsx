import React from 'react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>Smart Expense Tracker</div>
          <h1 style={styles.title}>{title}</h1>
          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div style={styles.body}>{children}</div>
        <div style={styles.footer}>
          <small style={{ color: '#6b7280' }}>
            © {new Date().getFullYear()} SET. All rights reserved.
          </small>
        </div>
      </div>
      <div style={styles.bgGradient} />
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    position: 'relative',
    background: '#0b1220',
  },
  bgGradient: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(800px 300px at 10% 10%, rgba(56, 189, 248, .15), transparent 60%),\
       radial-gradient(800px 300px at 90% 90%, rgba(167, 139, 250, .15), transparent 60%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    background: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 10px 30px rgba(0,0,0,.35)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  header: {
    padding: '28px 28px 0 28px',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: 0.3,
    color: '#22d3ee',
    border: '1px solid rgba(34, 211, 238, .25)',
    background: 'rgba(34, 211, 238, .06)',
    marginBottom: 12,
  },
  title: {
    margin: 0,
    color: '#f9fafb',
    fontSize: 26,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 0,
    color: '#9ca3af',
    fontSize: 14,
  },
  body: {
    padding: 28,
  },
  footer: {
    padding: '0 28px 24px 28px',
    textAlign: 'center',
  },
};
