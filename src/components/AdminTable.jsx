import { useState, memo } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { ChevronDown, Loader2, Trash2, ShieldPlus, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Pending', 'Dispatched', 'In-Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending:            'bg-amber-50 text-amber-700 border-amber-200',
  Dispatched:         'bg-blue-50 text-blue-700 border-blue-200',
  'In-Transit':       'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Out for Delivery': 'bg-violet-50 text-violet-700 border-violet-200',
  Delivered:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:          'bg-red-50 text-red-700 border-red-200',
};

// Default admin credentials — change these or move to .env before production
const DEFAULT_ADMIN = {
  username: 'david123',
  password: 'david0987',
  role: 'admin',
};

export default memo(function AdminTable({ shipments, onRefresh }) {
  const [updatingId,    setUpdatingId]    = useState(null);
  const [deletingId,    setDeletingId]    = useState(null);
  const [cancellingId,  setCancellingId]  = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── Status update ──────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/shipments/${id}/status`, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete shipment ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/shipments/${id}`);
      toast.success('Shipment deleted');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Cancel shipment ─────────────────────────────────────────────────────────
  const handleCancel = async (trackingId) => {
    if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
    setCancellingId(trackingId);
    try {
      await api.patch(`/shipments/${trackingId}/cancel`);
      toast.success('Shipment cancelled successfully');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };



  // ── Empty state ────────────────────────────────────────────────────────────
  if (!shipments.length) {
    return (
      <div className="card p-12 text-center space-y-4">
        <p className="text-slate-400 text-sm">No shipments found.</p>


      </div>
    );
  }

  // ── Main table ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">


      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Tracking ID</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Sender</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Receiver</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Weight</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Payment</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Tracking ID */}
                  <td className="px-5 py-4 font-mono font-semibold text-primary-600 tracking-wider text-xs">
                    {s.trackingId}
                  </td>

                  {/* Sender */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{s.sender.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px] mb-1">{s.sender.address}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Created by: {typeof s.userId === 'object' && s.userId !== null ? (s.userId.name || s.userId._id) : (s.userId || 'Guest')}
                    </p>
                  </td>

                  {/* Receiver */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{s.receiver.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{s.receiver.address}</p>
                  </td>

                  {/* Weight */}
                  <td className="px-5 py-4 text-slate-600">{s.weight} kg</td>

                  {/* Price */}
                  <td className="px-5 py-4 font-semibold text-slate-800">₹{s.price}</td>

                  {/* Payment */}
                  <td className="px-5 py-4">
                    <p className={`text-xs font-bold ${s.paymentMethod === 'UPI' ? 'text-primary-600' : 'text-slate-600'}`}>
                      {s.paymentMethod}
                    </p>
                    {s.upiId && <p className="text-[10px] text-slate-400 font-mono">{s.upiId}</p>}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {isAdmin ? (
                      <div className="relative">
                        {updatingId === s._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        ) : (
                          <div className="relative inline-block">
                            <select
                              id={`status-select-${s._id}`}
                              value={s.currentStatus}
                              onChange={(e) => handleStatusChange(s._id, e.target.value)}
                              className={`appearance-none pr-8 pl-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer outline-none ${STATUS_COLORS[s.currentStatus]}`}
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${STATUS_COLORS[s.currentStatus]}`}>
                        {s.currentStatus}
                      </span>
                    )}
                  </td>

                  {/* Actions — Cancel + Delete */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {s.currentStatus === 'Pending' && (
                        <button
                          onClick={() => handleCancel(s.trackingId)}
                          disabled={cancellingId === s.trackingId}
                          className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors border border-red-200 flex items-center gap-1"
                          title="Cancel shipment"
                        >
                          {cancellingId === s.trackingId
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Ban className="w-3.5 h-3.5" />}
                          Cancel
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          id={`delete-${s._id}`}
                          onClick={() => handleDelete(s._id)}
                          disabled={deletingId === s._id}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete shipment"
                        >
                          {deletingId === s._id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
