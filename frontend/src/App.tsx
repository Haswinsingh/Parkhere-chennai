import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { ForDriversPage } from './pages/public/ForDriversPage';
import { ForHoldersPage } from './pages/public/ForHoldersPage';
import { AboutPage } from './pages/public/AboutPage';

// Parking Needed Pages
import { ParkingNeededDashboard } from './pages/parking-needed/Dashboard';
import { FindParkingPage } from './pages/parking-needed/FindParking';
import { LiveMapPage } from './pages/parking-needed/LiveMapPage';
import { MyBookingsPage } from './pages/parking-needed/MyBookings';
import { DriverProfilePage } from './pages/parking-needed/ProfilePage';
import { DriverSettingsPage } from './pages/parking-needed/SettingsPage';

// Parking Holder Pages
import { ParkingHolderDashboard } from './pages/parking-holder/Dashboard';
import { MyParkingPage } from './pages/parking-holder/MyParking';
import { CreateParkingPage } from './pages/parking-holder/CreateParking';
import { HolderBookingsPage } from './pages/parking-holder/HolderBookings';
import { EarningsPage } from './pages/parking-holder/EarningsPage';
import { HostVerificationPage } from './pages/parking-holder/VerificationPage';
import { HolderProfilePage } from './pages/parking-holder/ProfilePage';
import { HolderSettingsPage } from './pages/parking-holder/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LocationProvider>
        <NotificationProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes with Public Layout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/for-drivers" element={<ForDriversPage />} />
                <Route path="/for-holders" element={<ForHoldersPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* Parking Needed Protected Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['parking_needed']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/parking-needed" element={<ParkingNeededDashboard />} />
                <Route path="/parking-needed/find" element={<FindParkingPage />} />
                <Route path="/parking-needed/map" element={<LiveMapPage />} />
                <Route path="/parking-needed/bookings" element={<MyBookingsPage />} />
                <Route path="/parking-needed/profile" element={<DriverProfilePage />} />
                <Route path="/parking-needed/settings" element={<DriverSettingsPage />} />
              </Route>

              {/* Parking Holder Protected Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['parking_holder']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/parking-holder" element={<ParkingHolderDashboard />} />
                <Route path="/parking-holder/parking" element={<MyParkingPage />} />
                <Route path="/parking-holder/parking/new" element={<CreateParkingPage />} />
                <Route path="/parking-holder/bookings" element={<HolderBookingsPage />} />
                <Route path="/parking-holder/earnings" element={<EarningsPage />} />
                <Route path="/parking-holder/verification" element={<HostVerificationPage />} />
                <Route path="/parking-holder/profile" element={<HolderProfilePage />} />
                <Route path="/parking-holder/settings" element={<HolderSettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </LocationProvider>
    </AuthProvider>
  );
};

export default App;
