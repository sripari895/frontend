import React, { useState, useEffect } from 'react';
import { submitSupportTicket, getMySupportTickets } from '../api';
import { toast } from 'react-hot-toast';
import { Send, History, MessageSquare, Clock, CheckCircle, Info } from 'lucide-react';

const SupportForm = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Delay',
    trackingId: '',
    message: '',
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await getMySupportTickets();
      setTickets(data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitSupportTicket(formData);
      toast.success('Support ticket submitted successfully!');
      setFormData({ subject: '', category: 'Delay', trackingId: '', message: '' });
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In-Progress': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Contact Support</h2>
            <p className="text-slate-500 mb-8 font-medium">Submit a ticket and we'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Delay">Delivery Delay</option>
                  <option value="Damage">Package Damage</option>
                  <option value="Billing">Billing & Payments</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tracking ID (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="EX: SW-XXXXXX"
                  value={formData.trackingId}
                  onChange={(e) => setFormData({ ...formData, trackingId: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
              >
                {loading ? 'Submitting...' : 'Send Message'}
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Tickets History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <History className="w-6 h-6 text-blue-600" />
                Ticket History
              </h2>
              <div className="px-4 py-1.5 bg-slate-100 rounded-full text-sm font-bold text-slate-600">
                {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
              </div>
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium tracking-wide">Loading your cases...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="border border-slate-100 rounded-2xl p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className="text-sm text-slate-400 font-medium">#{ticket._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{ticket.subject}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">{ticket.message}</p>
                        
                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Info className="w-4 h-4" />
                            {ticket.category}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          {ticket.trackingId && (
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {ticket.trackingId}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {ticket.replies.length > 0 && (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">You haven't submitted any support requests yet. Use the form to start a conversation.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportForm;
