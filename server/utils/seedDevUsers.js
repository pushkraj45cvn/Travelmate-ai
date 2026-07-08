const User = require('../models/User');

const devUsers = [
  {
    name: 'Demo User',
    email: 'demo@travelmate.com',
    password: 'Demo1234',
    role: 'user',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Admin User',
    email: 'admin@travelmate.com',
    password: 'Admin1234',
    role: 'admin',
    isVerified: true,
    isActive: true,
  },
];

const seedDevUsers = async () => {
  if (process.env.NODE_ENV === 'production') return;

  for (const userData of devUsers) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      await User.create(userData);
      console.log(`Dev user created: ${userData.email}`.green);
    }
  }
};

module.exports = { seedDevUsers };
