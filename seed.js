const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Goal = require('./models/Goal');
const LifeEvent = require('./models/LifeEvent');
const Challenge = require('./models/Challenge');

// MongoDB connection string - update with your actual connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Goal.deleteMany({});
    await LifeEvent.deleteMany({});
    await Challenge.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ========== USER DATA ==========
    const userData = {
      userId: "usr_rahul_001",
      name: "Rahul Kumar",
      age: 26,
      city: "Bangalore",
      phone: "+919876543210",
      preferred_language: "hindi",
      onboarding_completed_at: new Date("2024-11-01T10:30:00"),

      permissions: {
        sms_access: true,
        notifications: true,
        location: true
      },

      work_profile: {
        primary_work_type: "food_delivery",
        platforms: ["Swiggy", "Zomato"],
        work_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        off_days: ["sunday"],
        total_weekly_hours: 66,
        avg_daily_hours_weekday: 11,
        avg_daily_hours_weekend: 10
      },

      financial_profile: {
        monthly_income: {
          estimatedAmountPaise: 2800000,  // ₹28,000
          stability: "variable",
          sources: ["gig_delivery"]
        },

        fixed_monthly_expenses: {
          rentPaise: 600000,  // ₹6,000
          electricity_waterPaise: 80000,  // ₹800
          phone_internetPaise: 29900,  // ₹299
          totalPaise: 709900
        },

        variable_monthly_expenses: {
          food_groceriesPaise: 450000,  // ₹4,500
          fuel_maintenancePaise: 600000,  // ₹6,000
          entertainment_otherPaise: 200000,  // ₹2,000
          totalPaise: 1250000
        },

        total_monthly_expensesPaise: 1959900,
        potential_monthly_savingsPaise: 840100,

        analytics: {
          work_days_per_week: 6,
          total_weekly_hours: 66,
          estimated_hourly_ratePaise: 10606,
          income_expense_ratio: 1.43,
          savings_rate_percent: 30
        }
      },

      ai_context: {
        context_service: "Food delivery rider working 6 days/week on Swiggy and Zomato. Manages variable daily income with consistent fuel and food expenses.",
        saving_context: "Trying to save ₹8,000-9,000 monthly. Main savings goal is buying a new smartphone.",
        goal_context: "Wants to purchase smartphone worth ₹15,000 in 2 months. Needs to save ₹7,500 per month.",
        current_stat_context: "Earning ₹900-1,100 daily. Spending ₹450-550 on fuel and food daily.",
        daily_spend_context_goal: "Keep daily expenses under ₹550 to meet savings target.",
        monthly_spend_context_goal: "Target monthly expenses: ₹19,500. Currently on track."
      },

      createdAt: new Date("2024-11-01T10:30:00"),
      updatedAt: new Date("2024-12-08T08:00:00")
    };

    const user = await User.create(userData);
    console.log('👤 Created user:', user.userId);

    // ========== TRANSACTIONS DATA (7 days) ==========
    const transactionsData = [
      {
        txId: "tx_00001",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000001",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Local Chai Stall",
        method: "cash",
        timestamp: new Date("2024-12-08T15:15:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Morning chai and biscuit",
        synced: true,
        createdAt: new Date("2024-12-08T15:15:00"),
        updatedAt: new Date("2024-12-08T15:15:00")
      },
      {
        txId: "tx_00002",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000002",
        type: "expense",
        amountPaise: 12000,
        category: "food",
        merchant: "Annapurna Mess",
        method: "upi",
        timestamp: new Date("2024-12-08T19:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Lunch thali",
        synced: true,
        createdAt: new Date("2024-12-08T19:30:00"),
        updatedAt: new Date("2024-12-08T19:30:00")
      },
      {
        txId: "tx_00003",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000003",
        type: "expense",
        amountPaise: 3000,
        category: "food",
        merchant: "Street Vendor",
        method: "cash",
        timestamp: new Date("2024-12-08T23:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Evening chai",
        synced: true,
        createdAt: new Date("2024-12-08T23:45:00"),
        updatedAt: new Date("2024-12-08T23:45:00")
      },
      {
        txId: "tx_00004",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000004",
        type: "expense",
        amountPaise: 9000,
        category: "food",
        merchant: "Home cooking",
        method: "cash",
        timestamp: new Date("2024-12-07T02:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Dinner groceries",
        synced: true,
        createdAt: new Date("2024-12-07T02:30:00"),
        updatedAt: new Date("2024-12-07T02:30:00")
      },
      {
        txId: "tx_00005",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000005",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Udupi Cafe",
        method: "cash",
        timestamp: new Date("2024-12-07T12:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Morning breakfast",
        synced: true,
        createdAt: new Date("2024-12-07T12:45:00"),
        updatedAt: new Date("2024-12-07T12:45:00")
      },
      {
        txId: "tx_00006",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000006",
        type: "expense",
        amountPaise: 15000,
        category: "fuel",
        merchant: "HP Petrol Pump",
        method: "upi",
        timestamp: new Date("2024-12-07T13:20:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Bike fuel",
        synced: true,
        createdAt: new Date("2024-12-07T13:20:00"),
        updatedAt: new Date("2024-12-07T13:20:00")
      },
      {
        txId: "tx_00007",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000007",
        type: "income",
        amountPaise: 38500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-07T18:15:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "12 deliveries morning shift",
        synced: true,
        createdAt: new Date("2024-12-07T18:15:00"),
        updatedAt: new Date("2024-12-07T18:15:00")
      },
      {
        txId: "tx_00008",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000008",
        type: "expense",
        amountPaise: 7000,
        category: "food",
        merchant: "Punjabi Dhaba",
        method: "cash",
        timestamp: new Date("2024-12-07T19:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Lunch",
        synced: true,
        createdAt: new Date("2024-12-07T19:45:00"),
        updatedAt: new Date("2024-12-07T19:45:00")
      },
      {
        txId: "tx_00009",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000009",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Tea Stall",
        method: "cash",
        timestamp: new Date("2024-12-07T23:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Evening tea break",
        synced: true,
        createdAt: new Date("2024-12-07T23:30:00"),
        updatedAt: new Date("2024-12-07T23:30:00")
      },
      {
        txId: "tx_00010",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000010",
        type: "income",
        amountPaise: 54800,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-06T02:45:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "18 deliveries evening shift",
        synced: true,
        createdAt: new Date("2024-12-06T02:45:00"),
        updatedAt: new Date("2024-12-06T02:45:00")
      },
      {
        txId: "tx_00011",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000011",
        type: "expense",
        amountPaise: 9500,
        category: "food",
        merchant: "Biryani Point",
        method: "upi",
        timestamp: new Date("2024-12-06T03:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Dinner",
        synced: true,
        createdAt: new Date("2024-12-06T03:30:00"),
        updatedAt: new Date("2024-12-06T03:30:00")
      },
      {
        txId: "tx_00012",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000012",
        type: "expense",
        amountPaise: 10000,
        category: "fuel",
        merchant: "Indian Oil",
        method: "cash",
        timestamp: new Date("2024-12-06T04:10:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Late fuel top-up",
        synced: true,
        createdAt: new Date("2024-12-06T04:10:00"),
        updatedAt: new Date("2024-12-06T04:10:00")
      },
      {
        txId: "tx_00013",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000013",
        type: "expense",
        amountPaise: 4500,
        category: "food",
        merchant: "South Indian Cafe",
        method: "cash",
        timestamp: new Date("2024-12-06T12:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Idli breakfast",
        synced: true,
        createdAt: new Date("2024-12-06T12:30:00"),
        updatedAt: new Date("2024-12-06T12:30:00")
      },
      {
        txId: "tx_00014",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000014",
        type: "expense",
        amountPaise: 18000,
        category: "fuel",
        merchant: "Bharat Petroleum",
        method: "upi",
        timestamp: new Date("2024-12-06T13:00:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Full tank",
        synced: true,
        createdAt: new Date("2024-12-06T13:00:00"),
        updatedAt: new Date("2024-12-06T13:00:00")
      },
      {
        txId: "tx_00015",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000015",
        type: "income",
        amountPaise: 42000,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-06T17:50:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "14 deliveries",
        synced: true,
        createdAt: new Date("2024-12-06T17:50:00"),
        updatedAt: new Date("2024-12-06T17:50:00")
      },
      {
        txId: "tx_00016",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000016",
        type: "expense",
        amountPaise: 8000,
        category: "food",
        merchant: "Meals on Wheels",
        method: "upi",
        timestamp: new Date("2024-12-06T19:20:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Lunch combo",
        synced: true,
        createdAt: new Date("2024-12-06T19:20:00"),
        updatedAt: new Date("2024-12-06T19:20:00")
      },
      {
        txId: "tx_00017",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000017",
        type: "expense",
        amountPaise: 3000,
        category: "food",
        merchant: "Chai Corner",
        method: "cash",
        timestamp: new Date("2024-12-06T22:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Tea and samosa",
        synced: true,
        createdAt: new Date("2024-12-06T22:45:00"),
        updatedAt: new Date("2024-12-06T22:45:00")
      },
      {
        txId: "tx_00018",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000018",
        type: "income",
        amountPaise: 61200,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-05T01:30:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "21 deliveries dinner rush",
        synced: true,
        createdAt: new Date("2024-12-05T01:30:00"),
        updatedAt: new Date("2024-12-05T01:30:00")
      },
      {
        txId: "tx_00019",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000019",
        type: "expense",
        amountPaise: 11000,
        category: "food",
        merchant: "Chinese Corner",
        method: "upi",
        timestamp: new Date("2024-12-05T03:15:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Fried rice dinner",
        synced: true,
        createdAt: new Date("2024-12-05T03:15:00"),
        updatedAt: new Date("2024-12-05T03:15:00")
      },
      {
        txId: "tx_00020",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000020",
        type: "expense",
        amountPaise: 5000,
        category: "entertainment_other",
        merchant: "Mobile Shop",
        method: "upi",
        timestamp: new Date("2024-12-05T04:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Phone recharge ₹50",
        synced: true,
        createdAt: new Date("2024-12-05T04:30:00"),
        updatedAt: new Date("2024-12-05T04:30:00")
      },
      {
        txId: "tx_00021",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000021",
        type: "expense",
        amountPaise: 5000,
        category: "food",
        merchant: "Breakfast Point",
        method: "cash",
        timestamp: new Date("2024-12-05T12:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Poha and tea",
        synced: true,
        createdAt: new Date("2024-12-05T12:45:00"),
        updatedAt: new Date("2024-12-05T12:45:00")
      },
      {
        txId: "tx_00022",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000022",
        type: "expense",
        amountPaise: 12000,
        category: "fuel",
        merchant: "HP Petrol",
        method: "cash",
        timestamp: new Date("2024-12-05T13:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Fuel",
        synced: true,
        createdAt: new Date("2024-12-05T13:30:00"),
        updatedAt: new Date("2024-12-05T13:30:00")
      },
      {
        txId: "tx_00023",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000023",
        type: "income",
        amountPaise: 36500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-05T17:45:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "11 deliveries",
        synced: true,
        createdAt: new Date("2024-12-05T17:45:00"),
        updatedAt: new Date("2024-12-05T17:45:00")
      },
      {
        txId: "tx_00024",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000024",
        type: "expense",
        amountPaise: 7500,
        category: "food",
        merchant: "Dosa Plaza",
        method: "cash",
        timestamp: new Date("2024-12-05T19:00:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Masala dosa lunch",
        synced: true,
        createdAt: new Date("2024-12-05T19:00:00"),
        updatedAt: new Date("2024-12-05T19:00:00")
      },
      {
        txId: "tx_00025",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000025",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Snack Stall",
        method: "cash",
        timestamp: new Date("2024-12-05T23:00:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Vada pav and chai",
        synced: true,
        createdAt: new Date("2024-12-05T23:00:00"),
        updatedAt: new Date("2024-12-05T23:00:00")
      },
      {
        txId: "tx_00026",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000026",
        type: "income",
        amountPaise: 59500,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-04T02:00:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "19 deliveries",
        synced: true,
        createdAt: new Date("2024-12-04T02:00:00"),
        updatedAt: new Date("2024-12-04T02:00:00")
      },
      {
        txId: "tx_00027",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000027",
        type: "expense",
        amountPaise: 10000,
        category: "food",
        merchant: "Tandoor House",
        method: "upi",
        timestamp: new Date("2024-12-04T03:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Roti sabzi",
        synced: true,
        createdAt: new Date("2024-12-04T03:45:00"),
        updatedAt: new Date("2024-12-04T03:45:00")
      },
      {
        txId: "tx_00028",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000028",
        type: "expense",
        amountPaise: 15000,
        category: "fuel",
        merchant: "Shell Petrol",
        method: "upi",
        timestamp: new Date("2024-12-04T04:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "End of day fuel",
        synced: true,
        createdAt: new Date("2024-12-04T04:30:00"),
        updatedAt: new Date("2024-12-04T04:30:00")
      },
      {
        txId: "tx_00029",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000029",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Filter Coffee Shop",
        method: "cash",
        timestamp: new Date("2024-12-04T12:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Coffee and vada",
        synced: true,
        createdAt: new Date("2024-12-04T12:30:00"),
        updatedAt: new Date("2024-12-04T12:30:00")
      },
      {
        txId: "tx_00030",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000030",
        type: "expense",
        amountPaise: 17000,
        category: "fuel",
        merchant: "Indian Oil",
        method: "upi",
        timestamp: new Date("2024-12-04T13:15:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Morning fuel",
        synced: true,
        createdAt: new Date("2024-12-04T13:15:00"),
        updatedAt: new Date("2024-12-04T13:15:00")
      },
      {
        txId: "tx_00031",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000031",
        type: "income",
        amountPaise: 44500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-04T18:00:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "15 deliveries",
        synced: true,
        createdAt: new Date("2024-12-04T18:00:00"),
        updatedAt: new Date("2024-12-04T18:00:00")
      },
      {
        txId: "tx_00032",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000032",
        type: "expense",
        amountPaise: 8500,
        category: "food",
        merchant: "Paratha Junction",
        method: "upi",
        timestamp: new Date("2024-12-04T19:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Aloo paratha lunch",
        synced: true,
        createdAt: new Date("2024-12-04T19:30:00"),
        updatedAt: new Date("2024-12-04T19:30:00")
      },
      {
        txId: "tx_00033",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000033",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Chai Shop",
        method: "cash",
        timestamp: new Date("2024-12-04T23:15:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Evening chai",
        synced: true,
        createdAt: new Date("2024-12-04T23:15:00"),
        updatedAt: new Date("2024-12-04T23:15:00")
      },
      {
        txId: "tx_00034",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000034",
        type: "income",
        amountPaise: 65800,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-03T02:30:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "22 deliveries peak",
        synced: true,
        createdAt: new Date("2024-12-03T02:30:00"),
        updatedAt: new Date("2024-12-03T02:30:00")
      },
      {
        txId: "tx_00035",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000035",
        type: "expense",
        amountPaise: 12000,
        category: "food",
        merchant: "Mughlai Restaurant",
        method: "upi",
        timestamp: new Date("2024-12-03T03:50:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Chicken curry dinner",
        synced: true,
        createdAt: new Date("2024-12-03T03:50:00"),
        updatedAt: new Date("2024-12-03T03:50:00")
      },
      {
        txId: "tx_00036",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000036",
        type: "expense",
        amountPaise: 2000,
        category: "entertainment_other",
        merchant: "Paan Shop",
        method: "cash",
        timestamp: new Date("2024-12-03T05:00:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Paan",
        synced: true,
        createdAt: new Date("2024-12-03T05:00:00"),
        updatedAt: new Date("2024-12-03T05:00:00")
      },
      {
        txId: "tx_00037",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000037",
        type: "expense",
        amountPaise: 4500,
        category: "food",
        merchant: "Breakfast Corner",
        method: "cash",
        timestamp: new Date("2024-12-03T12:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Upma and coffee",
        synced: true,
        createdAt: new Date("2024-12-03T12:45:00"),
        updatedAt: new Date("2024-12-03T12:45:00")
      },
      {
        txId: "tx_00038",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000038",
        type: "expense",
        amountPaise: 20000,
        category: "fuel",
        merchant: "Bharat Petroleum",
        method: "upi",
        timestamp: new Date("2024-12-03T13:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Full tank for weekend",
        synced: true,
        createdAt: new Date("2024-12-03T13:30:00"),
        updatedAt: new Date("2024-12-03T13:30:00")
      },
      {
        txId: "tx_00039",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000039",
        type: "income",
        amountPaise: 39800,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-03T17:30:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "13 deliveries",
        synced: true,
        createdAt: new Date("2024-12-03T17:30:00"),
        updatedAt: new Date("2024-12-03T17:30:00")
      },
      {
        txId: "tx_00040",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000040",
        type: "expense",
        amountPaise: 9000,
        category: "food",
        merchant: "Biryani House",
        method: "upi",
        timestamp: new Date("2024-12-03T19:15:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Mini biryani",
        synced: true,
        createdAt: new Date("2024-12-03T19:15:00"),
        updatedAt: new Date("2024-12-03T19:15:00")
      },
      {
        txId: "tx_00041",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000041",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Tea Stall",
        method: "cash",
        timestamp: new Date("2024-12-03T23:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Chai pakoda",
        synced: true,
        createdAt: new Date("2024-12-03T23:30:00"),
        updatedAt: new Date("2024-12-03T23:30:00")
      },
      {
        txId: "tx_00042",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000042",
        type: "income",
        amountPaise: 72500,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-02T03:00:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "24 deliveries Friday rush",
        synced: true,
        createdAt: new Date("2024-12-02T03:00:00"),
        updatedAt: new Date("2024-12-02T03:00:00")
      },
      {
        txId: "tx_00043",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000043",
        type: "expense",
        amountPaise: 15000,
        category: "food",
        merchant: "Pizza Corner",
        method: "upi",
        timestamp: new Date("2024-12-02T04:30:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Pizza treat",
        synced: true,
        createdAt: new Date("2024-12-02T04:30:00"),
        updatedAt: new Date("2024-12-02T04:30:00")
      },
      {
        txId: "tx_00044",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000044",
        type: "expense",
        amountPaise: 10000,
        category: "entertainment_other",
        merchant: "Mobile Gaming",
        method: "upi",
        timestamp: new Date("2024-12-02T05:15:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Game credits",
        synced: true,
        createdAt: new Date("2024-12-02T05:15:00"),
        updatedAt: new Date("2024-12-02T05:15:00")
      },
      {
        txId: "tx_00045",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000045",
        type: "expense",
        amountPaise: 5000,
        category: "food",
        merchant: "South Indian",
        method: "cash",
        timestamp: new Date("2024-12-02T13:00:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Dosa breakfast",
        synced: true,
        createdAt: new Date("2024-12-02T13:00:00"),
        updatedAt: new Date("2024-12-02T13:00:00")
      },
      {
        txId: "tx_00046",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000046",
        type: "expense",
        amountPaise: 15000,
        category: "fuel",
        merchant: "HP Petrol",
        method: "upi",
        timestamp: new Date("2024-12-02T13:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Fuel",
        synced: true,
        createdAt: new Date("2024-12-02T13:45:00"),
        updatedAt: new Date("2024-12-02T13:45:00")
      },
      {
        txId: "tx_00047",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000047",
        type: "income",
        amountPaise: 48500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-02T18:30:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "16 deliveries",
        synced: true,
        createdAt: new Date("2024-12-02T18:30:00"),
        updatedAt: new Date("2024-12-02T18:30:00")
      },
      {
        txId: "tx_00048",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000048",
        type: "expense",
        amountPaise: 10000,
        category: "food",
        merchant: "Family Restaurant",
        method: "upi",
        timestamp: new Date("2024-12-02T20:00:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Weekend special lunch",
        synced: true,
        createdAt: new Date("2024-12-02T20:00:00"),
        updatedAt: new Date("2024-12-02T20:00:00")
      },
      {
        txId: "tx_00049",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000049",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Street Chai",
        method: "cash",
        timestamp: new Date("2024-12-02T23:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Chai break",
        synced: true,
        createdAt: new Date("2024-12-02T23:45:00"),
        updatedAt: new Date("2024-12-02T23:45:00")
      },
      {
        txId: "tx_00050",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000050",
        type: "income",
        amountPaise: 69500,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-01T03:30:00"),
        source: "sms",
        parserMeta: {
          parser: "sms",
          confidence: 0.95,
          rawParse: {}
        },
        notes: "23 deliveries Saturday dinner",
        synced: true,
        createdAt: new Date("2024-12-01T03:30:00"),
        updatedAt: new Date("2024-12-01T03:30:00")
      },
      {
        txId: "tx_00051",
        userId: "usr_rahul_001",
        eventId: null,
        clientLocalId: "cl_00000051",
        type: "expense",
        amountPaise: 13000,
        category: "food",
        merchant: "North Indian",
        method: "upi",
        timestamp: new Date("2024-12-01T04:45:00"),
        source: "manual",
        parserMeta: {
          parser: "manual",
          confidence: 1.0,
          rawParse: {}
        },
        notes: "Paneer dinner",
        synced: true,
        createdAt: new Date("2024-12-01T04:45:00"),
        updatedAt: new Date("2024-12-01T04:45:00")
      }
    ];

    const transactions = await Transaction.insertMany(transactionsData);
    console.log(`💸 Created ${transactions.length} transactions`);

    // ========== GOAL DATA ==========
    const goalData = {
      goalId: "goal_001",
      userId: "usr_rahul_001",
      type: "phone_purchase",
      description: "Buy Redmi Note 13 Pro (8GB/128GB) for better delivery app performance",
      targetAmountPaise: 1500000,  // ₹15,000
      currentAmountPaise: 235000,  // ₹2,350
      remainingAmountPaise: 1265000,  // ₹12,650
      deadline: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000),  // ~2 months
      monthsRemaining: 2,
      requiredMonthlySavingsPaise: 632500,
      requiredWeeklySavingsPaise: 158125,
      requiredDailySavingsPaise: 21810,
      priority: "high",
      feasibility: "challenging",
      gapPaise: 0,
      autoAdjustEnabled: true,
      createdAt: new Date("2024-11-10T14:30:00"),
      updatedAt: new Date("2024-12-02T08:00:00")
    };

    const goal = await Goal.create(goalData);
    console.log('🎯 Created goal:', goal.goalId);

    // ========== LIFE EVENTS DATA ==========
    const lifeEventsData = [
      {
        eventId: "evt_001",
        userId: "usr_rahul_001",
        type: "birthday",
        description: "Sister Priya's birthday - need to send money home",
        eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        expectedCostPaise: 200000,  // ₹2,000
        status: "upcoming",
        note: "Send money to family for birthday celebration and gift",
        daysUntil: 18,
        savingsPlanNeeded: true,
        createdAt: new Date("2024-11-15T10:00:00")
      },
      {
        eventId: "evt_002",
        userId: "usr_rahul_001",
        type: "festival",
        description: "Diwali 2025 - trip home to Bihar",
        eventDate: new Date("2025-10-20T00:00:00"),
        expectedCostPaise: 800000,  // ₹8,000
        status: "planning",
        note: "Train tickets, gifts for family, new clothes",
        daysUntil: 330,
        savingsPlanNeeded: true,
        createdAt: new Date("2024-11-12T18:30:00")
      },
      {
        eventId: "evt_003",
        userId: "usr_rahul_001",
        type: "other",
        description: "Honda Activa major service due",
        eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        expectedCostPaise: 180000,  // ₹1,800
        status: "upcoming",
        note: "Chain replacement, brake pads, oil change - overdue by 1000km",
        daysUntil: 12,
        savingsPlanNeeded: true,
        createdAt: new Date("2024-12-05T09:15:00")
      }
    ];

    const lifeEvents = await LifeEvent.insertMany(lifeEventsData);
    console.log(`📅 Created ${lifeEvents.length} life events`);

    // ========== SUMMARY ==========
    console.log('\n✨ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - User: ${user.name} (${user.userId})`);
    console.log(`   - Transactions: ${transactions.length} entries`);
    console.log(`   - Goals: 1 (Smartphone purchase - ₹15,000)`);
    console.log(`   - Life Events: ${lifeEvents.length} upcoming events`);
    console.log('\n💰 Week Financial Summary:');
    console.log(`   - Total Income: ₹6,331.00`);
    console.log(`   - Total Expenses: ₹3,355.00`);
    console.log(`   - Net Savings: ₹2,976.00`);
    console.log(`   - Daily Avg Income: ₹904.43`);
    console.log(`   - Daily Avg Expense: ₹479.29`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
