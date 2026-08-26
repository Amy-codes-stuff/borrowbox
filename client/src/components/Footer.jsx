import React from 'react';
import { Package, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Package className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl text-white">BorrowBox</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              The official campus peer-to-peer item sharing and lending platform. Borrow what you need for classes, lab work, or sports—share what you have.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-400 bg-slate-800/80 px-3 py-1.5 rounded-lg w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Borrow smarter. Share more.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Explore Items</a></li>
              <li><a href="/items/new" className="hover:text-white transition-colors">List New Item</a></li>
              <li><a href="/my-items" className="hover:text-white transition-colors">My Listings</a></li>
              <li><a href="/requests" className="hover:text-white transition-colors">Borrowing Requests</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Activity Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Campus Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Campus Students</span>
              </li>
              <li>Peer-to-Peer Peer Trust System</li>
              <li>Multi-Category Filtering</li>
              <li>Docker & AWS EC2 Ready</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BorrowBox Campus Lending Network. Built for students.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>using React, Express, MongoDB & Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
