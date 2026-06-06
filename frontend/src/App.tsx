import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PropertyListingPage } from './pages/PropertyListingPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { BookingPage } from './pages/BookingPage';
import { ContactPage } from './pages/ContactPage';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/AuthPages';
import { UserDashboard } from './pages/Dashboards/UserDashboard';
import { AgentDashboard } from './pages/Dashboards/AgentDashboard';
import { AdminDashboard } from './pages/Dashboards/AdminDashboard';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';

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
    if (user.role === 'AGENT') return <Navigate to="/agent-dashboard" replace />;
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-dashboard"
            element={
              <ProtectedRoute allowedRoles={['AGENT']}>
                <AgentDashboard />
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
