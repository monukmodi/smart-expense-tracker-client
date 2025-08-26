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

  // NOTE: Email verification is temporarily disabled.
  // The original implementation is preserved below in a block comment for later re-enable.

  return (
    <AuthLayout title="Email verification disabled" subtitle="You can proceed without verifying for now.">
      <div style={{
        marginTop: 8,
        padding: '12px 14px',
        borderRadius: 10,
        background: 'rgba(59,130,246,.08)',
        border: '1px solid rgba(59,130,246,.25)',
        color: '#dbeafe',
        fontSize: 13,
        lineHeight: 1.5,
      }}>
        This feature is turned off for development. Use your credentials to log in directly.
      </div>
      <Button type="button" onClick={() => navigate('/login')} style={{ width: '100%', marginTop: 12 }}>
        Go to login
      </Button>
    </AuthLayout>
  );
}

/*
// Original implementation (kept for later):
export default function VerifyOriginal() {
  const navigate = useNavigate();
  const query = useQuery();
  const initialEmail = query.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  // const validate = () => { ... };
  // const handleVerify = async () => { ... };
  // const handleResend = async () => { ... };
  return (<div />);
}
*/
