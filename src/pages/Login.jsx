import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2, Truck, Shield, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

// ── Allowed email domains (shared with Register) ──────────────────────────
const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in',
  'hotmail.com', 'outlook.com', 'outlook.in',
  'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'zoho.com', 'zohomail.in',
  'protonmail.com', 'proton.me',
  'yandex.com', 'mail.com', 'gmx.com', 'gmx.net',
  'rediffmail.com', 'fastmail.com',
  'tutanota.com', 'hey.com',
];

function isValidEmail(email) {
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!basic) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && ALLOWED_DOMAINS.includes(domain);
}

function EmailDomainHint({ email }) {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || domain.length < 2) return null;

  const isValid = ALLOWED_DOMAINS.includes(domain);
  const partialMatch = ALLOWED_DOMAINS.some(d => d.startsWith(domain));

  if (isValid) {
    return (
      <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
        <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {domain} is supported ✓
      </p>
    );
  }
  if (partialMatch) {
    return (
      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
        <AlertCircle className="w-3 h-3 flex-shrink-0" /> Keep typing...
      </p>
    );
  }
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
      <XCircle className="w-3 h-3 flex-shrink-0" /> "{domain}" not supported. Use Gmail, Yahoo, Outlook, etc.
    </p>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email domain before sending to server
    if (!isValidEmail(email)) {
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain) {
        setEmailError('Enter a valid email address.');
      } else {
        setEmailError(`"${domain}" is not a supported email provider. Use Gmail, Yahoo, Outlook, etc.`);
      }
      return;
    }
    setEmailError('');

    setLoading(true);
    try {
      const responseData = await login(email, password);
      const actualRole = responseData.data.user.role;

      if (role !== actualRole) {
        toast.error(`Access denied. You are trying to login as ${role} but your account is a ${actualRole}.`);
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${responseData.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Login failed';
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-16 md:py-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-slate-500">Sign in to your SwiftShip account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6 animate-fade-in-up-delay-1">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-50 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'user' 
                  ? 'bg-white text-primary-600 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" /> User
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'admin' 
                  ? 'bg-white text-primary-600 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
          </div>

          <div className="space-y-4">
            {/* Email with domain validation */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email" type="email" required
                  className={`input-field pl-10 ${emailError ? 'border-red-400 focus:ring-red-300' : ''}`}
                  placeholder="you@gmail.com"
                  value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {emailError}
                </p>
              )}
              <EmailDomainHint email={email} />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password" type="password" required
                  className="input-field pl-10" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            id="login-submit" type="submit" disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              <><LogIn className="w-4 h-4" /> Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</>
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
