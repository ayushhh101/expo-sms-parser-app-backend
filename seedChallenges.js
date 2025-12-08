// Sample challenges data for seeding
const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');

const MONGO_URI = 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

async function seedChallenges() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing challenges
    await Challenge.deleteMany({});
    console.log('Cleared existing challenges');

    const userId = 'usr_rahul_001'; // From your seed data
    const today = new Date('2024-12-08'); // Current week
    
    // Today's challenges (matching your UI)
    const todaysChallenges = [
      {
        challengeId: `challenge_${today.getTime()}_save25`,
        userId,
        title: 'Save ₹25 today',
        description: 'Put aside a small amount',
        category: 'saving',
        targetAmountPaise: 2500, // ₹25
        rewardAmountPaise: 2500, // +₹25 towards savings
        difficulty: 'easy',
        priority: 5,
        status: 'completed' // Already completed in UI
      },
      {
        challengeId: `challenge_${today.getTime()}_skip_food`,
        userId,
        title: 'Skip one food order',
        description: 'Cook at home or eat packed lunch',
        category: 'spending',
        targetAmountPaise: 15000, // Save ₹150 
        rewardAmountPaise: 15000,
        difficulty: 'medium',
        priority: 4,
        status: 'pending'
      },
      {
        challengeId: `challenge_${today.getTime()}_use_bus`,
        userId,
        title: 'Use bus instead of auto',
        description: 'Save on transportation today',
        category: 'transport',
        targetAmountPaise: 3000, // Save ₹30
        rewardAmountPaise: 3000,
        difficulty: 'easy',
        priority: 3,
        status: 'pending'
      },
      {
        challengeId: `challenge_${today.getTime()}_festival`,
        userId,
        title: 'Festival jar deposit',
        description: 'Add to your Diwali fund',
        category: 'saving',
        targetAmountPaise: 5000, // ₹50
        rewardAmountPaise: 5000,
        difficulty: 'easy',
        priority: 2,
        status: 'pending'
      }
    ];

    // Create challenges for past week to show streak
    const pastChallenges = [];
    for (let i = 1; i <= 7; i++) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - i);
      
      pastChallenges.push({
        challengeId: `challenge_${pastDate.getTime()}_daily_${i}`,
        userId,
        title: `Day ${i} - Save ₹30`,
        description: 'Daily savings challenge',
        category: 'saving',
        targetAmountPaise: 3000,
        rewardAmountPaise: 3000,
        difficulty: 'easy',
        priority: 3,
        status: i <= 3 ? 'completed' : 'failed', // 3-day streak
        dateAssigned: pastDate,
        completedAt: i <= 3 ? pastDate : null
      });
    }

    // Combine all challenges
    const allChallenges = [...todaysChallenges, ...pastChallenges];

    // Insert challenges
    await Challenge.insertMany(allChallenges);
    console.log(`Created ${allChallenges.length} challenges`);

    // Display today's challenges summary
    const stats = await Challenge.getUserStats(userId);
    console.log('Challenge Stats:', {
      completedChallenges: stats.stats.completed?.count || 0,
      currentStreak: stats.currentStreak,
      totalSaved: `₹${Math.floor(stats.stats.completed?.totalSavedPaise / 100) || 0}`
    });

    await mongoose.disconnect();
    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding challenges:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedChallenges();
}

module.exports = seedChallenges;