import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import TransactionForm from '../components/TransactionForm.jsx';
import Modal from '../components/UI/Modal.jsx';
import { getUser } from '../utils/storage.js';
import { logoutUser } from '../services/auth.js';
import { listTransactions } from '../services/transactions.js';
import Spinner from '../components/UI/Spinner.jsx';
import { useToast } from '../components/UI/Toast.jsx';
import { predictExpenses } from '../services/predict.js';
import { getCoach, scanRecurring } from '../services/ai.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = getUser();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [predictDays, setPredictDays] = useState(30);
  // Prediction uses shared AI settings below
  // Shared AI settings for Coach and Recurring
  const [aiProvider, setAiProvider] = useState('heuristic'); // 'auto' | 'gemini' | 'openai' | 'heuristic'
  const [aiFreeOnly, setAiFreeOnly] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [lastSource, setLastSource] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Coach states
  const [coachDays, setCoachDays] = useState(90);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coach, setCoach] = useState(null); // { tips, savingsEstimate, suggestedBudget, notes }
  const [coachSource, setCoachSource] = useState('');

  // Recurring scan states
  const [recDays, setRecDays] = useState(180);
  const [recLoading, setRecLoading] = useState(false);
  const [recItems, setRecItems] = useState([]);
  const [recSource, setRecSource] = useState('');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((s) => s[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : 'U';

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Use only size for compatibility with stricter server validation
        const data = await listTransactions({ size: 50 });
        if (!mounted) return;
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setTxns(items);
      } catch (e) {
        if (!mounted) return;
        const msg = e?.response?.data?.message || e?.message || 'Failed to load transactions';
        setError(msg);
        try { toast.error(msg); } catch (_) {}
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute chart data from transactions
  const { lineData, pieData } = useMemo(() => {
    if (!txns.length) return { lineData: null, pieData: null };

    // Weekly spending (last 7 days)
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const sumsByDay = Array(7).fill(0);
    txns.forEach((t) => {
      const d = new Date(t.date || t.createdAt || Date.now());
      const idx = last7.findIndex((x) => x.toDateString() === new Date(d.setHours(0, 0, 0, 0)).toDateString());
      if (idx >= 0) sumsByDay[idx] += Number(t.amount) || 0;
    });
    const line = {
      labels: last7.map((d) => dayLabels[d.getDay()]),
      datasets: [
        {
          label: 'Spending',
          data: sumsByDay,
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34,211,238,.15)',
          fill: true,
          tension: 0.35,
        },
      ],
    };

    // Category distribution
    const byCat = {};
    txns.forEach((t) => {
      const cat = t.category || 'Other';
      byCat[cat] = (byCat[cat] || 0) + (Number(t.amount) || 0);
    });
    const catLabels = Object.keys(byCat);
    const catValues = catLabels.map((k) => byCat[k]);
    const colors = ['#22d3ee', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#fb7185'];
    const pie = {
      labels: catLabels,
      datasets: [
        {
          data: catValues,
          backgroundColor: catLabels.map((_, i) => colors[i % colors.length]),
          borderColor: 'rgba(0,0,0,0)',
        },
      ],
    };

    return { lineData: line, pieData: pie };
  }, [txns]);

  // Overview metrics
  const { totalSpent, totalIncome, balance, monthSpent, monthIncome } = useMemo(() => {
    if (!txns.length) return { totalSpent: 0, totalIncome: 0, balance: 0, monthSpent: 0, monthIncome: 0 };
    const now = new Date();
    const sameMonth = (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    let spent = 0, income = 0, mSpent = 0, mIncome = 0;
    txns.forEach((t) => {
      const amt = Number(t.amount) || 0;
      const d = new Date(t.date || t.createdAt || Date.now());
      if (amt >= 0) {
        spent += amt;
        if (sameMonth(d)) mSpent += amt;
      } else {
        income += Math.abs(amt);
        if (sameMonth(d)) mIncome += Math.abs(amt);
      }
    });
    return { totalSpent: spent, totalIncome: income, balance: income - spent, monthSpent: mSpent, monthIncome: mIncome };
  }, [txns]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>Smart Expense Tracker</div>
        <div style={styles.headerRight}>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              style={styles.avatar}
              title="Account"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {initials}
            </button>
            {menuOpen && (
              <div style={styles.menu}>
                {user ? (
                  <div style={{ padding: '10px 12px' }}>
                    <div style={styles.menuHeaderName}>{user.name}</div>
                    <div style={styles.menuHeaderEmail}>{user.email}</div>
                  </div>
                ) : null}
                <div style={styles.menuDivider} />
                <button style={styles.menuAction} onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button style={styles.primaryBtn} onClick={() => setAddOpen(true)}>+ Add Transaction</button>
        </div>
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Transaction">
          <TransactionForm
            submitLabel="Save"
            onCancel={() => setAddOpen(false)}
            onCreated={(item) => {
              setTxns((prev) => [item, ...prev]);
              try { toast.success('Transaction added'); } catch (_) {}
              setAddOpen(false);
            }}
          />
        </Modal>
        

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Overview</h2>
          <div style={styles.cards}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Total Balance</div>
              <div style={styles.cardValue}>${balance.toFixed(2)}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>This Month Spend</div>
              <div style={styles.cardValue}>${monthSpent.toFixed(2)}</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>This Month Income</div>
              <div style={styles.cardValue}>${monthIncome.toFixed(2)}</div>
            </div>
          </div>
        </section>

        

        

        

        

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Charts</h2>
          {loading ? (
            <div style={styles.cardTall}><Spinner label="Loading charts..." /></div>
          ) : error ? (
            <div style={styles.cardTall}>Error: {error}</div>
          ) : !txns.length ? (
            <div style={styles.cardTall}>No data yet. Add your first transaction to see insights.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={styles.cardTall}>
                {lineData ? <Line data={lineData} options={lineOptions} /> : 'No data'}
              </div>
              <div style={styles.cardTall}>
                {pieData ? <Pie data={pieData} /> : 'No data'}
              </div>
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Transactions</h2>
          {loading ? (
            <div style={styles.cardTall}><Spinner label="Loading transactions..." /></div>
          ) : error ? (
            <div style={styles.cardTall}>Error: {error}</div>
          ) : !txns.length ? (
            <div style={styles.cardTall}>No transactions yet.</div>
          ) : (
            <div style={{
              background: 'rgba(17,24,39,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 0, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#9ca3af', fontSize: 12 }}>
                <div>Date</div>
                <div>Category</div>
                <div>Description</div>
                <div style={{ textAlign: 'right' }}>Amount</div>
              </div>
              {txns
                .slice()
                .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                .slice(0, 6)
                .map((t) => {
                  const amt = Number(t.amount) || 0;
                  const isIncome = amt < 0;
                  return (
                    <div key={t._id || t.id || `${t.date}-${t.category}-${amt}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: 0, padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>{new Date(t.date || t.createdAt).toLocaleDateString()}</div>
                      <div>{t.category || 'Other'}</div>
                      <div style={{ color: '#9ca3af' }}>{t.description || '-'}</div>
                      <div style={{ textAlign: 'right', color: isIncome ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                        {isIncome ? '+' : '-'}${Math.abs(amt).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* AI consolidated at bottom */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>AI</h2>
          {/* AI Settings */}
          <div style={styles.card}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#9ca3af', fontSize: 12 }}>Provider</span>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  disabled={aiFreeOnly}
                  style={{
                    background: 'transparent',
                    color: '#e5e7eb',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    padding: '6px 8px',
                  }}
                >
                  <option value="auto">Auto</option>
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="heuristic">Heuristic (Free)</option>
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }} title="When enabled, only the free heuristic will be used.">
                <input type="checkbox" checked={aiFreeOnly} onChange={(e) => {
                  const v = e.target.checked; setAiFreeOnly(v); if (v) setAiProvider('heuristic');
                }} />
                <span style={{ color: '#9ca3af', fontSize: 12 }}>Free only</span>
              </label>
            </div>
          </div>

          {/* Coach */}
          <div style={{ marginTop: 16 }}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 8 }}>Coach</h3>
            <div style={styles.card}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>Days window</span>
                  <input
                    type="number"
                    min={7}
                    max={180}
                    value={coachDays}
                    onChange={(e) => setCoachDays(Number(e.target.value))}
                    style={{
                      width: 90,
                      background: 'transparent',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      padding: '6px 8px',
                    }}
                  />
                </label>
                <button
                  onClick={async () => {
                    setCoachLoading(true);
                    setCoach(null);
                    try {
                      let payload = { days: coachDays, freeOnly: aiFreeOnly };
                      if (!aiFreeOnly) payload.provider = aiProvider === 'auto' ? 'auto' : aiProvider;
                      const result = await getCoach(payload);
                      setCoach(result?.coach || null);
                      setCoachSource(result?.source || 'heuristic');
                      try { toast.success(`Coach ready (${result?.cached ? 'cached, ' : ''}${result?.source || 'heuristic'})`); } catch (_) {}
                    } catch (e) {
                      const msg = e?.response?.data?.message || e?.message || 'Coach failed';
                      try { toast.error(msg); } catch (_) {}
                    } finally {
                      setCoachLoading(false);
                    }
                  }}
                  style={styles.iconBtn}
                  disabled={coachLoading}
                >
                  {coachLoading ? 'Analyzing…' : 'Get Tips'}
                </button>
                {coachSource ? (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: '#22d3ee',
                    border: '1px solid rgba(34,211,238,0.35)',
                    borderRadius: 999,
                    padding: '4px 8px',
                    lineHeight: 1,
                  }} title="Last used provider">
                    {coachSource}
                  </span>
                ) : null}
              </div>

              {coachLoading ? (
                <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>
                  <Spinner label={aiFreeOnly || aiProvider === 'heuristic' ? 'Using heuristic…' : aiProvider === 'gemini' ? 'Calling Gemini…' : aiProvider === 'openai' ? 'Calling OpenAI…' : 'Auto…'} />
                </div>
              ) : coach ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#9ca3af' }}>Estimated monthly savings</div>
                    <div style={{ fontWeight: 700, color: '#22d3ee' }}>${Number(coach.savingsEstimate || 0).toFixed(2)}</div>
                  </div>

                  <div>
                    <div style={{ color: '#9ca3af', marginBottom: 6 }}>Suggested budget (per category)</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {Object.keys(coach.suggestedBudget || {}).length === 0 ? (
                        <div style={{ color: '#9ca3af' }}>No categories available</div>
                      ) : (
                        Object.entries(coach.suggestedBudget).map(([cat, v]) => (
                          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>{cat}</div>
                            <div style={{ color: '#f3f4f6' }}>${Number(v.current || 0).toFixed(2)}
                              <span style={{ color: '#9ca3af', margin: '0 6px' }}>→</span>
                              <span style={{ color: '#22d3ee', fontWeight: 700 }}>${Number(v.suggested || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#9ca3af', marginBottom: 6 }}>Top tips</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {(coach.tips || []).length === 0 ? (
                        <div style={{ color: '#9ca3af' }}>No tips available</div>
                      ) : (
                        (coach.tips || []).map((t, i) => (
                          <div key={i} style={{
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10,
                            display: 'grid', gap: 6,
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 700 }}>{t.title}</div>
                              <span style={{
                                fontSize: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
                                padding: '2px 8px', color: t.impact === 'high' ? '#fbbf24' : '#9ca3af'
                              }}>{t.impact || 'medium'}</span>
                            </div>
                            <div style={{ color: '#9ca3af' }}>{t.detail}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {(coach.notes || []).length ? (
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Notes: {(coach.notes || []).join(' • ')}</div>
                  ) : null}
                </div>
              ) : (
                <div style={{ color: '#9ca3af' }}>Personalized budget tips will appear here.</div>
              )}
            </div>
          </div>

          {/* Upcoming bills */}
          <div style={{ marginTop: 16 }}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 8 }}>Upcoming bills</h3>
            <div style={styles.card}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>Days window</span>
                  <input
                    type="number"
                    min={30}
                    max={365}
                    value={recDays}
                    onChange={(e) => setRecDays(Number(e.target.value))}
                    style={{
                      width: 90,
                      background: 'transparent',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      padding: '6px 8px',
                    }}
                  />
                </label>
                <button
                  onClick={async () => {
                    setRecLoading(true);
                    setRecItems([]);
                    try {
                      const payload = { days: recDays, freeOnly: aiFreeOnly };
                      if (!aiFreeOnly) payload.provider = aiProvider === 'auto' ? 'auto' : aiProvider;
                      const result = await scanRecurring(payload);
                      setRecItems(Array.isArray(result?.items) ? result.items : []);
                      setRecSource(result?.source || 'heuristic');
                      try { toast.success(`Recurring ready (${result?.source || 'heuristic'})`); } catch (_) {}
                    } catch (e) {
                      const msg = e?.response?.data?.message || e?.message || 'Recurring scan failed';
                      try { toast.error(msg); } catch (_) {}
                    } finally {
                      setRecLoading(false);
                    }
                  }}
                  style={styles.iconBtn}
                  disabled={recLoading}
                >
                  {recLoading ? 'Scanning…' : 'Scan'}
                </button>
                {recSource ? (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: '#22d3ee',
                    border: '1px solid rgba(34,211,238,0.35)',
                    borderRadius: 999,
                    padding: '4px 8px',
                    lineHeight: 1,
                  }} title="Last used provider">
                    {recSource}
                  </span>
                ) : null}
              </div>

              {recLoading ? (
                <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>
                  <Spinner label={aiFreeOnly || aiProvider === 'heuristic' ? 'Using heuristic…' : aiProvider === 'gemini' ? 'Calling Gemini…' : aiProvider === 'openai' ? 'Calling OpenAI…' : 'Auto…'} />
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {recItems.length === 0 ? (
                    <div style={{ color: '#9ca3af' }}>No upcoming bills found. Try increasing the days window.</div>
                  ) : (
                    recItems.map((it, idx) => (
                      <div key={idx} style={{
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10,
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{it.merchant}</div>
                          <div style={{ color: '#9ca3af', fontSize: 12 }}>{it.category || 'Other'}</div>
                        </div>
                        <div style={{ color: '#f3f4f6' }}>${Number(it.avgAmount || 0).toFixed(2)}</div>
                        <div style={{ color: '#9ca3af' }}>{it.cadence}</div>
                        <div style={{ textAlign: 'right' }}>
                          <span>{new Date(it.nextDueDate).toLocaleDateString()}</span>
                          <span style={{
                            marginLeft: 8,
                            fontSize: 12,
                            color: '#22d3ee',
                            border: '1px solid rgba(34,211,238,0.35)',
                            borderRadius: 999,
                            padding: '2px 6px',
                          }} title="Confidence">
                            {(Number(it.confidence || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prediction */}
          <div style={{ marginTop: 16 }}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 8 }}>Prediction</h3>
            <div style={styles.card}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>Days window</span>
                  <input
                    type="number"
                    min={7}
                    max={180}
                    value={predictDays}
                    onChange={(e) => setPredictDays(Number(e.target.value))}
                    style={{
                      width: 90,
                      background: 'transparent',
                      color: '#e5e7eb',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8,
                      padding: '6px 8px',
                    }}
                  />
                </label>
                <button
                  onClick={async () => {
                    setPredicting(true);
                    setPrediction(null);
                    try {
                      // Build call strategy using shared AI settings
                      let result = null;
                      if (aiFreeOnly || aiProvider === 'heuristic') {
                        result = await predictExpenses({ days: predictDays });
                      } else if (aiProvider === 'gemini') {
                        result = await predictExpenses({ days: predictDays, useGemini: true });
                      } else if (aiProvider === 'openai') {
                        result = await predictExpenses({ days: predictDays, useOpenAI: true });
                      } else {
                        // auto: try gemini then openai, else heuristic
                        result = await predictExpenses({ days: predictDays, useGemini: true });
                        if (result?.source === 'heuristic') {
                          try {
                            result = await predictExpenses({ days: predictDays, useOpenAI: true });
                          } catch (_) {
                            // ignore and keep heuristic
                          }
                        }
                      }
                      const { prediction: p, source } = result || {};
                      setPrediction({ ...p, source });
                      if (source) setLastSource(source);
                      try { toast.success(`Prediction ready (${source || 'heuristic'})`); } catch (_) {}
                    } catch (e) {
                      const msg = e?.response?.data?.message || e?.message || 'Prediction failed';
                      try { toast.error(msg); } catch (_) {}
                    } finally {
                      setPredicting(false);
                    }
                  }}
                  style={styles.iconBtn}
                  disabled={predicting}
                >
                  {predicting ? 'Predicting…' : 'Predict'}
                </button>
                {lastSource ? (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: '#22d3ee',
                    border: '1px solid rgba(34,211,238,0.35)',
                    borderRadius: 999,
                    padding: '4px 8px',
                    lineHeight: 1,
                  }} title="Last used provider">
                    {lastSource}
                  </span>
                ) : null}
              </div>

              {predicting ? (
                <div style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>
                  <Spinner label={aiFreeOnly || aiProvider === 'heuristic' ? 'Using heuristic…' : aiProvider === 'gemini' ? 'Calling Gemini…' : aiProvider === 'openai' ? 'Calling OpenAI…' : 'Auto…'} />
                </div>
              ) : prediction ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#9ca3af' }}>Analyzed</div>
                    <div style={{ fontWeight: 700 }}>{prediction.daysAnalyzed} days</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#9ca3af' }}>Predicted next 30 days</div>
                    <div style={{ fontWeight: 700, color: '#22d3ee' }}>${Number(prediction.predictedNextMonthTotal || 0).toFixed(2)}</div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div style={{ color: '#9ca3af', marginBottom: 6 }}>Per-category</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {Object.keys(prediction.categoryBreakdown || {}).length === 0 ? (
                        <div style={{ color: '#9ca3af' }}>No categories available</div>
                      ) : (
                        Object.entries(prediction.categoryBreakdown).map(([cat, val]) => (
                          <div key={cat} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>{cat}</div>
                            <div style={{ color: '#f3f4f6' }}>${Number(val.predictedNext30Days ?? val).toFixed(2)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>Source: {prediction.source || prediction.method}</div>
                </div>
              ) : (
                <div style={{ color: '#9ca3af' }}>Your predicted monthly spend will appear here.</div>
              )}
            </div>
          </div>
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
  primaryBtn: {
    background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
    border: 'none',
    color: '#05202d',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    minWidth: 125,
    background: 'rgba(17,24,39,0.98)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    zIndex: 20,
  },
  menuHeaderName: { fontWeight: 700, color: '#f3f4f6', textAlign: 'left' },
  menuHeaderEmail: { color: '#9ca3af', fontSize: 12, marginTop: 2, textAlign: 'left' },
  menuDivider: { height: 1, background: 'rgba(255,255,255,0.06)' },
  menuAction: {
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: '#e5e7eb',
    padding: '10px 12px',
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
    textAlign: 'center',
    padding: 0,
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
