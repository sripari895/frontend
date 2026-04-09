import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  User, MapPin, Phone, Weight, Ruler, Send, CheckCircle2,
  Package, ArrowRight, Loader2, AlertCircle, IndianRupee, CreditCard, Smartphone, Banknote,
  ExternalLink, Clock, Calendar,
} from 'lucide-react';

// Match backend price calculation exactly
function calculatePrice(weight, distance) {
  const baseCost = 20;
  const weightFactor = weight * 5;
  const distanceFactor = distance * 5;
  return Math.round((baseCost + weightFactor + distanceFactor) * 100) / 100;
}

const PHONE_RE = /^\+91\s?\d{10}$/;
const NAME_RE = /^.{2,}$/;

const INITIAL_FORM = {
  senderName: '', senderAddress: '', senderPhone: '', senderPincode: '',
  receiverName: '', receiverAddress: '', receiverPhone: '', receiverPincode: '',
  weight: '', distance: '',
  preferredDate: '', preferredTime: '',
  paymentMethod: 'Cash',
};

const UPI_ID_RE = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}$/;

// Generate UPI deep link for Google Pay / UPI apps
function generateUpiLink(upiId, amount, trackingId) {
  const params = new URLSearchParams({
    pa: upiId,                        // Payee VPA
    pn: 'SwiftShip Logistics',        // Payee name
    am: String(amount),               // Amount
    cu: 'INR',                        // Currency
    tn: `Shipment ${trackingId}`,     // Transaction note
    tr: trackingId,                   // Transaction ref
  });
  return `upi://pay?${params.toString()}`;
}

function validateForm(form) {
  const errors = {};
  if (!NAME_RE.test(form.senderName.trim()))
    errors.senderName = 'Name must be at least 2 characters.';
  if (!form.senderAddress.trim())
    errors.senderAddress = 'Address is required.';
  if (form.senderPhone.length !== 10)
    errors.senderPhone = 'Enter exactly 10 digits.';

  const PINCODE_RE = /^(110|121|122|201)\d{3}$/;
  if (!form.senderPincode || !PINCODE_RE.test(form.senderPincode.trim()))
    errors.senderPincode = 'Must be Delhi/NCR pincode (110, 121, 122, 201).';

  if (!NAME_RE.test(form.receiverName.trim()))
    errors.receiverName = 'Name must be at least 2 characters.';
  if (!form.receiverAddress.trim())
    errors.receiverAddress = 'Address is required.';
  if (form.receiverPhone.length !== 10)
    errors.receiverPhone = 'Enter exactly 10 digits.';

  if (!form.receiverPincode || !PINCODE_RE.test(form.receiverPincode.trim()))
    errors.receiverPincode = 'Must be Delhi/NCR pincode (110, 121, 122, 201).';

  if (!form.preferredDate) {
    errors.preferredDate = 'Please select a preferred date.';
  } else {
    const selectedDate = new Date(form.preferredDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) {
      errors.preferredDate = 'Please select a valid date.';
    } else if (selectedDate < today) {
      errors.preferredDate = 'Date cannot be in the past.';
    }
  }
  
  if (!form.preferredTime) errors.preferredTime = 'Please select a preferred time.';

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

  const set = useCallback(
    (field) => (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    },
    []
  );

  const livePrice = useMemo(
    () =>
      Number(form.weight) > 0 && Number(form.distance) > 0
        ? calculatePrice(Number(form.weight), Number(form.distance))
        : null,
    [form.weight, form.distance]
  );

  const estimatedDelivery = useMemo(() => {
    const d = Number(form.distance);
    if (d > 0) {
      return d <= 5 ? "30 mins" : "60 mins or above";
    }
    return null;
  }, [form.distance]);

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
        sender: { name: form.senderName, address: form.senderAddress, phone: `+91${form.senderPhone}`, pincode: form.senderPincode },
        receiver: { name: form.receiverName, address: form.receiverAddress, phone: `+91${form.receiverPhone}`, pincode: form.receiverPincode },
        weight: Number(form.weight),
        distance: Number(form.distance),
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        paymentMethod: form.paymentMethod,
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
    const upiPayLink = result.paymentMethod === 'UPI' && result.upiId
      ? generateUpiLink(result.upiId, result.price, result.trackingId)
      : null;

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
              <span className="text-sm text-slate-500">Payment</span>
              <span className="text-sm font-semibold text-slate-900">{result.paymentMethod === 'Cash' || result.paymentMethod === 'COD' ? 'Pay on Delivery (COD)' : result.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200">{result.currentStatus}</span>
            </div>
            {result.estimatedDeliveryTime && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-medium text-blue-700">Estimated Time</span>
                <span className="text-sm font-bold text-blue-800 text-right">
                  {result.estimatedDeliveryTime}
                </span>
              </div>
            )}
          </div>    {/* ── UPI Payment Details removed for COD ── */}

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
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Delhi NCR Pincode</label>
                <input
                  id="sender-pincode" type="text" maxLength={6}
                  className={`input-field ${errors.senderPincode ? 'border-red-400' : ''}`}
                  placeholder="e.g. 110001" value={form.senderPincode} 
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, senderPincode: e.target.value.replace(/\D/g, '') }));
                    setErrors((prev) => ({ ...prev, senderPincode: '' }));
                  }}
                />
                <FieldError msg={errors.senderPincode} />
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
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Delhi NCR Pincode</label>
                <input
                  id="receiver-pincode" type="text" maxLength={6}
                  className={`input-field ${errors.receiverPincode ? 'border-red-400' : ''}`}
                  placeholder="e.g. 201301" value={form.receiverPincode} 
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, receiverPincode: e.target.value.replace(/\D/g, '') }));
                    setErrors((prev) => ({ ...prev, receiverPincode: '' }));
                  }}
                />
                <FieldError msg={errors.receiverPincode} />
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
              <div className="mt-7 space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-slate-700">Estimated Price</span>
                  </div>
                  <span className="text-2xl font-bold text-primary-700">₹{livePrice}</span>
                </div>
                {estimatedDelivery && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">Estimated Time</span>
                    </div>
                    <span className="text-base font-bold text-blue-800 text-right">{estimatedDelivery}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Preferences */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
              Delivery Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Preferred Date</label>
                <input
                  id="preferred-date" type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`input-field ${errors.preferredDate ? 'border-red-400' : ''}`}
                  value={form.preferredDate} onChange={set('preferredDate')}
                />
                <FieldError msg={errors.preferredDate} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Preferred Time</label>
                <input
                  id="preferred-time" type="time"
                  className={`input-field ${errors.preferredTime ? 'border-red-400' : ''}`}
                  value={form.preferredTime} onChange={set('preferredTime')}
                />
                <FieldError msg={errors.preferredTime} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><CreditCard className="w-4 h-4" /></div>
              Payment Method
            </h3>
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
              <p className="text-sm font-semibold text-orange-800">Pay on Delivery (COD)</p>
              <p className="text-xs text-orange-700 mt-1">You will have to pay at the time of delivery. You can pay using UPI, Cash, and all other methods of payment.</p>
            </div>
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
