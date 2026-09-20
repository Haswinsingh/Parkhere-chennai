import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  SlidersHorizontal,
  Bell,
  Sun,
  Shield,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

export const DriverSettingsPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const { requestDeviceLocation, isLocating } = useLocation();
  const navigate = useNavigate();

  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(user?.settings?.searchRadiusKm || 5);
  const [sortPreference, setSortPreference] = useState<'distance' | 'price' | 'rating' | 'availability'>(
    user?.settings?.sortPreference || 'distance'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.settings?.notificationsEnabled ?? true
  );
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user?.settings?.theme || 'light');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await api.patch('/users/me', {
        settings: {
          searchRadiusKm,
          sortPreference,
          notificationsEnabled,
          theme,
        },
      });
      await refreshUser();
      setSaveMessage('Preferences updated successfully.');
    } catch {
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize search preferences, geolocation access, notifications, and privacy options.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Geolocation Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Browser Geolocation Access</h3>
            <p className="text-xs text-slate-500">Allow ParkHere to use high-accuracy GPS for nearby parking search.</p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={requestDeviceLocation}
            disabled={isLocating}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            {isLocating ? 'Acquiring GPS Signal...' : 'Test / Re-request GPS Access'}
          </button>
        </div>
      </div>

      {/* Search Preferences */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Search & Filter Preferences</h3>
            <p className="text-xs text-slate-500">Configure default radius and sorting criteria.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Search Radius
            </label>
            <select
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none bg-white"
            >
              <option value={1}>1 km (Immediate Neighborhood)</option>
              <option value={3}>3 km (Local Area)</option>
              <option value={5}>5 km (Default City Zone)</option>
              <option value={10}>10 km (Extended City Radius)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Sort Criteria
            </label>
            <select
              value={sortPreference}
              onChange={(e) => setSortPreference(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none bg-white"
            >
              <option value="distance">Distance (Nearest First)</option>
              <option value="price">Price (Lowest Hourly Rate)</option>
              <option value="rating">Host Rating</option>
              <option value="availability">Slot Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications & System */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Alerts & Notifications</h3>
            <p className="text-xs text-slate-500">Receive 10-minute expiry warnings and booking confirmations.</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">In-App Notification Alerts</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          {isSaving ? 'Saving Settings...' : 'Save Settings'}
        </button>
      </div>

      {/* Danger Zone / Logout */}
      <div className="p-6 bg-red-50/50 rounded-3xl border border-red-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-red-900 uppercase">Account Session</h4>
          <p className="text-xs text-red-700">Safely terminate your current active session on this device.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};
