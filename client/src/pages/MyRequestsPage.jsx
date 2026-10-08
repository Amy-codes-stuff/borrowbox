import React, { useState, useEffect } from 'react';
import { fetchRequests, updateRequestStatus } from '../services/api';
import { useUser } from '../context/UserContext';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  MessageSquare,
  Calendar,
  Send,
  Inbox
} from 'lucide-react';

export default function MyRequestsPage() {
  const { currentUser } = useUser();
  const [tab, setTab] = useState('received'); // 'received' | 'sent'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadRequests = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetchRequests({ role: tab });
      setRequests(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch borrowing requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    const handleUserChange = () => loadRequests();
    window.addEventListener('demouserchange', handleUserChange);
    return () => window.removeEventListener('demouserchange', handleUserChange);
  }, [currentUser, tab]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setActionLoading(requestId);
      await updateRequestStatus(requestId, newStatus);
      // Reload request list & trigger global event if needed
      await loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update request status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending px-3 py-1 rounded-full text-xs font-bold">Pending Review</span>;
      case 'approved':
        return <span className="badge-approved px-3 py-1 rounded-full text-xs font-bold">Approved / Active Borrow</span>;
      case 'returned':
        return <span className="badge-returned px-3 py-1 rounded-full text-xs font-bold">Returned & Completed</span>;
      case 'rejected':
        return <span className="badge-rejected px-3 py-1 rounded-full text-xs font-bold">Rejected</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-brand-600" />
            <span>Borrowing Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage incoming requests for your items or track requests you sent to others.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center text-xs font-bold">
          <button
            onClick={() => setTab('received')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              tab === 'received' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4 text-brand-600" />
            <span>Incoming Requests</span>
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              tab === 'sent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4 text-brand-600" />
            <span>My Borrowing Requests</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-shimmer"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {tab === 'received' ? 'No incoming requests' : 'No borrowing requests sent'}
          </h3>
          <p className="text-xs text-slate-500">
            {tab === 'received'
              ? 'No fellow student has requested your listed items yet.'
              : 'You haven’t requested to borrow any items yet. Browse items on Explore page!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const item = req.item;
            const otherUser = tab === 'received' ? req.requester : req.owner;
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-brand-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                
                {/* Left: Item & User Info */}
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={item?.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
                    alt={item?.name || 'Item'}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 ring-1 ring-slate-200"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {item?.name || 'Item Listing'}
                      </h3>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 mb-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-brand-600" />
                        {tab === 'received' ? `Requester: ${otherUser?.name}` : `Owner: ${otherUser?.name}`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Duration: {req.requestedDuration}
                      </span>
                    </div>

                    {req.message && (
                      <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1 max-w-xl">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="italic truncate font-medium">&quot;{req.message}&quot;</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                  
                  {/* Incoming Requests Actions (as Owner) */}
                  {tab === 'received' && isPending && (
                    <>
                      <button
                        onClick={() => handleStatusChange(req._id, 'approved')}
                        disabled={actionLoading === req._id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center space-x-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(req._id, 'rejected')}
                        disabled={actionLoading === req._id}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 border border-rose-200 flex items-center space-x-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Return Action (for approved active borrows) */}
                  {isApproved && (
                    <button
                      onClick={() => handleStatusChange(req._id, 'returned')}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center space-x-1.5 shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4 text-brand-400" />
                      <span>Mark Returned</span>
                    </button>
                  )}

                  {/* Outgoing Requests Actions (as Requester) */}
                  {tab === 'sent' && isPending && (
                    <button
                      onClick={() => handleStatusChange(req._id, 'cancelled')}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                    >
                      Cancel Request
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
