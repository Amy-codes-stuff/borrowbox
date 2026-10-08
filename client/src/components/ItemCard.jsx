import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export default function ItemCard({ item }) {
  const isAvailable = item.status === 'available';

  const conditionColors = {
    'New': 'bg-purple-50 text-purple-700 border-purple-200',
    'Like New': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Good': 'bg-sky-50 text-sky-700 border-sky-200',
    'Fair': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Image & Status Badge */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Overlay category pill & status */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/75 text-white backdrop-blur-md">
            {item.category}
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
              isAvailable ? 'badge-available' : 'badge-borrowed'
            }`}
          >
            {isAvailable ? 'Available' : 'Borrowed'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5">
          {item.name}
        </h3>

        {/* Condition & Duration */}
        <div className="flex items-center space-x-2 text-xs mb-3">
          <span className={`px-2 py-0.5 rounded border font-medium ${conditionColors[item.condition] || 'bg-slate-100'}`}>
            {item.condition}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.maxLendingDuration || '7 days max'}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-xs text-slate-500 mb-4 font-medium">
          <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        {/* Footer: Owner & View Details Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2 min-w-0">
            <img
              src={item.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={item.owner?.name || 'Owner'}
              className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
            />
            <span className="text-xs font-semibold text-slate-700 truncate">
              {item.owner?.name || 'Campus Student'}
            </span>
          </div>

          <Link
            to={`/items/${item._id}`}
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
