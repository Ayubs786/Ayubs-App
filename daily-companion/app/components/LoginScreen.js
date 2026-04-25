'use client';

import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

export default function LoginScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e?.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (r.ok) {
        window.location.reload();
      } else {
        const j = await r.json();
        setError(j.error || 'Wrong password');
        setLoading(false);
      }
    } catch (e) {
      setError('Could not sign in');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1A1612 0%, #0B0908 100%)',
      fontFamily: "'Geist', -apple-system, sans-serif",
      color: '#F5F0E8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Geist:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(circle 500px at 15% 10%, rgba(201, 152, 106, 0.28), transparent 65%),
          radial-gradient(circle 400px at 85% 90%, rgba(201, 122, 92, 0.20), transparent 65%)
        `
      }} />

      <form onSubmit={submit} style={{
        position: 'relative', zIndex: 1,
        maxWidth: '400px', width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#F5F0E8',
        }}>
          <Lock size={24} strokeWidth={1.6} />
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '32px', fontWeight: 500,
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>Daily Companion</h1>
        <p style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: '15px', color: 'rgba(245, 240, 232, 0.6)',
          margin: '0 0 32px',
        }}>Enter your password to continue.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px',
            color: '#F5F0E8',
            fontFamily: 'inherit', fontSize: '16px',
            outline: 'none',
            marginBottom: '12px',
            boxSizing: 'border-box',
          }}
        />

        <button
          type="submit"
          disabled={loading || !password.trim()}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: password.trim() && !loading ? '#F5F0E8' : 'rgba(255,255,255,0.08)',
            color: password.trim() && !loading ? '#1A1410' : 'rgba(245,240,232,0.4)',
            border: 'none', borderRadius: '14px',
            cursor: password.trim() && !loading ? 'pointer' : 'not-allowed',
            fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Signing in…' : 'Continue'}
        </button>

        {error && (
          <p style={{
            color: '#E89A9A', fontSize: '14px', margin: '14px 0 0',
            fontFamily: 'inherit',
          }}>{error}</p>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  );
}
