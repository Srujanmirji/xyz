import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (role === 'ADMIN') {
      const usersCount = await prisma.user.count();
      const propertiesPending = await prisma.property.count({ where: { status: 'PENDING' } });
      const propertiesApproved = await prisma.property.count({ where: { status: 'APPROVED' } });
      const bookingsCount = await prisma.booking.count();
      const inquiriesCount = await prisma.inquiry.count();

      // Mock market monthly analytics for admin charts
      const analytics = [
        { month: 'Jan', revenue: 125000, listings: 12 },
        { month: 'Feb', revenue: 142000, listings: 18 },
        { month: 'Mar', revenue: 235000, listings: 25 },
        { month: 'Apr', revenue: 310000, listings: 32 },
        { month: 'May', revenue: 412000, listings: 40 },
        { month: 'Jun', revenue: 580000, listings: 45 },
      ];

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalUsers: usersCount,
            pendingApprovals: propertiesPending,
            approvedListings: propertiesApproved,
            totalBookings: bookingsCount,
            totalInquiries: inquiriesCount,
          },
          analytics,
        },
      });
    } else if (role === 'AGENT') {
      const listingsCount = await prisma.property.count({ where: { agentId: userId } });
      const bookingsCount = await prisma.booking.count({
        where: { property: { agentId: userId } },
      });
      const inquiriesCount = await prisma.inquiry.count({
        where: { property: { agentId: userId } },
      });
      const pendingBookings = await prisma.booking.count({
        where: { property: { agentId: userId }, status: 'PENDING' },
      });

      // Mock performance details for agent charts
      const performance = [
        { month: 'Jan', deals: 2, bookings: 5 },
        { month: 'Feb', deals: 4, bookings: 8 },
        { month: 'Mar', deals: 5, bookings: 12 },
        { month: 'Apr', deals: 6, bookings: 16 },
        { month: 'May', deals: 8, bookings: 20 },
        { month: 'Jun', deals: 9, bookings: 24 },
      ];

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            myListings: listingsCount,
            activeBookings: bookingsCount,
            clientInquiries: inquiriesCount,
            pendingBookings,
            profileStrength: 85, // out of 100
          },
          performance,
        },
      });
    } else {
      // Regular user dashboard metrics
      const favoritesCount = await prisma.favorite.count({ where: { userId } });
      const bookingsCount = await prisma.booking.count({ where: { userId } });
      const notificationsCount = await prisma.notification.count({ where: { userId, read: false } });

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            savedProperties: favoritesCount,
            upcomingTours: bookingsCount,
            unreadNotifications: notificationsCount,
            profileStrength: 60,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const createInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Required fields (propertyId, name, email, message) are missing' });
    }

    // Try to associate with user if token is present, else guest
    let userId: string | undefined = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'xyz_homes_secret_jwt_key_2026') as any;
        userId = decoded.id;
      } catch (e) {
        // Ignore token errors for inquiries, treat as guest
      }
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: userId || null,
        propertyId,
        name,
        email,
        phone: phone || null,
        message,
        status: 'NEW',
      },
    });

    // Notify agent of new client inquiry
    await prisma.notification.create({
      data: {
        userId: property.agentId,
        title: 'New Client Inquiry',
        message: `Client "${name}" has submitted an inquiry message regarding "${property.title}".`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully to the listing agent',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let inquiries;

    if (role === 'ADMIN') {
      inquiries = await prisma.inquiry.findMany({
        include: {
          property: { select: { id: true, title: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'AGENT') {
      inquiries = await prisma.inquiry.findMany({
        where: {
          property: {
            agentId: userId,
          },
        },
        include: {
          property: { select: { id: true, title: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Users view their own submitted inquiries
      inquiries = await prisma.inquiry.findMany({
        where: { userId },
        include: {
          property: { select: { id: true, title: true, address: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    next(error);
  }
};
