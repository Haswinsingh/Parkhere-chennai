import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Compass,
  MapPin,
  CalendarCheck,
  LayoutDashboard,
  ShieldCheck,
  DollarSign,
  PlusCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-emerald-600 transition-colors">
              P
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                ParkHere
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 -mt-1 font-medium">
                Smart Parking for Smarter Cities
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              // Public Navigation
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/how-it-works"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/how-it-works') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  How It Works
                </Link>
                <Link
                  to="/features"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/features') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Features
                </Link>
                <Link
                  to="/for-drivers"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/for-drivers') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  For Drivers
                </Link>
                <Link
                  to="/for-holders"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/for-holders') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  For Parking Holders
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/about') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  About
                </Link>
              </>
            ) : user?.role === 'parking_needed' ? (
              // Parking Needed Navigation
              <>
                <Link
                  to="/parking-needed"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/parking-needed') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Find Parking
                </Link>
                <Link
                  to="/parking-needed/map"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/parking-needed/map') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Live Map
                </Link>
                <Link
                  to="/parking-needed/bookings"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/parking-needed/bookings') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  My Bookings
                </Link>
              </>
            ) : (
              // Parking Holder Navigation
              <>
                <Link
                  to="/parking-holder"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/parking-holder') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/parking-holder/parking"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/parking-holder/parking') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Parking
                </Link>
                <Link
                  to="/parking-holder/bookings"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/parking-holder/bookings') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Bookings
                </Link>
                <Link
                  to="/parking-holder/earnings"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    isActive('/parking-holder/earnings') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Earnings
                </Link>
                <Link
                  to="/parking-holder/verification"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                    isActive('/parking-holder/verification') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verification
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {user?.role === 'parking_holder' && (
                  <Link
                    to="/parking-holder/parking/new"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Space
                  </Link>
                )}

                {/* Notifications Bell */}
                <NotificationDropdown />

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {user?.name}
                      </p>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600">
                        {user?.role === 'parking_holder' ? 'PARKING HOLDER' : 'PARKING NEEDED'}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                          {user?.role === 'parking_holder' ? 'PARKING HOLDER' : 'PARKING NEEDED'}
                        </span>
                      </div>

                      <Link
                        to={user?.role === 'parking_holder' ? '/parking-holder/profile' : '/parking-needed/profile'}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>

                      <Link
                        to={user?.role === 'parking_holder' ? '/parking-holder/settings' : '/parking-needed/settings'}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" /> Settings
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="block py-2 text-sm font-medium text-slate-700">Home</Link>
              <Link to="/how-it-works" className="block py-2 text-sm font-medium text-slate-700">How It Works</Link>
              <Link to="/features" className="block py-2 text-sm font-medium text-slate-700">Features</Link>
              <Link to="/for-drivers" className="block py-2 text-sm font-medium text-slate-700">For Drivers</Link>
              <Link to="/for-holders" className="block py-2 text-sm font-medium text-slate-700">For Parking Holders</Link>
              <Link to="/about" className="block py-2 text-sm font-medium text-slate-700">About</Link>
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                <Link to="/signin" className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg">Sign In</Link>
                <Link to="/signup" className="w-full text-center py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg">Get Started</Link>
              </div>
            </>
          ) : user?.role === 'parking_needed' ? (
            <>
              <div className="py-2 border-b border-slate-100 mb-2">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">PARKING NEEDED</p>
              </div>
              <Link to="/parking-needed" className="block py-2 text-sm font-medium text-slate-700">Find Parking</Link>
              <Link to="/parking-needed/map" className="block py-2 text-sm font-medium text-slate-700">Live Map</Link>
              <Link to="/parking-needed/bookings" className="block py-2 text-sm font-medium text-slate-700">My Bookings</Link>
              <Link to="/parking-needed/profile" className="block py-2 text-sm font-medium text-slate-700">My Profile</Link>
              <Link to="/parking-needed/settings" className="block py-2 text-sm font-medium text-slate-700">Settings</Link>
              <button onClick={handleLogout} className="w-full text-left py-2 text-sm font-medium text-red-600">Logout</button>
            </>
          ) : (
            <>
              <div className="py-2 border-b border-slate-100 mb-2">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">PARKING HOLDER</p>
              </div>
              <Link to="/parking-holder" className="block py-2 text-sm font-medium text-slate-700">Dashboard</Link>
              <Link to="/parking-holder/parking" className="block py-2 text-sm font-medium text-slate-700">My Parking</Link>
              <Link to="/parking-holder/parking/new" className="block py-2 text-sm font-medium text-emerald-600 font-semibold">+ Add Space</Link>
              <Link to="/parking-holder/bookings" className="block py-2 text-sm font-medium text-slate-700">Bookings</Link>
              <Link to="/parking-holder/earnings" className="block py-2 text-sm font-medium text-slate-700">Earnings</Link>
              <Link to="/parking-holder/verification" className="block py-2 text-sm font-medium text-slate-700">Verification</Link>
              <Link to="/parking-holder/profile" className="block py-2 text-sm font-medium text-slate-700">Profile</Link>
              <Link to="/parking-holder/settings" className="block py-2 text-sm font-medium text-slate-700">Settings</Link>
              <button onClick={handleLogout} className="w-full text-left py-2 text-sm font-medium text-red-600">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
