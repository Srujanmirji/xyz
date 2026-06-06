import { PrismaClient, Role, PropertyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed operation...');

  // 1. Clean existing records (optional, but good for idempotent seeds)
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing database records.');

  // 2. Create Users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@xyzhomes.com',
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    },
  });

  const agent = await prisma.user.create({
    data: {
      name: 'Marcus Richardson',
      email: 'agent@xyzhomes.com',
      password: hashedPassword,
      role: Role.AGENT,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSkicAybPR0ud2JzGfxqMUYrfRuNI2r4WV_Iy0fWszVDXW9mdSnw-OlGJeFfmKtonA0-Wx4m92TOcwNF6S-QS6YpKxyo0BqS9tW88Mz75Q2YGMobN4FFFaR9nC3gzsVGJvVCb0EHlkiLKJ05SHA6o9aYfYeZ3b9GDNWhLnd_6j5j1-m1ZO24FzHgp7Rm0hmiCXgxVna-jcJkvPS5dy46hVAeK8GR9AE1D8sllHYFMoKMKS5h4dLpXFEEWKGdmqg7Ib7KNPB3eKIBk',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@xyzhomes.com',
      password: hashedPassword,
      role: Role.USER,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACKaOeOpLUyLIUjGmqUTe5QtBj6UGepUiAAdwEejW3ZJEsDm4uku-rKvlerfagNlAOsXVW09JA3TrJMKeLYHUaLqn_VYU3TF3XmjSS3Q1sMsUTQw2Ytv_fRJPrgtWfdKOf_RSOy8O3-evSzXkyZufvQgatU0ueDRzmKg7qnXz-qNwBlpK5aYQZ30LR0hzE6izDSr2w2az4HG44Kgwvg2Xoc7q374yIStKuIrbAHU1iUw6oYAr7cZuW-v1hVY5x4tqdEH_VwwBLrrc',
    },
  });

  console.log('👤 Created default accounts:');
  console.log('   - Admin: admin@xyzhomes.com / password123');
  console.log('   - Agent: agent@xyzhomes.com / password123');
  console.log('   - User:  user@xyzhomes.com / password123');

  // 3. Create properties
  const p1 = await prisma.property.create({
    data: {
      title: 'Azure Heights',
      description: 'An ultra-modern minimalist luxury villa with a glowing infinity pool at night. The architecture is sharp and cubic with floor-to-ceiling glass windows showing warm interior light.',
      price: 2450000,
      address: '90210 Crestview Drive',
      city: 'Los Angeles',
      state: 'CA',
      country: 'US',
      latitude: 34.0522,
      longitude: -118.2437,
      bedrooms: 4,
      bathrooms: 3,
      area: 3200,
      type: 'Villa',
      status: PropertyStatus.APPROVED,
      featured: true,
      virtualTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      amenities: ['Infinity Pool', 'Home Automation', 'Glass Facades', 'Security System', 'Wine Cellar'],
      agentId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUoi8G7t4Pv64fs3j-EY2AbDJV87MS8mkOxvH4Zw49rbw4iEb99URZnrhVW5v0PGPplGZwmxR5yKbVTMabg9dsFTposRrO_b3x8NJQgwkOuZ6e8W76gBHsZgTgst_Qml_b1jZfCBrQw6hjtAh3Z0j4ZWZu8S1hdFonqSjBrQCQr1xk0xVxWv6_R1wzHSWNBh4LsvcBcHBxhH3BHg4N-9jVFCBDoT8M9bRJcBOnguldf0-NLpC7L9z931Hf_jlxOyCYAXSS0N1SE_Y' }
        ]
      }
    }
  });

  const p2 = await prisma.property.create({
    data: {
      title: 'The Oasis Villa',
      description: 'A bright, airy contemporary coastal home with white-washed walls and expansive wooden decks overlooking a turquoise ocean. Soft natural daylight floods the scene.',
      price: 1890000,
      address: '44 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      country: 'US',
      latitude: 25.7617,
      longitude: -80.1918,
      bedrooms: 5,
      bathrooms: 4,
      area: 4100,
      type: 'Villa',
      status: PropertyStatus.APPROVED,
      featured: true,
      virtualTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      amenities: ['Private Beach Access', 'Ocean View', 'Sun Deck', 'Smart Climate Control', 'Gated Community'],
      agentId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2-H7a3hRtnfzVnLgMcQy2N9rnwjLNMw7VVWHZcbxlfiANAVXUEUC2a_V9BhlJKk7sfz-DaF5KnOyUxoV27DVn7jg3doOkV40Vn6oQtibLY00U_VN8buD6kZ97xtmZJlRi_NJwTxs2hE8iSc2eg1leRbvQnCVdvg3V62fUVt260P456pSvQviMyxiwRGiUsFZ-v_rpk-dgFTUhnr4Kuu1yMD4BtPE-I7VC5T2c9DBZDpjNy2ePHus0K9eHNLWtbHc1lrjIWIyWST8' }
        ]
      }
    }
  });

  const p3 = await prisma.property.create({
    data: {
      title: 'Willow Creek',
      description: 'An elegant, modern suburban house with a large glass facade and dark charcoal accents, set against a lush green park landscape during a bright sunny morning.',
      price: 950000,
      address: '712 Willow Bend Rd',
      city: 'Austin',
      state: 'TX',
      country: 'US',
      latitude: 30.2672,
      longitude: -97.7431,
      bedrooms: 3,
      bathrooms: 2,
      area: 2400,
      type: 'House',
      status: PropertyStatus.APPROVED,
      featured: true,
      virtualTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      amenities: ['Large Garden', 'Garage', 'Solar Panels', 'Hardwood Floors', 'Fireplace'],
      agentId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-o16fHXboqUOBIkaqmXML9KtOmCW0NPyh-u5MaKHhD6LnoV2TGpi1yWyESbDvevSKdS7qPdqzmHw3S2mrOjf84LMNb5pblTK2pDAGwQY-JLvvJLHwtSIQCnLvofffFd07GiS4BrfRm-fuXDk9cjILZscTpSh8QFkBbeVEJb2Bc8sgNYimQkcL_kjGw-JOBIeZNejSvRh7frGe6xzfoqv28vrNRWP64_pTVE34sUoiH_5XN8JUgDSwNACuJLPur09EBLlPp7UGgyA' }
        ]
      }
    }
  });

  const p4 = await prisma.property.create({
    data: {
      title: 'The Glass Pavilion',
      description: 'Experience the pinnacle of modern living. Schedule your private walkthrough of this architectural masterpiece in the heart of the hills.',
      price: 4200000,
      address: '742 Evergreen Terrace',
      city: 'Skywood',
      state: 'CA',
      country: 'US',
      latitude: 34.0522,
      longitude: -118.2437,
      bedrooms: 4,
      bathrooms: 3,
      area: 3200,
      type: 'Villa',
      status: PropertyStatus.APPROVED,
      featured: false,
      virtualTourUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      amenities: ['Cantilevered Pools', 'Backyard Firepit', 'Custom Kitchen', 'Guest House', 'Home Theater'],
      agentId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVD0XzqukZjQGJ753ZOt5tBQhVAM07PjDMt1EFsJ_MJlyoIjcs7L2acyUWJsr3kJc7sqcMNCRBKYT9wL2H1AcyVlboT_MfgCx5KTB_odKqAsGnt4UKCSdSvtWMZEg8Usl4-5Hz3eRTalwZBCibFO211nxN1AyTPDS4wIPm25uiiKpbjqDr8oYBRQfyaf4J0aifjvVGc-cB0mNfUAEOrIz7LBoC-MRqCq5nCv9JOfMAEwd4VHLWwPtDOVEtyHZjPGUjOT83D4ngnMs' }
        ]
      }
    }
  });

  const p5 = await prisma.property.create({
    data: {
      title: 'Skyline Penthouse',
      description: 'Luxury high-rise apartment in the heart of downtown with full 360-degree city skyline views, featuring custom marble finishes and a private terrace.',
      price: 3100000,
      address: '500 Grand Ave Apt 40B',
      city: 'Los Angeles',
      state: 'CA',
      country: 'US',
      latitude: 34.0494,
      longitude: -118.2541,
      bedrooms: 3,
      bathrooms: 3.5,
      area: 2800,
      type: 'Apartment',
      status: PropertyStatus.PENDING,
      featured: false,
      virtualTourUrl: null,
      amenities: ['24/7 Concierge', 'Valet Parking', 'Rooftop Pool', 'Fitness Center', 'Private Elevator'],
      agentId: agent.id,
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    }
  });

  console.log('🏠 Seeded 5 properties.');

  // 4. Create Reviews
  await prisma.review.create({
    data: {
      userId: user.id,
      propertyId: p1.id,
      rating: 5,
      review: "The process was incredibly smooth. XYZ Homes provided us with options we didn't even know were on the market. Highly recommended!",
    }
  });

  await prisma.review.create({
    data: {
      userId: user.id,
      propertyId: p2.id,
      rating: 5,
      review: "Minimalist, efficient, and extremely helpful. The search tools are leagues ahead of other platforms. Found my dream apartment in a week.",
    }
  });

  console.log('⭐️ Added sample reviews.');

  // 5. Create Favorite
  await prisma.favorite.create({
    data: {
      userId: user.id,
      propertyId: p1.id,
    }
  });

  await prisma.favorite.create({
    data: {
      userId: user.id,
      propertyId: p2.id,
    }
  });

  console.log('❤️ Added default user favorites.');

  // 6. Create default notifications
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Welcome to XYZ Homes!',
      message: 'Explore our handpicked premium listings and schedule a private visit today.',
    }
  });

  console.log('🔔 Created default notifications.');

  console.log('🎉 Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
