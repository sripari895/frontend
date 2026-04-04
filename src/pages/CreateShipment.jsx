import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  User, MapPin, Phone, Weight, Ruler, DollarSign, Send, CheckCircle2,
  Package, ArrowRight, Loader2, AlertCircle,
} from 'lucide-react';

// Match backend price calculation exactly
function calculatePrice(weight, distance) {
  const baseCost = weight * 10;
  let distanceFactor = 0;
  if (distance <= 50) distanceFactor = 30;
  else if (distance <= 200) distanceFactor = 60;
  else if (distance <= 500) distanceFactor = 100;
  else if (distance <= 1000) distanceFactor = 180;
  else distanceFactor = 250;
  return Math.round((baseCost + distanceFactor) * 100) / 100;
}

const PHONE_RE = /^\+91\s?\d{10}$/;
const NAME_RE = /^.{2,}$/;

const INITIAL_FORM = {
  senderName: '', senderAddress: '', senderPhone: '',
  receiverName: '', receiverAddress: '', receiverPhone: '',
  weight: '', distance: '',
};

function validateForm(form) {
  const errors = {};
  if (!NAME_RE.test(form.senderName.trim()))
    errors.senderName = 'Name must be at least 2 characters.';
  if (!form.senderAddress.trim())
    errors.senderAddress = 'Address is required.';
  if (form.senderPhone.length !== 10)
    errors.senderPhone = 'Enter exactly 10 digits.';
  if (!NAME_RE.test(form.receiverName.trim()))
    errors.receiverName = 'Name must be at least 2 characters.';
  if (!form.receiverAddress.trim())
    errors.receiverAddress = 'Address is required.';
  if (form.receiverPhone.length !== 10)
    errors.receiverPhone = 'Enter exactly 10 digits.';
  if (Number(form.weight) <= 0)
    errors.weight = 'Weight must be greater than 0.';
  if (Number(form.distance) <= 0)
    errors.distance = 'Distance must be greater than 0.';
  return errors;
}

const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {msg}
    </p>
  ) : null;

export default function CreateShipment() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const livePrice =
    Number(form.weight) > 0 && Number(form.distance) > 0
      ? calculatePrice(Number(form.weight), Number(form.distance))
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setErrors({});
    setResult(null);
    setLoading(true);

    try {
      const { data } = await api.post('/shipments', {
        sender: { name: form.senderName, address: form.senderAddress, phone: `+91${form.senderPhone}` },
        receiver: { name: form.receiverName, address: form.receiverAddress, phone: `+91${form.receiverPhone}` },
        weight: Number(form.weight),
        distance: Number(form.distance),
      });
      setResult(data.data);
      setForm(INITIAL_FORM);
      toast.success(`Shipment created! Tracking ID: ${data.data.trackingId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create shipment';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success Screen ── */
  if (result) {
    return (
      <div className="container-app py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Shipment Created!</h2>
          <p className="text-slate-500 mb-8">Your shipment is ready to go. Here's the tracking details:</p>

          <div className="card p-6 text-left space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Tracking ID</span>
              <span className="text-lg font-bold text-primary-600 font-mono tracking-widest">{result.trackingId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Price</span>
              <span className="text-lg font-bold text-slate-900">₹{result.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{result.currentStatus}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/track/${result.trackingId}`} className="btn-primary rounded-xl">
              <Package className="w-4 h-4" /> Track Shipment
            </Link>
            <button onClick={() => setResult(null)} className="btn-secondary rounded-xl">
              Create Another <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="container-app py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Send className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create New Shipment</h1>
          <p className="mt-2 text-slate-500">Fill in the details below to book a new delivery.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8 animate-fade-in-up-delay-1">
          {/* Sender / Receiver side-by-side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender */}
            <div className="card p-6 space-y-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><User className="w-4 h-4" /></div>
                Sender Details
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
                <input
                  id="sender-name" className={`input-field ${errors.senderName ? 'border-red-400' : ''}`}
                  placeholder="John Doe" value={form.senderName} onChange={set('senderName')}
                />
                <FieldError msg={errors.senderName} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Address</label>
                <input
                  id="sender-address" className={`input-field ${errors.senderAddress ? 'border-red-400' : ''}`}
                  placeholder="123 Street, City" value={form.senderAddress} onChange={set('senderAddress')}
                />
                <FieldError msg={errors.senderAddress} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <div className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-medium pointer-events-none pr-1.5 border-r border-slate-200">
                    +91
                  </div>
                  <input
                    id="sender-phone" type="tel" maxLength={10}
                    className={`input-field pl-[4.5rem] ${errors.senderPhone ? 'border-red-400' : ''}`}
                    placeholder="9876543210" value={form.senderPhone} 
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, senderPhone: e.target.value.replace(/\D/g, '') }));
                      setErrors((prev) => ({ ...prev, senderPhone: '' }));
                    }}
                  />
                </div>
                <FieldError msg={errors.senderPhone} />
              </div>
            </div>

            {/* Receiver */}
            <div className="card p-6 space-y-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
                Receiver Details
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
                <input
                  id="receiver-name" className={`input-field ${errors.receiverName ? 'border-red-400' : ''}`}
                  placeholder="Jane Smith" value={form.receiverName} onChange={set('receiverName')}
                />
                <FieldError msg={errors.receiverName} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Address</label>
                <input
                  id="receiver-address" className={`input-field ${errors.receiverAddress ? 'border-red-400' : ''}`}
                  placeholder="456 Avenue, City" value={form.receiverAddress} onChange={set('receiverAddress')}
                />
                <FieldError msg={errors.receiverAddress} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <div className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-medium pointer-events-none pr-1.5 border-r border-slate-200">
                    +91
                  </div>
                  <input
                    id="receiver-phone" type="tel" maxLength={10}
                    className={`input-field pl-[4.5rem] ${errors.receiverPhone ? 'border-red-400' : ''}`}
                    placeholder="9876543210" value={form.receiverPhone} 
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, receiverPhone: e.target.value.replace(/\D/g, '') }));
                      setErrors((prev) => ({ ...prev, receiverPhone: '' }));
                    }}
                  />
                </div>
                <FieldError msg={errors.receiverPhone} />
              </div>
            </div>
          </div>

          {/* Package Details + Price Preview */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center"><Package className="w-4 h-4" /></div>
              Package Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="weight-input" type="number" step="0.1" min="0.1"
                    className={`input-field pl-10 ${errors.weight ? 'border-red-400' : ''}`}
                    placeholder="2.5" value={form.weight} onChange={set('weight')}
                  />
                </div>
                <FieldError msg={errors.weight} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Distance (km)</label>
                <div className="relative">
                  <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="distance-input" type="number" step="1" min="1"
                    className={`input-field pl-10 ${errors.distance ? 'border-red-400' : ''}`}
                    placeholder="150" value={form.distance} onChange={set('distance')}
                  />
                </div>
                <FieldError msg={errors.distance} />
              </div>
            </div>

            {/* Live Price Preview */}
            {livePrice !== null && (
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-slate-700">Estimated Price</span>
                </div>
                <span className="text-2xl font-bold text-primary-700">₹{livePrice}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            id="submit-shipment"
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 rounded-2xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
            ) : (
              <><Send className="w-5 h-5" /> Create Shipment</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
