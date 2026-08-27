import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Package,
  PlusCircle,
  LayoutGrid,
  ClipboardList,
  BarChart3,
  UserCheck,
  ChevronDown,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export default function Navbar() {
  const { demoUsers, currentUser, switchUser, isLoggedIn, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Package className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Borrow<span className="text-brand-600">Box</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 hidden sm:block -mt-1">
                  Borrow smarter. Share more.
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Explore</span>
            </Link>

            <Link
              to="/my-items"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/my-items')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Items</span>
            </Link>

            <Link
              to="/requests"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/requests')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Requests</span>
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/dashboard')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </nav>

          {/* Action Button & Demo User Selector */}
          <div className="flex items-center space-x-3">
            <Link
              to="/items/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Item</span>
            </Link>

            {/* Login / Register links (when not logged in) */}
            {!isLoggedIn && (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Active User Dropdown / Switcher */}
            <div className="relative" ref={dropdownRef}>
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    title="User Profile"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={currentUser?.name || 'User'}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/30"
                    />
                    <div className="hidden lg:flex flex-col pr-1">
                      <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                        {currentUser?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-brand-600 font-bold leading-tight">
                        Logged In
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser?.department}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-3 py-2 flex items-center space-x-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold text-xs"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    title="Switch Active Demo User"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={currentUser?.name || 'User'}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/30"
                    />
                    <div className="hidden lg:flex flex-col pr-1">
                      <span className="text-xs font-semibold text-slate-800 leading-tight">
                        {currentUser?.name || 'Demo User'}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        Active Demo User
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3 text-brand-600" /> Demo Persona Switcher
                        </span>
                      </div>
                      <div className="py-1 max-h-60 overflow-y-auto">
                        {demoUsers.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => {
                              switchUser(user);
                              setDropdownOpen(false);
                              window.dispatchEvent(new Event('demouserchange'));
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center space-x-3 hover:bg-brand-50/60 transition-colors ${
                              currentUser?._id === user._id ? 'bg-brand-50/80 border-l-4 border-brand-600' : ''
                            }`}
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {user.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {user.department}
                              </p>
                            </div>
                            {currentUser?._id === user._id && (
                              <UserCheck className="w-4 h-4 text-brand-600" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="px-3 pt-2 pb-2 border-t border-slate-100 text-[10px] text-slate-400 flex flex-col gap-2">
                        <p>Switching user allows testing borrowing between Owner & Requester.</p>
                        <div className="border-t border-slate-100 pt-2 flex items-center justify-between gap-2 sm:hidden">
                          <Link
                            to="/login"
                            onClick={() => setDropdownOpen(false)}
                            className="text-brand-600 hover:underline font-bold text-center flex-1 py-1 bg-slate-50 rounded-lg"
                          >
                            Log In
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setDropdownOpen(false)}
                            className="text-slate-700 hover:underline font-bold text-center flex-1 py-1 bg-slate-50 rounded-lg"
                          >
                            Register
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-around text-xs font-medium text-slate-600">
        <Link to="/" className={`flex flex-col items-center p-1 ${isActive('/') ? 'text-brand-600 font-bold' : ''}`}>
          <LayoutGrid className="w-5 h-5" />
          <span>Explore</span>
        </Link>
        <Link to="/my-items" className={`flex flex-col items-center p-1 ${isActive('/my-items') ? 'text-brand-600 font-bold' : ''}`}>
          <Package className="w-5 h-5" />
          <span>My Items</span>
        </Link>
        <Link to="/requests" className={`flex flex-col items-center p-1 ${isActive('/requests') ? 'text-brand-600 font-bold' : ''}`}>
          <ClipboardList className="w-5 h-5" />
          <span>Requests</span>
        </Link>
        <Link to="/dashboard" className={`flex flex-col items-center p-1 ${isActive('/dashboard') ? 'text-brand-600 font-bold' : ''}`}>
          <BarChart3 className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </header>
  );
}
