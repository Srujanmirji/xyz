import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId, date, timeSlot, message } = req.body;
    const userId = req.user?.id;

    if (!userId || !propertyId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Required fields (propertyId, date, timeSlot) are missing' });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const parsedDate = new Date(date);

    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId,
        date: parsedDate,
        timeSlot,
        message: message || '',
        status: 'PENDING',
      },
      include: {
        property: {
          select: { title: true, address: true },
        },
      },
    });

    // Notify agent of new booking
    await prisma.notification.create({
      data: {
        userId: property.agentId,
        title: 'New Viewing Request',
        message: `A client has requested a tour for "${property.title}" on ${parsedDate.toDateString()} during the ${timeSlot.toLowerCase()} slot.`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Viewing request submitted successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let bookings;

    if (role === 'ADMIN') {
      bookings = await prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          property: { include: { images: true } },
        },
        orderBy: { date: 'asc' },
      });
    } else if (role === 'AGENT') {
      bookings = await prisma.booking.findMany({
        where: {
          property: {
            agentId: userId,
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          property: { include: { images: true } },
        },
        orderBy: { date: 'asc' },
      });
    } else {
      // Regular user: can have both bookings they made and bookings on properties they listed
      bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { userId },
            { property: { agentId: userId } }
          ]
        },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          property: {
            include: {
              images: true,
              agent: { select: { id: true, name: true, email: true, avatar: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // CONFIRMED or REJECTED

    if (!status || !['CONFIRMED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: { select: { title: true, agentId: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Agent or Admin auth check
    if (req.user?.role !== 'ADMIN' && booking.property.agentId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: 'Viewing Request Update',
        message: `Your tour request for "${booking.property.title}" has been ${status.toLowerCase()}.`,
      },
    });

    res.status(200).json({
      success: true,
      message: `Booking has been ${status.toLowerCase()}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
