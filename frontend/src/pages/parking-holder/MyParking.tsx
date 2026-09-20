import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingService } from '../../services/parkingService';
import { ParkingSpace } from '../../types';
import { getMediaUrl } from '../../services/api';
import {
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  ShieldCheck,
  Video,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const MyParkingPage: React.FC = () => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingSpace, setEditingSpace] = useState<ParkingSpace | null>(null);
  const [editTotalSlots, setEditTotalSlots] = useState<number>(0);
  const [editAvailableSlots, setEditAvailableSlots] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchSpaces = async () => {
    setIsLoading(true);
    try {
      const res = await parkingService.getMySpaces();
      if (res.success && res.data) {
        setSpaces(res.data.parkingSpaces);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleToggleStatus = async (space: ParkingSpace) => {
    const newStatus = space.status === 'open' ? 'closed' : 'open';
    try {
      const res = await parkingService.update(space.id, { status: newStatus });
      if (res.success) {
        setSpaces((prev) =>
          prev.map((s) => (s.id === space.id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update parking status.');
    }
  };

  const handleStartEdit = (space: ParkingSpace) => {
    setEditingSpace(space);
    setEditTotalSlots(space.totalSlots);
    setEditAvailableSlots(space.availableSlots);
    setEditPrice(space.pricePerHour);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace) return;
    setIsUpdating(true);
    try {
      const res = await parkingService.update(editingSpace.id, {
        totalSlots: editTotalSlots,
        availableSlots: Math.min(editAvailableSlots, editTotalSlots),
        pricePerHour: editPrice,
      });

      if (res.success && res.data?.parking) {
        setSpaces((prev) =>
          prev.map((s) => (s.id === editingSpace.id ? res.data!.parking : s))
        );
        setEditingSpace(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update slot settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this parking facility?')) return;
    try {
      await parkingService.delete(id);
      setSpaces((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete parking space.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Parking Spaces
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage real-time capacity, toggle open/closed state, and adjust hourly pricing.
          </p>
        </div>

        <Link
          to="/parking-holder/parking/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Add New Space
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium">Loading your parking facilities...</p>
        </div>
      ) : spaces.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No parking facilities listed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first parking space listing to begin receiving driver bookings.
          </p>
          <Link
            to="/parking-holder/parking/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
          >
            Create Parking Space
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => {
            const photo = space.photos && space.photos.length > 0 ? getMediaUrl(space.photos[0]) : '';
            const isOpen = space.status === 'open';

            return (
              <div
                key={space.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={space.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No photo
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                          !isOpen
                            ? 'bg-red-500 text-white'
                            : space.availableSlots === 0
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {!isOpen ? 'CLOSED' : space.availableSlots === 0 ? 'FULL' : `${space.availableSlots} Open`}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      ₹{space.pricePerHour}/hr
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{space.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{space.address}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Available Slots</span>
                        <span className="font-extrabold text-emerald-600 text-sm">{space.availableSlots}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Total Capacity</span>
                        <span className="font-extrabold text-slate-800 text-sm">{space.totalSlots} Slots</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                        {space.parkingType}
                      </span>
                      {space.cctvAvailable && (
                        <span className="flex items-center gap-0.5 text-[11px] text-emerald-700">
                          <Video className="w-3 h-3" /> CCTV
                        </span>
                      )}
                      {space.gateAvailable && (
                        <span className="flex items-center gap-0.5 text-[11px] text-emerald-700">
                          <Lock className="w-3 h-3" /> Gate
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(space)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                      isOpen
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isOpen ? 'Close Parking' : 'Open Parking'}
                  </button>

                  <button
                    onClick={() => handleStartEdit(space)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Edit Slots & Rates"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(space.id)}
                    className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Manage Slots & Rate: {editingSpace.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Total Capacity (Slots)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editTotalSlots}
                  onChange={(e) => setEditTotalSlots(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Available Slots Currently
                </label>
                <input
                  type="number"
                  min="0"
                  max={editTotalSlots}
                  required
                  value={editAvailableSlots}
                  onChange={(e) => setEditAvailableSlots(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Setting this to 0 marks the space FULL on the Live Map.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Price Per Hour (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSpace(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
