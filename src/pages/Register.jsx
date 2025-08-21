import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout.jsx';
import Input from '../components/UI/Input.jsx';
import Button from '../components/UI/Button.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const e = {};
    if (!name) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
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
      setMessage('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start managing your expenses smarter">
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          placeholder="Jane Doe"
        />
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
        <Input
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={!!errors.confirm}
          helperText={errors.confirm}
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
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 14, color: '#9ca3af', fontSize: 13 }}>
          Already have an account? <span style={{ color: '#22d3ee' }}>Login</span>
        </div>
      </form>
    </AuthLayout>
  );
}
