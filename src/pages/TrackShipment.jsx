import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, PackageSearch, Loader2, AlertCircle } from 'lucide-react';
import TrackingCard from '../components/TrackingCard';

export default function TrackShipment() {
  const { trackingId: paramId } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState(paramId || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchShipment = async (id) => {
    if (!id?.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    setSearched(true);

    try {
      const { data } = await api.get(`/shipments/${id.trim().toUpperCase()}`);
      setShipment(data.data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Shipment not found. Check your tracking ID.' : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) {
      setInput(paramId);
      fetchShipment(paramId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      navigate(`/track/${input.trim().toUpperCase()}`, { replace: true });
    }
  };

  return (
    <div className="container-app py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <PackageSearch className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Track Your Shipment</h1>
          <p className="mt-2 text-slate-500">Enter your tracking ID to see real-time status updates.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="mb-10 animate-fade-in-up-delay-1">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="track-input"
                type="text"
                placeholder="e.g. AB12CD34EF"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input-field pl-12 py-4 text-base"
              />
            </div>
            <button id="track-submit" type="submit" className="btn-primary px-8 rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Looking up shipment…</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-5 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {shipment && <TrackingCard shipment={shipment} />}

        {searched && !loading && !error && !shipment && null}
      </div>
    </div>
  );
}
