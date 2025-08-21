import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout.jsx';
import Input from '../components/UI/Input.jsx';
import Button from '../components/UI/Button.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMessage('');
    if (!validate()) return;
    setLoading(true);
    try {
      // Step 4 will replace this with real API call
      await new Promise((r) => setTimeout(r, 600));
      setMessage('Validation passed. API call will be wired in Step 4.');
    } catch (err) {
      setMessage('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue tracking your expenses">
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          placeholder="••••••••"
        />
        {message ? (
          <div style={{
            background: 'rgba(34,197,94,.08)',
            color: '#a7f3d0',
            border: '1px solid rgba(34,197,94,.25)',
            padding: '10px 12px',
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 12,
          }}>
            {message}
          </div>
        ) : null}
        <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: 6 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 14, color: '#9ca3af', fontSize: 13 }}>
          Don’t have an account? <span style={{ color: '#22d3ee' }}>Register</span>
        </div>
      </form>
    </AuthLayout>
  );
}
