import React, { useState, useEffect } from 'react';
import { getAllSupportTickets, updateSupportTicketStatus, replyToSupportTicket } from '../api';
import { toast } from 'react-hot-toast';
import { MessageSquare, CheckCircle, Clock, Filter, Search, User, Mail, Send, ChevronDown, ChevronUp } from 'lucide-react';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await getAllSupportTickets();
      setTickets(data.data);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateSupportTicketStatus(id, status);
      toast.success(`Ticket marked as ${status}`);
      fetchTickets();
      if (activeTicket?._id === id) {
        setActiveTicket({ ...activeTicket, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await replyToSupportTicket(activeTicket._id, reply);
      toast.success('Reply sent');
      setReply('');
      fetchTickets();
      // Update local state for immediate feedback
      const updatedTicket = { ...activeTicket };
      updatedTicket.replies.push({
        message: reply,
        isAdmin: true,
        createdAt: new Date(),
        user: { name: 'Admin' } // Simplified
      });
      setActiveTicket(updatedTicket);
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.trackingId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In-Progress': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support Management</h1>
            <p className="text-slate-500 font-medium">Manage and respond to customer tickets efficiently.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In-Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ticket List */}
          <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading tickets...</p>
              </div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <div
                  key={ticket._id}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    activeTicket?._id === ticket._id 
                      ? 'bg-white border-blue-500 ring-2 ring-blue-50 ring-offset-0 shadow-lg' 
                      : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                  onClick={() => setActiveTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 truncate">{ticket.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">{ticket.userId?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg text-slate-500 font-bold tracking-widest uppercase">
                      {ticket.category}
                    </span>
                    {ticket.replies.length > 0 && (
                      <span className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ticket.replies.length} replies
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No tickets found.</p>
              </div>
            )}
          </div>

          {/* Ticket Detail & Chat */}
          <div className="lg:col-span-7">
            {activeTicket ? (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col h-[calc(100vh-200px)]">
                {/* Header */}
                <div className="p-8 border-b border-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{activeTicket.subject}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(activeTicket.status)}`}>
                          {activeTicket.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium">
                          <User className="w-4 h-4 text-slate-400" />
                          {activeTicket.userId?.name} ({activeTicket.userId?.email})
                        </span>
                        {activeTicket.trackingId && (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg font-bold text-xs">
                            TRACKING: {activeTicket.trackingId}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {activeTicket.status !== 'Resolved' && (
                        <button
                          onClick={() => handleStatusUpdate(activeTicket._id, 'Resolved')}
                          className="p-2.5 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm shadow-emerald-50"
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {activeTicket.status === 'Open' && (
                        <button
                          onClick={() => handleStatusUpdate(activeTicket._id, 'In-Progress')}
                          className="p-2.5 text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors shadow-sm shadow-amber-50"
                          title="Mark as In-Progress"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                  {/* Initial Message */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-500 font-bold uppercase border-2 border-white shadow-sm">
                      {activeTicket.userId?.name?.[0] || 'U'}
                    </div>
                    <div className="max-w-[80%]">
                      <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{activeTicket.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold mt-2 inline-block px-1 uppercase tracking-widest">
                        Customer Request • {new Date(activeTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Replies */}
                  {activeTicket.replies.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold uppercase border-2 border-white shadow-sm ${
                        msg.isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {msg.isAdmin ? 'A' : (activeTicket.userId?.name?.[0] || 'U')}
                      </div>
                      <div className={`max-w-[80%] ${msg.isAdmin ? 'text-right' : ''}`}>
                        <div className={`p-6 rounded-2xl shadow-sm border ${
                          msg.isAdmin 
                            ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                            : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold mt-2 inline-block px-1 uppercase tracking-widest">
                          {msg.isAdmin ? 'System Reply' : 'Customer Reply'} • {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-slate-50">
                  <form onSubmit={handleReply} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <textarea
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                        rows="2"
                        placeholder="Type your response here..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={!reply.trim()}
                      className="p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none group"
                    >
                      <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm text-center p-12">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Ticket Selected</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Select a ticket from the left sidebar to view details and respond to the customer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
