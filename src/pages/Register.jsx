import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Phone, Loader2, Truck, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

// ── Allowed email domains ──────────────────────────────────────────────────
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
  if (!basic) return { valid: false, msg: 'Enter a valid email address.' };
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
    return { valid: false, msg: `"${domain || ''}" is not a supported email provider. Use Gmail, Yahoo, Outlook, etc.` };
  }
  return { valid: true, msg: '' };
}

// ── Password strength calculator ───────────────────────────────────────────
function getPasswordStrength(pw) {
  let score = 0;
  const checks = {
    length6:      pw.length >= 6,
    length8:      pw.length >= 8,
    length12:     pw.length >= 12,
    uppercase:    /[A-Z]/.test(pw),
    lowercase:    /[a-z]/.test(pw),
    number:       /\d/.test(pw),
    special:      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
    noRepeat:     !/(.)\1{2,}/.test(pw), // no 3+ repeated chars
  };

  if (checks.length6)   score += 1;
  if (checks.length8)   score += 1;
  if (checks.length12)  score += 1;
  if (checks.uppercase) score += 1;
  if (checks.lowercase) score += 1;
  if (checks.number)    score += 1;
  if (checks.special)   score += 2; // special chars worth double
  if (checks.noRepeat)  score += 1;

  // score: 0-9  →  0-2 weak, 3-5 okay, 6-9 strong
  let level, label, color, barColor, percent;
  if (score <= 2) {
    level = 'weak'; label = 'Weak'; color = 'text-red-500'; barColor = 'bg-red-500'; percent = Math.max(15, (score / 9) * 100);
  } else if (score <= 5) {
    level = 'okay'; label = 'Okay'; color = 'text-amber-500'; barColor = 'bg-amber-400'; percent = (score / 9) * 100;
  } else {
    level = 'strong'; label = 'Strong'; color = 'text-emerald-500'; barColor = 'bg-emerald-500'; percent = (score / 9) * 100;
  }

  return { score, checks, level, label, color, barColor, percent: Math.min(100, percent) };
}

function validate(name, email, phone, password) {
  const errors = {};
  if (!name.trim() || name.trim().length < 2)
    errors.name = 'Full name must be at least 2 characters.';
  const emailResult = isValidEmail(email);
  if (!emailResult.valid)
    errors.email = emailResult.msg;
  if (phone.length !== 10)
    errors.phone = 'Enter exactly 10 digits.';
  if (password.length < 6)
    errors.password = 'Password must be at least 6 characters.';
  else {
    const strength = getPasswordStrength(password);
    if (strength.level === 'weak')
      errors.password = 'Password is too weak. Add uppercase, numbers, or special characters.';
  }
  return errors;
}

const Field = ({ id, label, icon: Icon, error, children }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      {children}
    </div>
    {error && (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
);

// ── Password Strength Bar Component ────────────────────────────────────────
function PasswordStrengthBar({ password }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2.5 animate-fade-in">
      {/* Bar */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${strength.barColor}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>

      {/* Label + Score */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${strength.color}`}>
          {strength.label} ({strength.score}/9)
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {strength.level === 'strong' ? '🛡️ Excellent!' : strength.level === 'okay' ? '⚡ Getting there' : '⚠️ Too weak'}
        </span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          { key: 'length8',   label: '8+ characters' },
          { key: 'uppercase', label: 'Uppercase (A-Z)' },
          { key: 'lowercase', label: 'Lowercase (a-z)' },
          { key: 'number',    label: 'Number (0-9)' },
          { key: 'special',   label: 'Special (!@#$...)' },
          { key: 'noRepeat',  label: 'No repeats (aaa)' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            {strength.checks[key] ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 text-slate-300 flex-shrink-0" />
            )}
            <span className={`text-[11px] ${strength.checks[key] ? 'text-slate-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Email Domain Hint ──────────────────────────────────────────────────────
function EmailDomainHint({ email }) {
  if (!email || !email.includes('@')) return null;

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  const isValid = ALLOWED_DOMAINS.includes(domain);
  // Only show partial typing hint if they've typed at least 2 chars after @
  if (domain.length < 2) return null;

  // Check if they're typing a valid domain (partial match)
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

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(name, email, phone, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const user = await register(name, email, password, `+91${phone}`);
      toast.success(`Welcome, ${user.name}! Account created.`);
      navigate('/dashboard');
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(`Error: ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-16 md:py-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-slate-500">Sign up to start shipping with SwiftShip</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-8 space-y-5 animate-fade-in-up-delay-1" noValidate>
          <Field id="register-name" label="Full Name" icon={User} error={errors.name}>
            <input
              id="register-name"
              type="text"
              required
              className={`input-field pl-10 ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            />
          </Field>

          {/* Email with domain validation */}
          <div>
            <Field id="register-email" label="Email Address" icon={Mail} error={errors.email}>
              <input
                id="register-email"
                type="email"
                required
                className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              />
            </Field>
            <EmailDomainHint email={email} />
          </div>

          <Field id="register-phone" label="Phone Number" icon={Phone} error={errors.phone}>
            <div className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-medium pointer-events-none pr-1.5 border-r border-slate-200">
              +91
            </div>
            <input
              id="register-phone"
              type="tel"
              required
              maxLength={10}
              className={`input-field pl-[4.5rem] ${errors.phone ? 'border-red-400 focus:ring-red-300' : ''}`}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setErrors((p) => ({ ...p, phone: '' })); }}
            />
          </Field>

          {/* Password with strength bar + toggle visibility */}
          <div>
            <label htmlFor="register-password" className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {errors.password}
              </p>
            )}
            <PasswordStrengthBar password={password} />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Account</>
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
