import React, { useState, useEffect } from 'react';
import { fetchItems } from '../services/api';
import ItemCard from '../components/ItemCard';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  Laptop,
  GraduationCap,
  Trophy,
  Headphones,
  TestTube,
  Package,
  RefreshCw,
  XCircle
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Package },
  { name: 'Books', icon: BookOpen },
  { name: 'Electronics', icon: Laptop },
  { name: 'Study', icon: GraduationCap },
  { name: 'Sports', icon: Trophy },
  { name: 'Accessories', icon: Headphones },
  { name: 'Lab Equipment', icon: TestTube },
  { name: 'Other', icon: Sparkles },
];

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sort, setSort] = useState('newest');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (condition !== 'All') params.condition = condition;
      if (availability !== 'All') params.status = availability;
      if (sort) params.sort = sort;

      const res = await fetchItems(params);
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category, condition, availability, sort]);

  return (
    <div className="min-h-screen pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Campus Peer-to-Peer Sharing Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Borrow what you need. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-teal-200">
              Share what you have.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Instant access to scientific calculators, lab gear, textbooks, power banks, and sports equipment right across your campus dorms.
          </p>

          {/* Search bar inside Hero */}
          <div className="max-w-2xl mx-auto relative shadow-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search calculators, DBMS books, USB chargers, lab coats..."
                className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-16 text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={loadData}
                className="absolute right-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs sm:text-sm hover:bg-brand-500 transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick campus stats banner */}
          <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-3 max-w-xl mx-auto gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">15+</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Campus Listings</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-brand-400">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Student Verified</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">0$</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Free Peer Sharing</div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Category Pills Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Browse Categories
            </h2>
            <span className="text-xs text-slate-400">{items.length} items found</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const selected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                    selected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${selected ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filters:</span>
            </div>

            {/* Condition Filter */}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>

            {/* Availability Filter */}
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available Now</option>
              <option value="borrowed">Currently Borrowed</option>
            </select>

            {(category !== 'All' || condition !== 'All' || availability !== 'All' || search) && (
              <button
                onClick={() => {
                  setCategory('All');
                  setCondition('All');
                  setAvailability('All');
                  setSearch('');
                }}
                className="text-xs font-semibold text-rose-600 hover:underline px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <span className="text-xs font-medium text-slate-500">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Item Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="aspect-[4/3] rounded-xl animate-shimmer"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-shimmer"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 animate-shimmer"></div>
                <div className="h-8 bg-slate-100 rounded-lg animate-shimmer"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Items</h3>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn&apos;t find any items matching your filters. Try resetting search criteria or be the first to list an item!
            </p>
            <button
              onClick={() => {
                setCategory('All');
                setCondition('All');
                setAvailability('All');
                setSearch('');
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
