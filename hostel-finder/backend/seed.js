// seed.js
// Run with: node seed.js
// Seeds the database with 2 test users and 8 realistic listings.
// ⚠️  DELETES all existing data before inserting — dev use only!

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Listing = require('./models/Listing');
const Message = require('./models/Message');

const connectDB = require('./config/db');

// ── Sample Users ──────────────────────────────────────────────────────────────
const users = [
  {
    name: 'John Kamau',
    email: 'landlord@test.com',
    password: 'password123',
    role: 'landlord',
    phone: '+254712345678',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Grace Wanjiku',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    phone: '+254723456789',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    name: 'Peter Ochieng',
    email: 'landlord2@test.com',
    password: 'password123',
    role: 'landlord',
    phone: '+254734567890',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
];

// ── Seeder Function ───────────────────────────────────────────────────────────
const seedDB = async () => {
  await connectDB();

  console.log('⚠️  Clearing existing data...');
  await User.deleteMany();
  await Listing.deleteMany();
  await Message.deleteMany();

  console.log('👤 Creating users...');
  // Hash passwords manually (model hook doesn't run on insertMany)
  const salt = await bcrypt.genSalt(12);
  const hashedUsers = await Promise.all(
    users.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, salt),
    }))
  );
  const createdUsers = await User.insertMany(hashedUsers);
  const landlord1 = createdUsers[0];
  const landlord2 = createdUsers[2];

  console.log('🏠 Creating listings...');
  const listings = [
    {
      title: 'Modern Bedsitter Near University of Nairobi',
      description:
        'Fully furnished bedsitter ideal for university students. Walking distance to UoN main campus. Safe neighborhood with 24-hour security. The unit features tiled floors, a built-in wardrobe, and a private bathroom. Shared kitchen available on each floor.',
      price: 8500,
      location: 'Ngara, Nairobi',
      coordinates: { latitude: -1.2768, longitude: 36.8272 },
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
      ],
      amenities: ['WiFi', 'Water', 'Electricity', 'Security', 'Parking'],
      type: 'bedsitter',
      landlord: landlord1._id,
    },
    {
      title: 'Spacious Single Room - Rongai Town Centre',
      description:
        'Clean and airy single room located minutes from Ongata Rongai stage. Perfect for working professionals and students. Comes with inbuilt wardrobe, window burglar proof, and ample natural light. Shared ablution block kept very clean.',
      price: 5500,
      location: 'Ongata Rongai, Kajiado',
      coordinates: { latitude: -1.3986, longitude: 36.7444 },
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      ],
      amenities: ['Water', 'Electricity', 'Security', 'Shared Kitchen'],
      type: 'single-room',
      landlord: landlord1._id,
    },
    {
      title: 'Self-Contained Studio Apartment - Westlands',
      description:
        'Fully self-contained modern studio in the heart of Westlands. Ideal for working professionals. Comes with open-plan kitchen, en-suite bathroom, and a balcony. The building has a backup generator, CCTV, and a caretaker on site.',
      price: 22000,
      location: 'Westlands, Nairobi',
      coordinates: { latitude: -1.2634, longitude: 36.8034 },
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      ],
      amenities: ['WiFi', 'Water', 'Electricity', 'Security', 'Backup Generator', 'CCTV', 'Balcony'],
      type: 'studio',
      landlord: landlord1._id,
    },
    {
      title: 'Budget Hostel Room - Kahawa West',
      description:
        'Affordable hostel accommodation near JKUAT. 2-person sharing rooms available. Communal kitchen and bathrooms are cleaned daily. Borehole water supply ensures 24-hour water access. Fitted with reliable Wi-Fi for studying.',
      price: 3500,
      location: 'Kahawa West, Nairobi',
      coordinates: { latitude: -1.1793, longitude: 36.9261 },
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      ],
      amenities: ['WiFi', 'Water', 'Electricity', 'Shared Kitchen', 'Study Room'],
      type: 'hostel',
      landlord: landlord2._id,
    },
    {
      title: 'Cozy Bedsitter - South B, Nairobi',
      description:
        'Well-maintained bedsitter in a quiet South B estate. Very secure estate with controlled entry. Close to major supermarkets, hospitals, and public transport. Caretaker on-site. Previous tenants have stayed 2+ years — testament to the quality.',
      price: 12000,
      location: 'South B, Nairobi',
      coordinates: { latitude: -1.3100, longitude: 36.8326 },
      images: [
        'https://images.unsplash.com/photo-1560185127-6a206a4a6ef4?w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      ],
      amenities: ['Water', 'Electricity', 'Security', 'Caretaker', 'Parking'],
      type: 'bedsitter',
      landlord: landlord2._id,
    },
    {
      title: 'One Bedroom Apartment - Kilimani',
      description:
        'Spacious 1-bedroom apartment in prestigious Kilimani. Perfect for young couples or single professionals. Features a modern kitchen with built-in cabinets, a large living area, and a master bedroom with en-suite. Quiet and well-managed building.',
      price: 35000,
      location: 'Kilimani, Nairobi',
      coordinates: { latitude: -1.2901, longitude: 36.7796 },
      images: [
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
      ],
      amenities: ['WiFi', 'Water', 'Electricity', 'Security', 'Backup Generator', 'Parking', 'Gym', 'Swimming Pool'],
      type: 'one-bedroom',
      landlord: landlord2._id,
    },
    {
      title: 'Cheap Single Room - Githurai 44',
      description:
        'Affordable single room accommodation ideal for students and low-income earners. Borehole water available. Located near main road for easy matatu access. Shared facilities are neat and orderly. Only a few units remaining.',
      price: 3000,
      location: 'Githurai 44, Nairobi',
      coordinates: { latitude: -1.1621, longitude: 36.9334 },
      images: [
        'https://images.unsplash.com/photo-1607004468138-e7a9f1ded85e?w=800',
      ],
      amenities: ['Water', 'Electricity', 'Shared Kitchen'],
      type: 'single-room',
      landlord: landlord1._id,
    },
    {
      title: 'Modern Hostel - Thika Road, Near TRM',
      description:
        'Brand new hostel facility near Thika Road Mall. Designed specifically for campus students with dedicated study areas, fast internet, and lounge spaces. Single and sharing rooms available. CCTV throughout the compound.',
      price: 6000,
      location: 'Roysambu, Nairobi',
      coordinates: { latitude: -1.2212, longitude: 36.8890 },
      images: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800',
        'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800',
      ],
      amenities: ['WiFi', 'Water', 'Electricity', 'Security', 'CCTV', 'Study Room', 'Lounge'],
      type: 'hostel',
      landlord: landlord2._id,
    },
  ];

  await Listing.insertMany(listings);

  console.log(`
✅ Database seeded successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Test Accounts:
   Landlord:  landlord@test.com / password123
   Student:   student@test.com  / password123
   Landlord2: landlord2@test.com / password123

🏠 Listings: ${listings.length} listings created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  process.exit(0);
};

seedDB().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
