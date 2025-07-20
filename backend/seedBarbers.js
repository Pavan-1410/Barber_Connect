const mongoose = require('mongoose');
const BarberProfile = require('./models/BarberProfile');
const User = require('./models/User');
require('dotenv').config();

// Sample barbers data
const sampleBarbers = [
  {
    shopName: "Sujey's Barber Shop",
    location: {
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001"
    },
    services: [
      { name: "Haircut", price: 300, duration: 30 },
      { name: "Beard Trim", price: 150, duration: 20 },
      { name: "Hair Wash", price: 100, duration: 15 }
    ],
    rating: 4.5,
    totalReviews: 25,
    experience: 5,
    specialties: ["Modern Cuts", "Beard Styling"],
    description: "Professional barber shop with modern techniques"
  },
  {
    shopName: "Elite Cuts Studio",
    location: {
      address: "456 Park Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400002"
    },
    services: [
      { name: "Premium Haircut", price: 500, duration: 45 },
      { name: "Beard Styling", price: 200, duration: 25 },
      { name: "Hair Treatment", price: 800, duration: 60 }
    ],
    rating: 4.8,
    totalReviews: 42,
    experience: 8,
    specialties: ["Premium Cuts", "Hair Treatments"],
    description: "Premium barber shop for the modern gentleman"
  },
  {
    shopName: "Classic Barbers",
    location: {
      address: "789 Oak Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400003"
    },
    services: [
      { name: "Classic Haircut", price: 250, duration: 30 },
      { name: "Shave", price: 180, duration: 20 },
      { name: "Kids Haircut", price: 150, duration: 25 }
    ],
    rating: 4.2,
    totalReviews: 18,
    experience: 3,
    specialties: ["Classic Cuts", "Kids Haircuts"],
    description: "Traditional barber shop with classic techniques"
  },
  {
    shopName: "Urban Style Barbers",
    location: {
      address: "321 Downtown Plaza",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400004"
    },
    services: [
      { name: "Urban Haircut", price: 400, duration: 40 },
      { name: "Fade Cut", price: 350, duration: 35 },
      { name: "Hair Coloring", price: 1200, duration: 90 }
    ],
    rating: 4.6,
    totalReviews: 31,
    experience: 6,
    specialties: ["Urban Styles", "Fade Cuts"],
    description: "Modern urban barber shop with trendy styles"
  }
];

async function seedBarbers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing barber profiles
    await BarberProfile.deleteMany({});
    console.log('Cleared existing barber profiles');

    // Create sample users for barbers
    const barberUsers = [];
    for (let i = 0; i < sampleBarbers.length; i++) {
      const user = await User.create({
        name: `Barber ${i + 1}`,
        email: `barber${i + 1}@example.com`,
        password: 'password123',
        role: 'barber',
        phone: `98765432${i + 1}0`
      });
      barberUsers.push(user);
    }

    // Create barber profiles
    const barberProfiles = [];
    for (let i = 0; i < sampleBarbers.length; i++) {
      const barberProfile = await BarberProfile.create({
        userId: barberUsers[i]._id,
        ...sampleBarbers[i]
      });
      barberProfiles.push(barberProfile);
    }

    console.log(`Created ${barberProfiles.length} barber profiles`);
    console.log('Sample barbers:');
    barberProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.shopName} - ${profile.location.city}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding barbers:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBarbers(); 