import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Input from '../components/UI/Input.jsx';
import Button from '../components/UI/Button.jsx';
import { verifyEmail, resendVerificationCode } from '../services/auth.js';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Verify() {
  const navigate = useNavigate();
  const query = useQuery();
  const initialEmail = query.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!/^\d{6}$/.test(code)) e.code = 'Enter the 6-digit code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async (ev) => {
    ev.preventDefault();
    setMessage('');
    if (!validate()) return;
    setLoading(true);
    try {
      await verifyEmail({ email, code });
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.message || 'Verification failed.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage('');
    if (!email) {
      setErrors((e) => ({ ...e, email: 'Email is required' }));
      return;
    }
    setResending(true);
    try {
      const { message: m } = await resendVerificationCode({ email });
      setMessage(m || 'Verification code resent.');
    } catch (err) {
      const msg = err?.message || 'Failed to resend code.';
      setMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code sent to your email">
      <form onSubmit={handleVerify}>
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
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          error={!!errors.code}
          helperText={errors.code}
          placeholder="123456"
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
          {loading ? 'Verifying…' : 'Verify email'}
        </Button>
        <Button type="button" variant="secondary" disabled={resending} onClick={handleResend} style={{ width: '100%', marginTop: 10 }}>
          {resending ? 'Resending…' : 'Resend code'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: 14, color: '#9ca3af', fontSize: 13 }}>
          Wrong email? <Link to="/register" style={{ color: '#22d3ee' }}>Create a new account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
