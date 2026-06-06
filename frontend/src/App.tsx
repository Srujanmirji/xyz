import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Lazy-loaded pages
const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PropertyListingPage = React.lazy(() => import('./pages/PropertyListingPage').then(m => ({ default: m.PropertyListingPage })));
const SellPage = React.lazy(() => import('./pages/SellPage').then(m => ({ default: m.SellPage })));
const RentPage = React.lazy(() => import('./pages/RentPage').then(m => ({ default: m.RentPage })));
const PropertyDetailPage = React.lazy(() => import('./pages/PropertyDetailPage').then(m => ({ default: m.PropertyDetailPage })));
const BookingPage = React.lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

const LoginPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import('./pages/AuthPages').then(m => ({ default: m.ResetPasswordPage })));

const UserDashboard = React.lazy(() => import('./pages/Dashboards/UserDashboard').then(m => ({ default: m.UserDashboard })));
const AdminDashboard = React.lazy(() => import('./pages/Dashboards/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const queryClient = new QueryClient();

// Route Protection wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        Loading context...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role violations back to matching role dashboards
    if (user.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

import { motion, useScroll, useSpring } from 'framer-motion';

const AppRoutes: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="flex flex-col min-h-screen">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[9999]" 
        style={{ scaleX }} 
      />
      <Header />
      <div className="flex-grow">
        <React.Suspense
          fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-background text-on-background">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-label-md text-on-surface-variant animate-pulse">Loading Page...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/buy" element={<PropertyListingPage key="buy" defaultListingType="SALE" />} />
            <Route path="/rent" element={<PropertyListingPage key="rent" defaultListingType="RENT" />} />
            <Route path="/rent/list" element={<RentPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/properties" element={<PropertyListingPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route
              path="/booking/:propertyId"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

            {/* Onboarding & Profile */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Role Protected Dashboards */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['USER', 'AGENT']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
