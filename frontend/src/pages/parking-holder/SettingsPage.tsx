import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Bell,
  SlidersHorizontal,
  LogOut,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const HolderSettingsPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [upiId, setUpiId] = useState<string>(user?.upiId || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.settings?.notificationsEnabled ?? true
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await api.patch('/users/me', {
        upiId: upiId.trim(),
        settings: {
          notificationsEnabled,
        },
      });
      await refreshUser();
      setSaveMessage('Settings saved successfully.');
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
          Host Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure payout UPI accounts, alert notifications, and preferences.</p>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 44. UPI ID Configuration Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment & Payout UPI ID</h3>
            <p className="text-xs text-slate-500">Drivers will scan and transfer parking charges directly to this address.</p>
          </div>
        </div>

        <div className="pt-2">
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. yourname@oksbi or 9876543210@paytm"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
          />
        </div>
      </div>

      {/* In-app Notifications */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Arrival & 10-Minute Alert Notifications</h3>
            <p className="text-xs text-slate-500">Notify you when vehicles arrive at your gate and before sessions conclude.</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">Host In-App Alert Notifications</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Logout */}
      <div className="p-6 bg-red-50/50 rounded-3xl border border-red-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-red-900 uppercase">Host Session</h4>
          <p className="text-xs text-red-700">Sign out of your host management dashboard.</p>
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
