const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://mumbaihacks:mumbaihacks@cluster0.fonvcex.mongodb.net/';

async function seedTransactions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log('🗑️  Cleared existing transactions');

    // Transactions data for current week (Dec 1-8, 2024)
    const transactionsData = [
      {
        txId: "tx_00001",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Local Chai Stall",
        method: "cash",
        timestamp: new Date("2024-12-08T06:15:00"),
        source: "manual",
        notes: "Morning chai and biscuit"
      },
      {
        txId: "tx_00002",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 12000,
        category: "food",
        merchant: "Annapurna Mess",
        method: "upi",
        timestamp: new Date("2024-12-08T13:30:00"),
        source: "manual",
        notes: "Lunch thali"
      },
      {
        txId: "tx_00003",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 3000,
        category: "food",
        merchant: "Street Vendor",
        method: "cash",
        timestamp: new Date("2024-12-08T17:45:00"),
        source: "manual",
        notes: "Evening chai"
      },
      {
        txId: "tx_00004",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 9000,
        category: "food",
        merchant: "Home cooking",
        method: "cash",
        timestamp: new Date("2024-12-07T20:30:00"),
        source: "manual",
        notes: "Dinner groceries"
      },
      {
        txId: "tx_00005",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Udupi Cafe",
        method: "cash",
        timestamp: new Date("2024-12-07T06:45:00"),
        source: "manual",
        notes: "Morning breakfast"
      },
      {
        txId: "tx_00006",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 15000,
        category: "fuel",
        merchant: "HP Petrol Pump",
        method: "upi",
        timestamp: new Date("2024-12-07T07:20:00"),
        source: "manual",
        notes: "Bike fuel"
      },
      {
        txId: "tx_00007",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 38500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-07T12:15:00"),
        source: "sms",
        notes: "12 deliveries morning shift"
      },
      {
        txId: "tx_00008",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 7000,
        category: "food",
        merchant: "Punjabi Dhaba",
        method: "cash",
        timestamp: new Date("2024-12-07T13:45:00"),
        source: "manual",
        notes: "Lunch"
      },
      {
        txId: "tx_00009",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Tea Stall",
        method: "cash",
        timestamp: new Date("2024-12-07T17:30:00"),
        source: "manual",
        notes: "Evening tea break"
      },
      {
        txId: "tx_00010",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 54800,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-06T20:45:00"),
        source: "sms",
        notes: "18 deliveries evening shift"
      },
      {
        txId: "tx_00011",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 9500,
        category: "food",
        merchant: "Biryani Point",
        method: "upi",
        timestamp: new Date("2024-12-06T21:30:00"),
        source: "manual",
        notes: "Dinner"
      },
      {
        txId: "tx_00012",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 10000,
        category: "fuel",
        merchant: "Indian Oil",
        method: "cash",
        timestamp: new Date("2024-12-06T22:10:00"),
        source: "manual",
        notes: "Late fuel top-up"
      },
      {
        txId: "tx_00013",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 4500,
        category: "food",
        merchant: "South Indian Cafe",
        method: "cash",
        timestamp: new Date("2024-12-06T06:30:00"),
        source: "manual",
        notes: "Idli breakfast"
      },
      {
        txId: "tx_00014",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 18000,
        category: "fuel",
        merchant: "Bharat Petroleum",
        method: "upi",
        timestamp: new Date("2024-12-06T07:00:00"),
        source: "manual",
        notes: "Full tank"
      },
      {
        txId: "tx_00015",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 42000,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-06T11:50:00"),
        source: "sms",
        notes: "14 deliveries"
      },
      {
        txId: "tx_00016",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 8000,
        category: "food",
        merchant: "Meals on Wheels",
        method: "upi",
        timestamp: new Date("2024-12-06T13:20:00"),
        source: "manual",
        notes: "Lunch combo"
      },
      {
        txId: "tx_00017",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 3000,
        category: "food",
        merchant: "Chai Corner",
        method: "cash",
        timestamp: new Date("2024-12-06T16:45:00"),
        source: "manual",
        notes: "Tea and samosa"
      },
      {
        txId: "tx_00018",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 61200,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-05T19:30:00"),
        source: "sms",
        notes: "21 deliveries dinner rush"
      },
      {
        txId: "tx_00019",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 11000,
        category: "food",
        merchant: "Chinese Corner",
        method: "upi",
        timestamp: new Date("2024-12-05T21:15:00"),
        source: "manual",
        notes: "Fried rice dinner"
      },
      {
        txId: "tx_00020",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 39900,
        category: "recharge",
        merchant: "Airtel Recharge",
        method: "upi",
        timestamp: new Date("2024-12-05T10:30:00"),
        source: "manual",
        notes: "Monthly phone recharge"
      },
      {
        txId: "tx_00021",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 5000,
        category: "food",
        merchant: "Breakfast Point",
        method: "cash",
        timestamp: new Date("2024-12-05T06:45:00"),
        source: "manual",
        notes: "Poha and tea"
      },
      {
        txId: "tx_00022",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 12000,
        category: "fuel",
        merchant: "HP Petrol",
        method: "cash",
        timestamp: new Date("2024-12-05T07:30:00"),
        source: "manual",
        notes: "Fuel"
      },
      {
        txId: "tx_00023",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 36500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-05T11:45:00"),
        source: "sms",
        notes: "11 deliveries"
      },
      {
        txId: "tx_00024",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 7500,
        category: "food",
        merchant: "Dosa Plaza",
        method: "cash",
        timestamp: new Date("2024-12-05T13:00:00"),
        source: "manual",
        notes: "Masala dosa lunch"
      },
      {
        txId: "tx_00025",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Snack Stall",
        method: "cash",
        timestamp: new Date("2024-12-05T17:00:00"),
        source: "manual",
        notes: "Vada pav and chai"
      },
      {
        txId: "tx_00026",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 59500,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-04T20:00:00"),
        source: "sms",
        notes: "19 deliveries"
      },
      {
        txId: "tx_00027",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 10000,
        category: "food",
        merchant: "Tandoor House",
        method: "upi",
        timestamp: new Date("2024-12-04T21:45:00"),
        source: "manual",
        notes: "Roti sabzi"
      },
      {
        txId: "tx_00028",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 15000,
        category: "fuel",
        merchant: "Shell Petrol",
        method: "upi",
        timestamp: new Date("2024-12-04T22:30:00"),
        source: "manual",
        notes: "End of day fuel"
      },
      {
        txId: "tx_00029",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Filter Coffee Shop",
        method: "cash",
        timestamp: new Date("2024-12-04T06:30:00"),
        source: "manual",
        notes: "Coffee and vada"
      },
      {
        txId: "tx_00030",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 17000,
        category: "fuel",
        merchant: "Indian Oil",
        method: "upi",
        timestamp: new Date("2024-12-04T07:15:00"),
        source: "manual",
        notes: "Morning fuel"
      },
      {
        txId: "tx_00031",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 44500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-04T12:00:00"),
        source: "sms",
        notes: "15 deliveries"
      },
      {
        txId: "tx_00032",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 8500,
        category: "food",
        merchant: "Paratha Junction",
        method: "upi",
        timestamp: new Date("2024-12-04T13:30:00"),
        source: "manual",
        notes: "Aloo paratha lunch"
      },
      {
        txId: "tx_00033",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Chai Shop",
        method: "cash",
        timestamp: new Date("2024-12-04T17:15:00"),
        source: "manual",
        notes: "Evening chai"
      },
      {
        txId: "tx_00034",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 65800,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-03T20:30:00"),
        source: "sms",
        notes: "22 deliveries peak"
      },
      {
        txId: "tx_00035",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 12000,
        category: "food",
        merchant: "Mughlai Restaurant",
        method: "upi",
        timestamp: new Date("2024-12-03T21:50:00"),
        source: "manual",
        notes: "Chicken curry dinner"
      },
      {
        txId: "tx_00036",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 2000,
        category: "entertainment",
        merchant: "Paan Shop",
        method: "cash",
        timestamp: new Date("2024-12-03T23:00:00"),
        source: "manual",
        notes: "Paan"
      },
      {
        txId: "tx_00037",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 4500,
        category: "food",
        merchant: "Breakfast Corner",
        method: "cash",
        timestamp: new Date("2024-12-03T06:45:00"),
        source: "manual",
        notes: "Upma and coffee"
      },
      {
        txId: "tx_00038",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 20000,
        category: "fuel",
        merchant: "Bharat Petroleum",
        method: "upi",
        timestamp: new Date("2024-12-03T07:30:00"),
        source: "manual",
        notes: "Full tank for weekend"
      },
      {
        txId: "tx_00039",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 39800,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-03T11:30:00"),
        source: "sms",
        notes: "13 deliveries"
      },
      {
        txId: "tx_00040",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 9000,
        category: "food",
        merchant: "Biryani House",
        method: "upi",
        timestamp: new Date("2024-12-03T13:15:00"),
        source: "manual",
        notes: "Mini biryani"
      },
      {
        txId: "tx_00041",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 4000,
        category: "food",
        merchant: "Tea Stall",
        method: "cash",
        timestamp: new Date("2024-12-03T17:30:00"),
        source: "manual",
        notes: "Chai pakoda"
      },
      {
        txId: "tx_00042",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 72500,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-02T21:00:00"),
        source: "sms",
        notes: "24 deliveries Monday rush"
      },
      {
        txId: "tx_00043",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 15000,
        category: "food",
        merchant: "Pizza Corner",
        method: "upi",
        timestamp: new Date("2024-12-02T22:30:00"),
        source: "manual",
        notes: "Pizza treat"
      },
      {
        txId: "tx_00044",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 10000,
        category: "entertainment",
        merchant: "Netflix",
        method: "upi",
        timestamp: new Date("2024-12-02T09:15:00"),
        source: "manual",
        notes: "Monthly subscription"
      },
      {
        txId: "tx_00045",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 5000,
        category: "food",
        merchant: "South Indian",
        method: "cash",
        timestamp: new Date("2024-12-02T07:00:00"),
        source: "manual",
        notes: "Dosa breakfast"
      },
      {
        txId: "tx_00046",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 15000,
        category: "fuel",
        merchant: "HP Petrol",
        method: "upi",
        timestamp: new Date("2024-12-02T07:45:00"),
        source: "manual",
        notes: "Fuel"
      },
      {
        txId: "tx_00047",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 48500,
        category: "gig_payout",
        merchant: "Swiggy",
        method: "wallet",
        timestamp: new Date("2024-12-02T12:30:00"),
        source: "sms",
        notes: "16 deliveries"
      },
      {
        txId: "tx_00048",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 10000,
        category: "food",
        merchant: "Family Restaurant",
        method: "upi",
        timestamp: new Date("2024-12-02T14:00:00"),
        source: "manual",
        notes: "Monday special lunch"
      },
      {
        txId: "tx_00049",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 3500,
        category: "food",
        merchant: "Street Chai",
        method: "cash",
        timestamp: new Date("2024-12-02T17:45:00"),
        source: "manual",
        notes: "Chai break"
      },
      {
        txId: "tx_00050",
        userId: "usr_rahul_001",
        type: "income",
        amountPaise: 69500,
        category: "gig_payout",
        merchant: "Zomato",
        method: "wallet",
        timestamp: new Date("2024-12-01T21:30:00"),
        source: "sms",
        notes: "23 deliveries Sunday dinner"
      },
      {
        txId: "tx_00051",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 170000,
        category: "send_home",
        merchant: "UPI Transfer",
        method: "upi",
        timestamp: new Date("2024-12-01T10:00:00"),
        source: "manual",
        notes: "Money sent to family"
      },
      {
        txId: "tx_00052",
        userId: "usr_rahul_001",
        type: "expense",
        amountPaise: 13000,
        category: "food",
        merchant: "North Indian",
        method: "upi",
        timestamp: new Date("2024-12-01T14:45:00"),
        source: "manual",
        notes: "Sunday special lunch"
      }
    ];

    const transactions = await Transaction.insertMany(transactionsData);
    console.log(`✅ Created ${transactions.length} transactions`);
    
    // Calculate summary
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amountPaise, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountPaise, 0);
    
    console.log('\n💰 Week Summary (Dec 1-8):');
    console.log(`   Income: ₹${(income / 100).toFixed(2)}`);
    console.log(`   Expenses: ₹${(expenses / 100).toFixed(2)}`);
    console.log(`   Net: ₹${((income - expenses) / 100).toFixed(2)}`);

    await mongoose.disconnect();
    console.log('\n✅ Transaction seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTransactions();
