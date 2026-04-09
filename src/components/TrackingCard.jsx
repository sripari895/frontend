import { useState, useMemo, memo } from 'react';
import { CheckCircle2, Circle, Clock, MapPin, Phone, User, Weight, IndianRupee, Truck, Ban } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Dispatched', 'In-Transit', 'Out for Delivery', 'Delivered'];

const STATUS_META = {
  Pending:            { color: 'text-amber-600',   bg: 'bg-amber-500',   ring: 'ring-amber-200',   bgLight: 'bg-amber-50' },
  Dispatched:         { color: 'text-blue-600',     bg: 'bg-blue-500',    ring: 'ring-blue-200',    bgLight: 'bg-blue-50' },
  'In-Transit':       { color: 'text-indigo-600',   bg: 'bg-indigo-500',  ring: 'ring-indigo-200',  bgLight: 'bg-indigo-50' },
  'Out for Delivery': { color: 'text-violet-600',   bg: 'bg-violet-500',  ring: 'ring-violet-200',  bgLight: 'bg-violet-50' },
  Delivered:          { color: 'text-emerald-600',  bg: 'bg-emerald-500', ring: 'ring-emerald-200', bgLight: 'bg-emerald-50' },
};

function TrackingCard({ shipment: initialShipment }) {
  const [shipment, setShipment] = useState(initialShipment);
  const [cancelling, setCancelling] = useState(false);
  const currentIdx = STATUSES.indexOf(shipment.currentStatus);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this shipment?")) return;
    setCancelling(true);
    try {
      const { data } = await api.patch(`/shipments/${shipment.trackingId}/cancel`);
      setShipment(data.data);
      toast.success('Shipment cancelled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel shipment');
    } finally {
      setCancelling(false);
    }
  };

  // Pre-compute timestamp map once instead of searching on every render call
  const timestampMap = useMemo(() => {
    const map = {};
    const history = shipment.statusHistory || [];
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      if (!map[entry.status]) {
        map[entry.status] = new Date(entry.timestamp).toLocaleString();
      }
    }
    return map;
  }, [shipment.statusHistory]);

  return (
    <div className="card p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Tracking ID</p>
          <p className="text-xl font-bold font-mono tracking-widest text-primary-600">{shipment.trackingId}</p>
        </div>
        <div className="flex items-center gap-3">
          {shipment.currentStatus === 'Pending' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors border border-red-200"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Shipment'}
            </button>
          )}
          <div className={`badge ${STATUS_META[shipment.currentStatus]?.bgLight || 'bg-red-50'} ${STATUS_META[shipment.currentStatus]?.color || 'text-red-600'} border border-current/20 text-sm px-4 py-1.5`}>
            {shipment.currentStatus}
          </div>
        </div>
      </div>

      {/* ====== VISUAL STEPPER ====== */}
      {shipment.currentStatus === 'Cancelled' ? (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Ban className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-red-800 font-semibold">Shipment Cancelled</p>
            <p className="text-red-600 text-xs">This shipment has been cancelled by the user and will not be delivered.</p>
          </div>
        </div>
      ) : (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-primary-500 to-violet-500 -z-0 transition-all duration-700"
            style={{ width: `calc(${(Math.max(0, currentIdx) / (STATUSES.length - 1)) * 100}% - 40px)` }}
          />

          {STATUSES.map((status, idx) => {
            const done = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const meta = STATUS_META[status];
            const ts = timestampMap[status];
            return (
              <div key={status} className="relative flex flex-col items-center z-10" style={{ flex: 1 }}>
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${done
                      ? `${meta.bg} border-transparent text-white shadow-lg ${isCurrent ? 'animate-pulse-glow ring-4 ' + meta.ring : ''}`
                      : 'bg-white border-slate-200 text-slate-400'
                    }`}
                >
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                {/* Label */}
                <p className={`mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight ${done ? meta.color : 'text-slate-400'}`}>
                  {status}
                </p>
                {/* Timestamp */}
                {done && ts && (
                  <p className="mt-0.5 text-[9px] text-slate-400 text-center hidden sm:block">
                    {ts}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* ====== DETAILS GRID ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" /> Sender
          </p>
          <p className="font-semibold text-slate-800">{shipment.sender.name}</p>
          <p className="text-sm text-slate-500 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{shipment.sender.address} - {shipment.sender.pincode}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{shipment.sender.phone}</p>
        </div>

        {/* Receiver */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" /> Receiver
          </p>
          <p className="font-semibold text-slate-800">{shipment.receiver.name}</p>
          <p className="text-sm text-slate-500 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{shipment.receiver.address} - {shipment.receiver.pincode}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{shipment.receiver.phone}</p>
        </div>
      </div>

      {/* Package stats ribbon */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-100">
          <Weight className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">{shipment.weight} kg</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100">
          <MapPin className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-700">{shipment.distance} km</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">₹{shipment.price}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">{new Date(shipment.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(TrackingCard);
