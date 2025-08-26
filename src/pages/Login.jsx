import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../services/auth.js';
import AuthLayout from '../components/AuthLayout.jsx';
import Input from '../components/UI/Input.jsx';
import Button from '../components/UI/Button.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const googleDivRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return; // Not configured
    const onReady = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const idToken = response.credential;
            await googleLogin({ idToken });
            navigate('/dashboard');
          } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Google sign-in failed';
            setMessage(msg);
          }
        },
        auto_select: false,
        ux_mode: 'popup',
      });
      if (googleDivRef.current) {
        window.google.accounts.id.renderButton(googleDivRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
        });
      }
    };
    // If script already loaded, onReady immediately; else wait until it loads
    if (window.google?.accounts?.id) onReady();
    else {
      const check = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(check);
          onReady();
        }
      }, 200);
      return () => clearInterval(check);
    }
  }, [navigate]);

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
      await loginUser({ email, password });
      setMessage('Signed in successfully.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed.';
      setMessage(msg);
      // Temporarily disable redirect to verification page
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
        <div ref={googleDivRef} style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }} />
        <div style={{ textAlign: 'center', marginTop: 14, color: '#9ca3af', fontSize: 13 }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ color: '#22d3ee' }}>Register</Link>
        </div>
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(59,130,246,.08)',
            border: '1px solid rgba(59,130,246,.25)',
            color: '#dbeafe',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Guest/Dummy credentials</div>
          <div>
            Email: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: 'rgba(30,58,138,.45)', padding: '2px 6px', borderRadius: 6 }}>monu@test.com</span>
          </div>
          <div>
            Password: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: 'rgba(30,58,138,.45)', padding: '2px 6px', borderRadius: 6 }}>123456</span>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
