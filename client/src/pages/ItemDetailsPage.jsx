import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchItemById } from '../services/api';
import ItemCard from '../components/ItemCard';
import BorrowModal from '../components/BorrowModal';
import { useUser } from '../context/UserContext';
import {
  MapPin,
  Clock,
  Tag,
  Send,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Edit,
  Sparkles
} from 'lucide-react';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchItemById(id);
      setItem(res.data.data);
      setSimilarItems(res.data.similarItems || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Item not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-slate-200 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-24 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'The requested campus listing does not exist.'}</p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?._id === item.owner?._id || currentUser?._id === item.owner;
  const isAvailable = item.status === 'available';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Explore</span>
      </button>

      {/* Main Item Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-6 relative bg-slate-100 p-6 flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-inner">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                    isAvailable ? 'badge-available' : 'badge-borrowed'
                  }`}
                >
                  {isAvailable ? 'Available Now' : 'Currently Borrowed'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Actions */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            
            <div>
              {/* Category & Condition */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {item.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Condition: {item.condition}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                {item.name}
              </h1>

              {/* Location & Lending Rules */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                    <span className="font-semibold text-slate-800">{item.location}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Duration</span>
                    <span className="font-semibold text-slate-800">{item.maxLendingDuration || '7 days'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Description
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600"
                      >
                        <Tag className="w-3 h-3 text-slate-400 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6 flex items-center space-x-3">
                <img
                  src={item.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={item.owner?.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{item.owner?.name || 'Campus Student'}</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {item.owner?.department || 'Verified Student'}
                  </p>
                </div>
              </div>

            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Listed on {new Date(item.createdAt).toLocaleDateString()}
              </span>

              {isOwner ? (
                <Link
                  to={`/items/${item._id}/edit`}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 flex items-center space-x-1.5"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Listing</span>
                </Link>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={!isAvailable}
                  className={`px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center space-x-2 transition-all ${
                    isAvailable
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{isAvailable ? 'Request to Borrow' : 'Currently Borrowed'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Similar Items Section */}
      {similarItems.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Similar Items in Campus</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarItems.map((sItem) => (
              <ItemCard key={sItem._id} item={sItem} />
            ))}
          </div>
        </section>
      )}

      {/* Request Modal */}
      <BorrowModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestSuccess={() => loadItem()}
      />

    </div>
  );
}
