import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@kashvi.com');
  const [password, setPassword] = useState('Admin@2024');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [is2FA, setIs2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  const quickFill = (r) => {
    setRole(r);
    if (r === 'admin') {
      setEmail('admin@kashvi.com');
      setPassword('Admin@2024');
    } else if (r === 'teacher') {
      setEmail('teacher@kashvi.com');
      setPassword('Teacher@123');
    } else if (r === 'student') {
      setEmail('student@kashvi.com');
      setPassword('Student@123');
    } else if (r === 'parent') {
      setEmail('parent@kashvi.com');
      setPassword('Parent@123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(email, password, role);
    setLoading(false);

    if (res?.requires2FA) {
      setIs2FA(true);
      setPendingUserId(res.userId);
      toast('2FA Required: Enter your authentication code', { icon: '🔐' });
      return;
    }

    if (res?.success) {
      navigate(`/dashboard/${res.user.role}`);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await verify2FA(pendingUserId, otpCode);
    setLoading(false);

    if (res?.success) {
      navigate(`/dashboard/${res.user.role}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Kashvi SmartClass</h2>
          <p className="mt-1 text-xs text-slate-400">Institutional School & Academic Management</p>
        </div>

        {/* Demo Role Selector Chips */}
        <div className="mb-6 grid grid-cols-4 gap-1.5 rounded-2xl bg-slate-950/60 p-1.5 border border-slate-800">
          {['admin', 'teacher', 'student', 'parent'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => quickFill(r)}
              className={`rounded-xl py-2 text-xs font-bold capitalize transition-all ${
                role === r
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {is2FA ? (
          /* 2FA Verification Form */
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-center">
              <KeyRound className="mx-auto mb-1 h-6 w-6 text-indigo-400" />
              <p className="text-xs font-semibold text-indigo-300">Two-Factor Authentication</p>
              <p className="text-[11px] text-slate-400">Enter your 6-digit verification code</p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        ) : (
          /* Primary Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Institutional Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500"
                  placeholder="name@kashvi.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : `Enter ${role.toUpperCase()} Dashboard`}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-500">Kashvi SmartClass Security Protected • JWT Encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
