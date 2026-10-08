import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createItem, updateItem, fetchItemById, improveDescription } from '../services/api';
import {
  Package,
  Sparkles,
  MapPin,
  Tag,
  Image as ImageIcon,
  ArrowLeft,
  Check,
  AlertCircle,
  Wand2,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = ['Books', 'Electronics', 'Study', 'Sports', 'Accessories', 'Lab Equipment', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const PRESET_IMAGES = [
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48d?w=600&auto=format&fit=crop&q=80' },
  { name: 'Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80' },
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Badminton', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80' },
  { name: 'Powerbank', url: 'https://images.unsplash.com/photo-1609592424082-f58c73335581?w=600&auto=format&fit=crop&q=80' },
];

export default function AddEditItemPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Study',
    condition: 'Good',
    description: '',
    location: '',
    availableFrom: new Date().toISOString().split('T')[0],
    maxLendingDuration: '7 days',
    tags: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const loadItemData = async () => {
        try {
          setFetching(true);
          const res = await fetchItemById(id);
          const item = res.data.data;
          setFormData({
            name: item.name || '',
            category: item.category || 'Study',
            condition: item.condition || 'Good',
            description: item.description || '',
            location: item.location || '',
            availableFrom: item.availableFrom ? new Date(item.availableFrom).toISOString().split('T')[0] : '',
            maxLendingDuration: item.maxLendingDuration || '7 days',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
            imageUrl: item.imageUrl || '',
          });
        } catch {
          setError('Failed to fetch item data');
        } finally {
          setFetching(false);
        }
      };
      loadItemData();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiImprove = async () => {
    if (!formData.description || formData.description.trim().length === 0) {
      setError('Please enter a brief initial description first before enhancing with AI.');
      return;
    }

    setError('');
    setAiLoading(true);

    try {
      const res = await improveDescription({
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
      });

      if (res.data && res.data.improved) {
        setFormData((prev) => ({ ...prev, description: res.data.improved }));
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 2500);
      }
    } catch {
      setError('Failed to enhance description with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.location) {
      setError('Please fill in all required fields (Name, Description, Location)');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (isEdit) {
        await updateItem(id, payload);
      } else {
        await createItem(payload);
      }

      navigate(isEdit ? `/items/${id}` : '/my-items');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading item details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Campus Peer Sharing
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {isEdit ? 'Edit Item Listing' : 'List an Item for Lending'}
            </h1>
            <p className="text-xs text-slate-500">
              Share your unused books, calculators, chargers, or gear with fellow campus students.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Casio Scientific Calculator"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm font-medium bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Max Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm font-medium bg-white"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Max Lending Duration
              </label>
              <select
                name="maxLendingDuration"
                value={formData.maxLendingDuration}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm font-medium bg-white"
              >
                <option value="1 day">1 day</option>
                <option value="3 days">3 days</option>
                <option value="7 days">7 days (1 week)</option>
                <option value="14 days">14 days (2 weeks)</option>
                <option value="30 days">30 days (1 month)</option>
              </select>
            </div>
          </div>

          {/* Location & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Pickup Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. North Hall, Dorm 3B"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tags (Comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Calculator, Exam, Math"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          {/* Description & AI Enhance Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Description *
              </label>
              
              {/* ✨ Improve with AI Magic Button */}
              <button
                type="button"
                onClick={handleAiImprove}
                disabled={aiLoading || !formData.description}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                title="Polish description using AI assistant"
              >
                {aiLoading ? (
                  <Wand2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                )}
                <span>{aiLoading ? 'Enhancing...' : '✨ Improve with AI'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. calculator works fine, used for 2 years"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm leading-relaxed"
              required
            />
            {aiSuccess && (
              <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Description enhanced with AI!
              </p>
            )}
          </div>

          {/* Image URL & Preset Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 text-sm mb-2"
            />
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Quick Presets:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-600/20 disabled:opacity-50"
            >
              {loading ? 'Saving Listing...' : isEdit ? 'Update Item' : 'Publish Campus Listing'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
