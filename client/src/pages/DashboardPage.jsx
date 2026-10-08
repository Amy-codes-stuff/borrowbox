import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../services/api';
import { useUser } from '../context/UserContext';
import {
  BarChart3,
  Package,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  PlusCircle,
  Search,
  Activity,
  User,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetchDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const handleUserChange = () => loadDashboard();
    window.addEventListener('demouserchange', handleUserChange);
    return () => window.removeEventListener('demouserchange', handleUserChange);
  }, [currentUser]);

  const stats = data?.stats || {
    itemsListed: 0,
    activeBorrows: 0,
    pendingRequests: 0,
    itemsLent: 0,
    completedBorrows: 0,
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <BarChart3 className="w-64 h-64 text-brand-400" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Welcome back, {currentUser?.name || 'Student'}!
              </h1>
              <p className="text-xs text-brand-300 font-medium">
                {currentUser?.department} • Campus Sharing Activity Dashboard
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
            Track your campus lending metrics, current active borrows, incoming peer requests, and activity history.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Statistics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Items Listed</span>
            <Package className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.itemsListed}</div>
          <span className="text-[10px] text-slate-400 mt-1">Listed for campus lending</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Borrows</span>
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.activeBorrows}</div>
          <span className="text-[10px] text-slate-400 mt-1">Items currently borrowed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pendingRequests}</div>
          <span className="text-[10px] text-slate-400 mt-1">Awaiting review/approval</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Items Lent</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600">{stats.itemsLent}</div>
          <span className="text-[10px] text-slate-400 mt-1">Shared with peers</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.completedBorrows}</div>
          <span className="text-[10px] text-slate-400 mt-1">Returned borrows</span>
        </div>

      </div>

      {/* Quick Actions & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left: Quick Actions & Active Borrows (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Actions Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/items/new"
                className="p-4 rounded-2xl bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-colors flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">List an Item</h4>
                  <p className="text-[11px] text-slate-500">Lend books/tools</p>
                </div>
              </Link>

              <Link
                to="/"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Explore Catalog</h4>
                  <p className="text-[11px] text-slate-500">Find campus items</p>
                </div>
              </Link>

              <Link
                to="/requests"
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 transition-colors flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">View Requests</h4>
                  <p className="text-[11px] text-slate-500">Approvals & status</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Current Active Borrows */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-brand-600" />
                Current Active Borrows
              </h3>
              <Link to="/requests" className="text-xs font-semibold text-brand-600 hover:underline">
                Manage all
              </Link>
            </div>

            {loading ? (
              <div className="h-20 bg-slate-100 rounded-2xl animate-shimmer"></div>
            ) : !data?.currentBorrows || data.currentBorrows.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No active borrowed items right now.
              </div>
            ) : (
              <div className="space-y-3">
                {data.currentBorrows.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={b.item?.imageUrl}
                        alt={b.item?.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{b.item?.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Borrowed from <span className="font-semibold">{b.owner?.name}</span> • Duration: {b.requestedDuration}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/requests"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Recent Activity Timeline (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-600" />
              Recent Activity
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl animate-shimmer"></div>
                ))}
              </div>
            ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent activity recorded.</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((act) => (
                  <div key={act._id} className="flex items-start space-x-3 text-xs border-b border-slate-100 pb-3 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 line-clamp-1">
                        {act.item?.name || 'Item'}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Status: <span className="font-bold capitalize text-brand-600">{act.status}</span> • {new Date(act.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
