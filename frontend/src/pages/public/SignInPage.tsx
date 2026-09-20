import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Car,
  Building2,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  ArrowLeft,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialRole === 'parking_holder' || initialRole === 'parking_needed' ? initialRole : null
  );

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your email or phone and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = await login(
        identifier.trim(),
        password,
        selectedRole || undefined
      );

      if (user.role === 'parking_holder') {
        navigate('/parking-holder');
      } else {
        navigate('/parking-needed');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Unable to connect. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Brand Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
            P
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to ParkHere
          </h2>
          <p className="text-xs text-slate-500">Smart Parking for Smarter Cities</p>
        </div>

        {/* STEP 1: Role Selection if not yet selected */}
        {!selectedRole ? (
          <div className="space-y-4">
            <h3 className="text-center font-bold text-sm text-slate-800">
              How are you using ParkHere?
            </h3>

            {/* Role Option 1: Parking Needed */}
            <div
              onClick={() => handleRoleSelect('parking_needed')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  I NEED PARKING
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Find and book nearby parking.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Role Option 2: Parking Holder */}
            <div
              onClick={() => handleRoleSelect('parking_holder')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  I'M A PARKING HOLDER
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">List and manage your parking spaces.</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link to="/signup" className="font-bold text-emerald-600 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: Clean Production Credentials Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {selectedRole === 'parking_holder' ? "I'm a Parking Holder" : 'I Need Parking'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Role
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email address or phone"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link
                  to={`/signup?role=${selectedRole}`}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Create {selectedRole === 'parking_holder' ? 'Host' : 'Driver'} Account
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
