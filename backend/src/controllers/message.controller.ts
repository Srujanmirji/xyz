import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'receiverId and content are required' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        message: `You received a message from ${message.sender.name}: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Find all unique users this user has chatted with
    const sent = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    });

    const received = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
    });

    const userIds = Array.from(
      new Set([
        ...sent.map((m) => m.receiverId),
        ...received.map((m) => m.senderId),
      ])
    );

    const conversations = await Promise.all(
      userIds.map(async (otherUserId) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true, name: true, email: true, avatar: true, role: true },
        });

        const latestMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          otherUser,
          latestMessage,
        };
      })
    );

    // Sort conversations by latest message date
    conversations.sort(
      (a, b) =>
        new Date(b.latestMessage?.createdAt || 0).getTime() -
        new Date(a.latestMessage?.createdAt || 0).getTime()
    );

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'otherUserId is required' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};
