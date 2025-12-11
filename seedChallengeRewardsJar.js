const mongoose = require('mongoose');
const SavingsJar = require('./models/SavingsJar');

const MONGODB_URI = 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

async function seedChallengeRewardsJar() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userId = 'usr_rahul_001';

    // Check if Challenge Rewards jar already exists
    const existingJar = await SavingsJar.findOne({ 
      userId, 
      title: 'Challenge Rewards'
    });

    if (existingJar) {
      console.log('⚠️  Challenge Rewards jar already exists for user:', userId);
      console.log('   Jar ID:', existingJar._id);
      console.log('   Current Saved:', `₹${existingJar.saved}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create the infinite Challenge Rewards jar
    const challengeJar = await SavingsJar.create({
      userId: userId,
      title: 'Challenge Rewards',
      target: 999999999, // Infinite target (₹9,999,999.99)
      saved: 0,
      deadline: new Date('2099-12-31'), // Far future date
      status: 'active',
      icon: 'trophy',
      color: '#F59E0B',
      bg: 'bg-amber-900',
      transactions: []
    });

    console.log('\n✅ Challenge Rewards jar created successfully!');
    console.log('   Jar ID:', challengeJar._id);
    console.log('   User:', userId);
    console.log('   Target:', `₹${(challengeJar.target).toLocaleString()}`);
    console.log('   Initial Saved:', `₹${challengeJar.saved}`);
    console.log('   Status:', challengeJar.status);
    console.log('\n💡 This jar will automatically collect all challenge rewards!');

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedChallengeRewardsJar();
