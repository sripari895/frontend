import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Phone, Loader2, Truck, AlertCircle } from 'lucide-react';

const PHONE_RE = /^\+91\s?\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name, email, phone, password) {
  const errors = {};
  if (!name.trim() || name.trim().length < 2)
    errors.name = 'Full name must be at least 2 characters.';
  if (!EMAIL_RE.test(email))
    errors.email = 'Enter a valid email address.';
  if (phone.length !== 10)
    errors.phone = 'Enter exactly 10 digits.';
  if (password.length < 6)
    errors.password = 'Password must be at least 6 characters.';
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

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
      console.error('Registration Error Details:', err);
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

          <Field id="register-email" label="Email Address" icon={Mail} error={errors.email}>
            <input
              id="register-email"
              type="email"
              required
              className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
            />
          </Field>

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

          <Field id="register-password" label="Password" icon={Lock} error={errors.password}>
            <input
              id="register-password"
              type="password"
              required
              minLength={6}
              className={`input-field pl-10 ${errors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
            />
          </Field>

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
