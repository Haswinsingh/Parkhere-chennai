import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole, ParkingPref, SecurityPref } from '../../types';
import {
  Car,
  Building2,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  User,
  ShieldAlert,
  Upload,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as UserRole | null;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    initialRole === 'parking_holder' || initialRole === 'parking_needed' ? initialRole : null
  );

  // Common Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Parking Holder Section A Preferences (Compulsory)
  const [numberOfVehicles, setNumberOfVehicles] = useState<number>(1);
  const [parkingPreference, setParkingPreference] = useState<ParkingPref>('Covered');
  const [securityPreference, setSecurityPreference] = useState<SecurityPref>('Both');

  // Parking Holder Section B Host Verification (Compulsory)
  const [landmark, setLandmark] = useState<string>('');
  const [cctvAvailable, setCctvAvailable] = useState<boolean>(true);
  const [gateAvailable, setGateAvailable] = useState<boolean>(true);
  const [upiId, setUpiId] = useState<string>('');
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [parkingPhotos, setParkingPhotos] = useState<File[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleIdDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdDocumentFile(e.target.files[0]);
    }
  };

  const handleParkingPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setParkingPhotos(Array.from(e.target.files));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Role-specific validation
    if (selectedRole === 'parking_holder') {
      if (!numberOfVehicles || numberOfVehicles <= 0) {
        setError('Please specify number of vehicles for Section A preferences.');
        return;
      }
      if (!landmark.trim()) {
        setError('Landmark is compulsory for host verification.');
        return;
      }
      if (!idDocumentFile) {
        setError('Government ID (Aadhaar / ID) upload is compulsory for host verification.');
        return;
      }
      if (parkingPhotos.length < 2) {
        setError('At least 2 parking photos are required for host verification.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone', phone.trim());
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('role', selectedRole || 'parking_needed');

      if (selectedRole === 'parking_holder') {
        formData.append('numberOfVehicles', numberOfVehicles.toString());
        formData.append('parkingPreference', parkingPreference);
        formData.append('securityPreference', securityPreference);
        formData.append('landmark', landmark.trim());
        formData.append('cctvAvailable', cctvAvailable.toString());
        formData.append('gateAvailable', gateAvailable.toString());
        if (upiId) formData.append('upiId', upiId.trim());

        if (idDocumentFile) formData.append('idDocument', idDocumentFile);
        parkingPhotos.forEach((photo) => formData.append('photos', photo));
      }

      const user = await register(formData);

      if (user.role === 'parking_holder') {
        navigate('/parking-holder/verification');
      } else {
        navigate('/parking-needed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
            P
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your ParkHere Account
          </h2>
          <p className="text-xs text-slate-500">Smart Parking for Smarter Cities</p>
        </div>

        {/* STEP 1: Role Selection */}
        {!selectedRole ? (
          <div className="space-y-4">
            <h3 className="text-center font-bold text-sm text-slate-800">
              How will you use ParkHere?
            </h3>

            <div
              onClick={() => setSelectedRole('parking_needed')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  I NEED PARKING
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Find and book available parking spots easily near your destination.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                  Continue to Sign Up <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div
              onClick={() => setSelectedRole('parking_holder')}
              className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  I'M A PARKING HOLDER
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  List and monetize your parking spaces with verified drivers and direct payouts.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                  Continue to Host Onboarding <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/signin" className="font-bold text-emerald-600 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: Real Registration Form */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {selectedRole === 'parking_holder' ? 'Parking Holder Registration' : 'Driver Registration'}
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

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Carter"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* PARKING HOLDER COMPULSORY SECTIONS */}
            {selectedRole === 'parking_holder' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                {/* Section A: Driver/Parking Preferences (Compulsory) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Section A: Parking Preferences (Compulsory)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        1. Number of Vehicles
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={numberOfVehicles}
                        onChange={(e) => setNumberOfVehicles(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        2. Parking Type
                      </label>
                      <select
                        value={parkingPreference}
                        onChange={(e) => setParkingPreference(e.target.value as ParkingPref)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                      >
                        <option value="Covered">Covered</option>
                        <option value="Open">Open</option>
                        <option value="Any">Any</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        3. Security Spec
                      </label>
                      <select
                        value={securityPreference}
                        onChange={(e) => setSecurityPreference(e.target.value as SecurityPref)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                      >
                        <option value="CCTV">CCTV</option>
                        <option value="Gated Parking">Gated Parking</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Host Verification (Compulsory) */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Section B: Host Verification (Compulsory)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      Protected Private Storage
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      1. Aadhaar / Government ID Upload *
                    </label>
                    <input
                      type="file"
                      required
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleIdDocChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Accepted: JPG, PNG, PDF (Encrypted and strictly never exposed publicly).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      2. Parking Photos (Min 2, Max 6 photos) *
                    </label>
                    <input
                      type="file"
                      required
                      multiple
                      accept="image/*"
                      onChange={handleParkingPhotosChange}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Photos of driveway, entrance, and parking slots ({parkingPhotos.length} selected).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      3. Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite City Metro Station Gate 2"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        4. CCTV Available?
                      </label>
                      <select
                        value={cctvAvailable.toString()}
                        onChange={(e) => setCctvAvailable(e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        5. Gate Available?
                      </label>
                      <select
                        value={gateAvailable.toString()}
                        onChange={(e) => setGateAvailable(e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      UPI ID for Direct Payouts (Optional)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="holder@upi or yourphone@paytm"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg disabled:bg-slate-300 mt-2"
            >
              {isSubmitting
                ? 'Creating Production Account...'
                : selectedRole === 'parking_holder'
                ? 'Submit Host Application for Verification'
                : 'Create Driver Account'}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link
                  to={`/signin?role=${selectedRole}`}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
