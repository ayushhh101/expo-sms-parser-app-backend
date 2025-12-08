// Sample risk predictions for seeding
const mongoose = require('mongoose');
const RiskPrediction = require('./models/RiskPrediction');

const MONGO_URI = 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

async function seedRiskPredictions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing risk predictions
    await RiskPrediction.deleteMany({});
    console.log('Cleared existing risk predictions');

    const userId = 'usr_rahul_001';
    const now = new Date('2024-12-08'); // Current week
    const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Sample risk prediction matching your schema
    const riskPrediction = {
      user_id: userId,
      score: 65, // Medium-High risk
      level: 'High',
      predicted_risks: [
        {
          id: 'income_drop_week',
          severity: 'warning',
          score: 70,
          message: 'Income may drop 15% next week due to monsoon delivery slowdown',
          numbers: {
            current_weekly_avg: 6200,
            predicted_weekly: 5270,
            confidence: 0.78,
            historical_monsoon_impact: -18
          },
          category: 'income',
          time_window: {
            from: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
            to: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000) // next week
          },
          suggestion: 'Consider taking extra shifts or alternative income sources',
          persona_message: {
            en: 'Weather might slow down your deliveries next week',
            hi: 'अगले हफ्ते मौसम के कारण डिलीवरी कम हो सकती है'
          }
        },
        {
          id: 'fuel_expense_spike',
          severity: 'high',
          score: 80,
          message: 'Fuel expenses may increase by ₹400 this week',
          numbers: {
            avg_weekly_fuel: 1200,
            predicted_spike: 1600,
            petrol_price_trend: 2.5,
            extra_distance_factor: 1.3
          },
          category: 'fuel',
          time_window: {
            from: now,
            to: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          suggestion: 'Plan shorter routes and consider fuel-efficient driving',
          persona_message: {
            en: 'Petrol prices are rising, budget extra ₹400 for fuel',
            hi: 'पेट्रोल की कीमतें बढ़ रही हैं, ₹400 अतिरिक्त रखें'
          }
        },
        {
          id: 'festival_expense_risk',
          severity: 'info',
          score: 45,
          message: 'Upcoming festivals may impact savings target',
          numbers: {
            diwali_days_left: 25,
            estimated_festival_cost: 3500,
            current_savings_rate: 0.28
          },
          category: 'expense',
          time_window: {
            from: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
            to: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          },
          suggestion: 'Start micro-savings for festival expenses',
          persona_message: {
            en: 'Festival season ahead - start saving small amounts daily',
            hi: 'त्योहार का मौसम आ रहा है - रोज थोड़ा-थोड़ा बचत करें'
          }
        }
      ],
      features: {
        income_drop_prob: 0.78,
        expense_spike_ratio: 0.65,
        near_zero_prob: 0.15,
        festival_risk: 0.45,
        emi_flag: 0.0,
        savings_depletion_risk: 0.32,
        irregular_income_pattern: 0.68
      },
      forecast_next_7_days: [5800, 6100, 5900, 5200, 4800, 5400, 6000],
      computed_at: now,
      valid_until: validUntil,
      source: 'ai_risk_analyzer_v1',
      version: 1,
      feedback_flags: {
        helpful: 0,
        not_helpful: 0,
        false_positive: 0,
        acted_upon: 0
      }
    };

    // Create historical risk predictions to show trends
    const historicalPredictions = [];
    for (let i = 1; i <= 5; i++) {
      const historyDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const pastValidUntil = new Date(historyDate.getTime() + 24 * 60 * 60 * 1000);
      
      historicalPredictions.push({
        user_id: userId,
        score: Math.max(20, 65 - i * 8), // Decreasing risk over time
        level: 65 - i * 8 > 60 ? 'High' : 65 - i * 8 > 30 ? 'Medium' : 'Low',
        predicted_risks: [
          {
            id: 'income_drop_week',
            severity: 'warning',
            score: Math.max(30, 70 - i * 5),
            message: `Historical risk assessment - Day ${i}`,
            numbers: { confidence: 0.75 },
            category: 'income',
            suggestion: 'Historical data point'
          }
        ],
        features: {
          income_drop_prob: Math.max(0.3, 0.78 - i * 0.1),
          expense_spike_ratio: Math.max(0.2, 0.65 - i * 0.08),
          near_zero_prob: 0.15,
          festival_risk: 0.45,
          emi_flag: 0.0
        },
        computed_at: historyDate,
        valid_until: pastValidUntil,
        source: 'ai_risk_analyzer_v1',
        version: 1
      });
    }

    // Insert all predictions
    const allPredictions = [riskPrediction, ...historicalPredictions];
    await RiskPrediction.insertMany(allPredictions);
    console.log(`Created ${allPredictions.length} risk predictions`);

    // Display summary
    const latestPrediction = await RiskPrediction.getLatestValidPrediction(userId);
    console.log('Latest Risk Prediction:', {
      score: latestPrediction.score,
      level: latestPrediction.level,
      totalRisks: latestPrediction.predicted_risks.length,
      criticalRisks: latestPrediction.getRisksBySeverity('critical').length,
      highRisks: latestPrediction.getRisksBySeverity('high').length,
      isValid: latestPrediction.isValid
    });

    await mongoose.disconnect();
    console.log('Risk prediction seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding risk predictions:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedRiskPredictions();
}

module.exports = seedRiskPredictions;