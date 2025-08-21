import React from 'react';

export default function Dashboard() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>Smart Expense Tracker</div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} title="Notifications">🔔</button>
          <div style={styles.avatar} title="User">U</div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <div style={styles.cards}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Total Balance</div>
              <div style={styles.cardValue}>$0.00</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>This Month Spend</div>
              <div style={styles.cardValue}>$0.00</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>This Month Income</div>
              <div style={styles.cardValue}>$0.00</div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Charts</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}>
            <div style={styles.cardTall}>Line chart (spending over time)</div>
            <div style={styles.cardTall}>Category split (pie)</div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Transactions</h2>
          <div style={styles.cardTall}>No transactions yet.</div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Prediction</h2>
          <div style={styles.cardTall}>Your predicted monthly spend will appear here.</div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    background: '#0b1220',
    color: '#e5e7eb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    background: 'rgba(17, 24, 39, 0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(8px)',
    zIndex: 10,
  },
  brand: {
    fontWeight: 700,
    color: '#22d3ee',
    letterSpacing: 0.3,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#e5e7eb',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 14,
    color: '#a7f3d0',
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: 20,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#9ca3af',
    margin: '0 0 10px 0',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  card: {
    background: 'rgba(17,24,39,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  cardTall: {
    background: 'rgba(17,24,39,0.8)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    display: 'grid',
    placeItems: 'center',
    color: '#9ca3af',
  },
  cardLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f3f4f6',
  },
};
