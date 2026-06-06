import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty,
  toggleFavorite,
  getFavorites,
  addReview,
  getAIPredictions,
} from '../controllers/property.controller';
import {
  createBooking,
  getBookings,
  updateBookingStatus,
} from '../controllers/booking.controller';
import {
  getDashboardStats,
  getNotifications,
  markNotificationRead,
  createInquiry,
  getInquiries,
} from '../controllers/dashboard.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleLogin);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, updateProfile);

// Property routes
router.post('/properties', authenticate, authorizeRoles(Role.AGENT, Role.ADMIN), createProperty);
router.get('/properties', getProperties);
router.get('/properties/ai-recommendations', authenticate, getAIPredictions);
router.get('/properties/favorites', authenticate, getFavorites);
router.post('/properties/favorites', authenticate, toggleFavorite);
router.get('/properties/:id', getPropertyById);
router.put('/properties/:id', authenticate, updateProperty);
router.delete('/properties/:id', authenticate, deleteProperty);
router.patch('/properties/:id/approve', authenticate, authorizeRoles(Role.ADMIN), approveProperty);

// Review routes
router.post('/properties/reviews', authenticate, addReview);

// Booking routes
router.post('/bookings', authenticate, createBooking);
router.get('/bookings', authenticate, getBookings);
router.patch('/bookings/:id/status', authenticate, updateBookingStatus);

// Inquiries / Contacts
router.post('/inquiries', createInquiry); // Guest allowed
router.get('/inquiries', authenticate, getInquiries);

// Dashboard & notification routes
router.get('/dashboard/stats', authenticate, getDashboardStats);
router.get('/dashboard/notifications', authenticate, getNotifications);
router.patch('/dashboard/notifications/:id/read', authenticate, markNotificationRead);

export default router;
