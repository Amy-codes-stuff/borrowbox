import React, { useState } from 'react';
import { X, Send, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createRequest } from '../services/api';
import { useUser } from '../context/UserContext';

export default function BorrowModal({ item, isOpen, onClose, onRequestSuccess }) {
  const { currentUser } = useUser();
  const [requestedDuration, setRequestedDuration] = useState('3 days');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const isOwner = currentUser?._id === item.owner?._id || currentUser?._id === item.owner;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createRequest({
        itemId: item._id,
        requestedDuration,
        message,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onRequestSuccess) onRequestSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit borrowing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-lg">Request to Borrow</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
              <h4 className="text-xl font-bold text-slate-900 mb-1">Request Submitted!</h4>
              <p className="text-sm text-slate-600">
                {item.owner?.name || 'Item owner'} will receive your borrow request.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Item Card Summary */}
              <div className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500">Listed by {item.owner?.name}</p>
                  <p className="text-xs font-semibold text-brand-600 mt-0.5">
                    Max Duration: {item.maxLendingDuration || '7 days'}
                  </p>
                </div>
              </div>

              {/* Owner restriction check */}
              {isOwner && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2 border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>You are the owner of this item. Switch demo user in header to test requesting.</span>
                </div>
              )}

              {/* Error alert */}
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Duration picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  Requested Duration
                </label>
                <select
                  value={requestedDuration}
                  onChange={(e) => setRequestedDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium bg-white"
                  required
                >
                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                  <option value="3 days">3 days</option>
                  <option value="5 days">5 days</option>
                  <option value="7 days">7 days (1 week)</option>
                  <option value="14 days">14 days (2 weeks)</option>
                </select>
              </div>

              {/* Note / Message to owner */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  Message to Owner (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey, I need this for my upcoming practical exam on Thursday..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || isOwner}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-600/20 flex items-center space-x-2 transition-all"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
