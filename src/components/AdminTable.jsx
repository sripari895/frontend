import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { ChevronDown, Loader2, Trash2, ShieldPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['Pending', 'Dispatched', 'In-Transit', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  Pending:            'bg-amber-50 text-amber-700 border-amber-200',
  Dispatched:         'bg-blue-50 text-blue-700 border-blue-200',
  'In-Transit':       'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Out for Delivery': 'bg-violet-50 text-violet-700 border-violet-200',
  Delivered:          'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// Default admin credentials — change these or move to .env before production
const DEFAULT_ADMIN = {
  username: 'david123',
  password: 'david0987',
  role: 'admin',
};

export default function AdminTable({ shipments, onRefresh }) {
  const [updatingId,    setUpdatingId]    = useState(null);
  const [deletingId,    setDeletingId]    = useState(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

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

  // ── Create default admin account ───────────────────────────────────────────
  // Calls POST /auth/register (or /users — adjust the path to match your API).
  // The backend should reject duplicate usernames gracefully.
  const handleCreateAdmin = async () => {
    if (
      !window.confirm(
        `Create admin account?\n\nUsername : ${DEFAULT_ADMIN.username}\nPassword : ${DEFAULT_ADMIN.password}\n\nStore these credentials somewhere safe.`
      )
    ) return;

    setCreatingAdmin(true);
    try {
      await api.post('/auth/register', DEFAULT_ADMIN);
      toast.success(
        `Admin "${DEFAULT_ADMIN.username}" created! Password: ${DEFAULT_ADMIN.password}`,
        { duration: 6000 }
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin creation failed';
      // Treat "already exists" as a soft warning, not a hard error
      if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('duplicate')) {
        toast(`Admin "${DEFAULT_ADMIN.username}" already exists.`, { icon: 'ℹ️' });
      } else {
        toast.error(msg);
      }
    } finally {
      setCreatingAdmin(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!shipments.length) {
    return (
      <div className="card p-12 text-center space-y-4">
        <p className="text-slate-400 text-sm">No shipments found.</p>

        {/* Show "Create Admin" even when table is empty so you can bootstrap */}
        {isAdmin && (
          <button
            onClick={handleCreateAdmin}
            disabled={creatingAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {creatingAdmin
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ShieldPlus className="w-4 h-4" />}
            Create Admin Account
          </button>
        )}
      </div>
    );
  }

  // ── Main table ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Admin-only toolbar */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={handleCreateAdmin}
            disabled={creatingAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {creatingAdmin
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ShieldPlus className="w-4 h-4" />}
            Create Admin Account
          </button>
        </div>
      )}

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
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                {isAdmin && (
                  <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                )}
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
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{s.sender.address}</p>
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

                  {/* Delete action */}
                  {isAdmin && (
                    <td className="px-5 py-4">
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
