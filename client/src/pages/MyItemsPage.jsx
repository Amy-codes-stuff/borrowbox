import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchItems, deleteItem } from '../services/api';
import { useUser } from '../context/UserContext';
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function MyItemsPage() {
  const { currentUser } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadMyItems = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetchItems({ owner: currentUser._id });
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyItems();

    const handleUserChange = () => loadMyItems();
    window.addEventListener('demouserchange', handleUserChange);
    return () => window.removeEventListener('demouserchange', handleUserChange);
  }, [currentUser]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from campus listings?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              My Listed Items
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {items.length} Listed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Listings offered by <span className="font-semibold text-slate-800">{currentUser?.name}</span> ({currentUser?.department})
          </p>
        </div>

        <Link
          to="/items/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Item</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="aspect-[4/3] rounded-xl animate-shimmer"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 animate-shimmer"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">{error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No items listed yet</h3>
          <p className="text-xs text-slate-500 mb-6">
              You haven&apos;t listed any items under {currentUser?.name}. Click below to add your scientific calculator, lab coat, or textbooks.
          </p>
          <Link
            to="/items/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List an Item Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isAvailable = item.status === 'available';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isAvailable ? 'badge-available' : 'badge-borrowed'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Borrowed'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-3">
                    <span className="font-semibold text-slate-700">{item.condition}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.maxLendingDuration || '7 days'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{item.location}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <Link
                      to={`/items/${item._id}`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/items/${item._id}/edit`}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        disabled={deletingId === item._id}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
