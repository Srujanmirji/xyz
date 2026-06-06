import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'xyz_homes_secret_jwt_key_2026';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password) are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Allow setting role in dev/testing, default to USER
    let userRole: Role = Role.USER;
    if (role && Object.values(Role).includes(role as Role)) {
      userRole = role as Role;
    }

    const defaultAvatars = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBBlkv4g9X0XcOaOHPU9JD0I2vM7RHcaJt8rF3dK0yjBzIZ6YqZG6asDvzylsnUQUm2sjRVEb3hsx4_VBY9dsPFGZhEHF_3PIneysiJawGWGl1Twpi-w1qvFcULBccrteK0TRggRGaLOZV5w3DbxXgil4JFc_AbXVm6O0VEGBCGJ2NcylZbkTGkJCgbf5gBArmXoxywMsp82i4fJRYTslvowfYYA_vIgnHubKr24d4oSff_2Ir5t53JYbnug-els730lpGBt97ajJM',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    ];
    const avatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, avatar, token: googleToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Google email and name are required' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const generatedPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          avatar: avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBlkv4g9X0XcOaOHPU9JD0I2vM7RHcaJt8rF3dK0yjBzIZ6YqZG6asDvzylsnUQUm2sjRVEb3hsx4_VBY9dsPFGZhEHF_3PIneysiJawGWGl1Twpi-w1qvFcULBccrteK0TRggRGaLOZV5w3DbxXgil4JFc_AbXVm6O0VEGBCGJ2NcylZbkTGkJCgbf5gBArmXoxywMsp82i4fJRYTslvowfYYA_vIgnHubKr24d4oSff_2Ir5t53JYbnug-els730lpGBt97ajJM',
          role: Role.USER,
        },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name, avatar, phone, bio, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        avatar: avatar || undefined,
        phone: phone !== undefined ? phone : undefined,
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        onboardingCompleted: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { avatar, phone, bio, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        avatar: avatar || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        location: location || undefined,
        onboardingCompleted: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        onboardingCompleted: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Mock link generation
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email address.',
      token: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' }), // returning it so the frontend can mock redirect easily
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
  }
};
