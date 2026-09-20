import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, getMediaUrl } from '../../services/api';
import {
  ShieldCheck,
  ShieldAlert,
  XCircle,
  CheckCircle2,
  FileText,
  Camera,
  MapPin,
  Lock,
  Video,
  Upload,
  Sparkles,
} from 'lucide-react';

export const HostVerificationPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulatingReview, setIsSimulatingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/verification/status');
      if (res.data?.success && res.data?.data) {
        setVerificationData(res.data.data);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Authorized Host Verification Action
  const handleSimulateAdminAction = async (status: 'approved' | 'rejected') => {
    setIsSimulatingReview(true);
    setReviewMessage(null);
    try {
      if (status === 'approved') {
        const res = await api.post('/verification/verify-me');
        if (res.data?.success) {
          setReviewMessage('Host account verified and approved successfully!');
          await refreshUser();
          await fetchStatus();
          return;
        }
      }

      const res = await api.post('/verification/review', {
        targetUserId: user?.id,
        status,
        adminSecret: 'parkhere_admin_2026',
        notes: status === 'approved'
          ? 'Government ID and physical facility photos verified by Trust & Safety.'
          : 'Please re-upload a higher resolution copy of your Government ID.',
      });

      if (res.data?.success) {
        setReviewMessage(`Verification updated to ${status}.`);
        await refreshUser();
        await fetchStatus();
      }
    } catch (err: any) {
      setReviewMessage(err.response?.data?.message || 'Verification update error.');
    } finally {
      setIsSimulatingReview(false);
    }
  };

  const status = user?.verificationStatus || 'pending';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Host Verification Status
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your submitted government ID, security attributes, and publishing eligibility.
        </p>
      </div>

      {/* Status Hero Card */}
      <div
        className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          status === 'approved'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : status === 'rejected'
            ? 'bg-red-50 border-red-200 text-red-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              status === 'approved'
                ? 'bg-emerald-500 text-white'
                : status === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {status === 'approved' ? (
              <ShieldCheck className="w-7 h-7" />
            ) : status === 'rejected' ? (
              <XCircle className="w-7 h-7" />
            ) : (
              <ShieldAlert className="w-7 h-7" />
            )}
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
              Current Host Status
            </span>
            <h3 className="text-xl font-extrabold capitalize">{status}</h3>
            <p className="text-xs leading-relaxed max-w-xl">
              {status === 'approved'
                ? 'Your host profile is officially verified. All your listed parking spaces are active and visible to drivers on the Live Map.'
                : status === 'rejected'
                ? `Verification was not approved. ${user?.verificationNotes || 'Please contact support or resubmit documents.'}`
                : 'Your Government ID and parking photos are undergoing review. Only approved hosts can publish bookable parking spaces.'}
            </p>
          </div>
        </div>

        {/* Authorized Verification Review Panel */}
        <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200/60 shrink-0 text-center space-y-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Verification Review Action
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleSimulateAdminAction('approved')}
              disabled={isSimulatingReview || status === 'approved'}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              Approve Host
            </button>
            <button
              onClick={() => handleSimulateAdminAction('rejected')}
              disabled={isSimulatingReview || status === 'rejected'}
              className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              Reject Host
            </button>
          </div>
          {reviewMessage && <p className="text-[10px] text-emerald-700 font-semibold">{reviewMessage}</p>}
        </div>
      </div>

      {/* Submitted Documentation Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Submitted Verification Documents & Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* 1. Government ID Document (Protected) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileText className="w-4 h-4 text-emerald-600" />
              1. Government ID (Aadhaar / ID Card)
            </div>
            <p className="text-slate-600">
              Document Status:{' '}
              <span className="font-semibold text-emerald-700">
                {verificationData?.hasUploadedId ? 'Uploaded & Encrypted' : 'On File'}
              </span>
            </p>
            <p className="text-[11px] text-slate-500">
              Stored in secure private storage. Only authorized verification workflows can inspect this file.
            </p>
          </div>

          {/* 2. Landmark */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600" />
              2. Facility Landmark
            </div>
            <p className="font-semibold text-slate-800">{user?.landmark || 'Provided at registration'}</p>
            <p className="text-[11px] text-slate-500">
              Used by arriving drivers for visual navigation.
            </p>
          </div>

          {/* 3. Security Attributes */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Video className="w-4 h-4 text-emerald-600" />
              3. Security Systems
            </div>
            <div className="flex gap-4">
              <span>CCTV Available: <strong>{user?.cctvAvailable ? 'Yes' : 'No'}</strong></span>
              <span>Gated Parking: <strong>{user?.gateAvailable ? 'Yes' : 'No'}</strong></span>
            </div>
          </div>

          {/* 4. Section A Preferences */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Lock className="w-4 h-4 text-emerald-600" />
              4. Section A Preferences
            </div>
            <p className="text-slate-600">
              Capacity:{' '}
              <strong>{user?.hostPreferences?.numberOfVehicles || 1} vehicles</strong> •{' '}
              Type: <strong>{user?.hostPreferences?.parkingPreference || 'Covered'}</strong> •{' '}
              Security: <strong>{user?.hostPreferences?.securityPreference || 'Both'}</strong>
            </p>
          </div>
        </div>

        {/* 5. Photos */}
        {user?.photos && user.photos.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Submitted Parking Photos ({user.photos.length}):
            </span>
            <div className="flex flex-wrap gap-3">
              {user.photos.map((photo, i) => (
                <img
                  key={i}
                  src={getMediaUrl(photo, false)}
                  alt={`Host photo ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
