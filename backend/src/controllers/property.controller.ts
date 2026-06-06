import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { PropertyStatus } from '@prisma/client';

export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      price,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      area,
      type,
      amenities,
      images,
      virtualTourUrl,
      featured,
    } = req.body;

    if (!title || !price || !address || !city || !type) {
      return res.status(400).json({ success: false, message: 'Required fields (title, price, address, city, type) are missing' });
    }

    const agentId = req.user?.id;
    if (!agentId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Default status: PENDING for agents, APPROVED if created by admin
    const status = req.user?.role === 'ADMIN' ? PropertyStatus.APPROVED : PropertyStatus.PENDING;

    const property = await prisma.property.create({
      data: {
        title,
        description: description || '',
        price: parseFloat(price),
        address,
        city,
        state: state || '',
        country: country || 'US',
        latitude: latitude ? parseFloat(latitude) : 34.0522, // Default LA
        longitude: longitude ? parseFloat(longitude) : -118.2437,
        bedrooms: bedrooms ? parseInt(bedrooms) : 0,
        bathrooms: bathrooms ? parseInt(bathrooms) : 0,
        area: area ? parseInt(area) : 0,
        type,
        status,
        featured: featured === true || featured === 'true',
        virtualTourUrl: virtualTourUrl || null,
        amenities: Array.isArray(amenities) ? amenities : amenities ? amenities.split(',').map((s: string) => s.trim()) : [],
        agentId,
        images: {
          create: Array.isArray(images)
            ? images.map((url: string) => ({ imageUrl: url }))
            : [{ imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' }],
        },
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      message: status === 'APPROVED' ? 'Property listed successfully' : 'Property submitted for approval',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      city,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      featured,
      status,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Filter conditions
    const where: any = {};

    // Approved by default, unless status query overrides it (e.g. for agents/admin)
    if (status) {
      where.status = status as PropertyStatus;
    } else {
      where.status = PropertyStatus.APPROVED;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { equals: city as string, mode: 'insensitive' };
    }

    if (type && type !== 'Property Type') {
      where.type = { equals: type as string, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms as string) };
    }

    if (bathrooms) {
      where.bathrooms = { gte: parseInt(bathrooms as string) };
    }

    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseInt(minArea as string);
      if (maxArea) where.area.lte = parseInt(maxArea as string);
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'area-desc') {
      orderBy = { area: 'desc' };
    }

    const total = await prisma.property.count({ where });
    const properties = await prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        images: true,
        agent: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        agent: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Auth check: User is either the Agent who owns it or Admin
    if (req.user?.role !== 'ADMIN' && property.agentId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this property' });
    }

    const {
      title,
      description,
      price,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      area,
      type,
      status,
      amenities,
      images,
      virtualTourUrl,
      featured,
    } = req.body;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        area: area ? parseInt(area) : undefined,
        type: type || undefined,
        status: status || undefined,
        featured: featured !== undefined ? featured === true || featured === 'true' : undefined,
        virtualTourUrl: virtualTourUrl || undefined,
        amenities: Array.isArray(amenities) ? amenities : amenities ? amenities.split(',').map((s: string) => s.trim()) : undefined,
      },
    });

    // Handle image updates if images are provided
    if (Array.isArray(images)) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      await prisma.propertyImage.createMany({
        data: images.map((url: string) => ({ propertyId: id, imageUrl: url })),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (req.user?.role !== 'ADMIN' && property.agentId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const approveProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status (APPROVED or REJECTED) is required' });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status: status as PropertyStatus },
    });

    // Notify agent
    await prisma.notification.create({
      data: {
        userId: property.agentId,
        title: `Property Status Update`,
        message: `Your listing "${property.title}" has been ${status.toLowerCase()} by the platform administrator.`,
      },
    });

    res.status(200).json({
      success: true,
      message: `Property has been ${status.toLowerCase()}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user?.id;

    if (!userId || !propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_propertyId: { userId, propertyId } },
      });
      return res.status(200).json({ success: true, message: 'Removed from favorites', favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId, propertyId },
      });
      return res.status(200).json({ success: true, message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: true,
          },
        },
      },
    });

    const list = favorites.map((fav) => fav.property);

    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId, rating, review } = req.body;
    const userId = req.user?.id;

    if (!userId || !propertyId || !rating || !review) {
      return res.status(400).json({ success: false, message: 'All fields (propertyId, rating, review) are required' });
    }

    const newReview = await prisma.review.create({
      data: {
        userId,
        propertyId,
        rating: parseInt(rating),
        review,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Review added successfully', data: newReview });
  } catch (error) {
    next(error);
  }
};

export const getAIPredictions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Generate simulated AI property recommendations matching properties list
    const properties = await prisma.property.findMany({
      where: { status: PropertyStatus.APPROVED },
      take: 3,
      include: { images: true },
    });

    res.status(200).json({
      success: true,
      message: 'AI recommendations compiled successfully',
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};
