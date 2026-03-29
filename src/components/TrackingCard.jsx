import { CheckCircle2, Circle, Clock, MapPin, Phone, User, Weight, DollarSign, Truck } from 'lucide-react';

const STATUSES = ['Pending', 'Dispatched', 'In-Transit', 'Out for Delivery', 'Delivered'];

const STATUS_META = {
  Pending:            { color: 'text-amber-600',   bg: 'bg-amber-500',   ring: 'ring-amber-200',   bgLight: 'bg-amber-50' },
  Dispatched:         { color: 'text-blue-600',     bg: 'bg-blue-500',    ring: 'ring-blue-200',    bgLight: 'bg-blue-50' },
  'In-Transit':       { color: 'text-indigo-600',   bg: 'bg-indigo-500',  ring: 'ring-indigo-200',  bgLight: 'bg-indigo-50' },
  'Out for Delivery': { color: 'text-violet-600',   bg: 'bg-violet-500',  ring: 'ring-violet-200',  bgLight: 'bg-violet-50' },
  Delivered:          { color: 'text-emerald-600',  bg: 'bg-emerald-500', ring: 'ring-emerald-200', bgLight: 'bg-emerald-50' },
};

export default function TrackingCard({ shipment }) {
  const currentIdx = STATUSES.indexOf(shipment.currentStatus);

  // Find the timestamp from statusHistory for each completed status
  const getTimestamp = (status) => {
    const entry = [...(shipment.statusHistory || [])].reverse().find((h) => h.status === status);
    return entry ? new Date(entry.timestamp).toLocaleString() : null;
  };

  return (
    <div className="card p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">Tracking ID</p>
          <p className="text-xl font-bold font-mono tracking-widest text-primary-600">{shipment.trackingId}</p>
        </div>
        <div className={`badge ${STATUS_META[shipment.currentStatus]?.bgLight} ${STATUS_META[shipment.currentStatus]?.color} border border-current/20 text-sm px-4 py-1.5`}>
          {shipment.currentStatus}
        </div>
      </div>

      {/* ====== VISUAL STEPPER ====== */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-primary-500 to-violet-500 -z-0 transition-all duration-700"
            style={{ width: `calc(${(currentIdx / (STATUSES.length - 1)) * 100}% - 40px)` }}
          />

          {STATUSES.map((status, idx) => {
            const done = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const meta = STATUS_META[status];
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
                {done && getTimestamp(status) && (
                  <p className="mt-0.5 text-[9px] text-slate-400 text-center hidden sm:block">
                    {getTimestamp(status)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== DETAILS GRID ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sender */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" /> Sender
          </p>
          <p className="font-semibold text-slate-800">{shipment.sender.name}</p>
          <p className="text-sm text-slate-500 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{shipment.sender.address}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{shipment.sender.phone}</p>
        </div>

        {/* Receiver */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" /> Receiver
          </p>
          <p className="font-semibold text-slate-800">{shipment.receiver.name}</p>
          <p className="text-sm text-slate-500 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />{shipment.receiver.address}</p>
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
          <DollarSign className="w-4 h-4 text-emerald-600" />
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
