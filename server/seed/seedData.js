const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');

const usersData = [
  {
    name: 'Alex Johnson',
    email: 'alex.j@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.c@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    department: 'Electrical & Communication Eng',
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.v@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    department: 'Mechanical Engineering',
  },
];

const getItemsData = (users) => [
  {
    name: 'Casio FX-991EX Scientific Calculator',
    description: 'Casio scientific calculator in good working condition, suitable for engineering and mathematics coursework. Dual power (solar + battery) with natural textbook display.',
    category: 'Study',
    condition: 'Good',
    location: 'North Hall, Dorm 3B',
    imageUrl: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48d?w=600&auto=format&fit=crop&q=80',
    owner: users[0]._id,
    status: 'available',
    maxLendingDuration: '7 days',
    tags: ['Calculator', 'Math', 'Exam', 'Casio'],
  },
  {
    name: 'Database System Concepts (Silberschatz 7th Ed)',
    description: 'Essential textbook for CS301 Database Systems. Hardcover edition with minimal highlighting in early chapters. Extremely clear diagrams and SQL reference.',
    category: 'Books',
    condition: 'Like New',
    location: 'Campus Library Annex',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    owner: users[0]._id,
    status: 'available',
    maxLendingDuration: '14 days',
    tags: ['DBMS', 'Textbook', 'Computer Science', 'SQL'],
  },
  {
    name: 'Anker 65W GaN USB-C Fast Charger',
    description: 'Compact 3-port fast wall charger capable of charging laptops, phones, and tablets simultaneously. Includes 6ft braided USB-C cable.',
    category: 'Electronics',
    condition: 'New',
    location: 'Student Union, East Wing',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    owner: users[1]._id,
    status: 'available',
    maxLendingDuration: '3 days',
    tags: ['Charger', 'USB-C', 'Anker', 'Power'],
  },
  {
    name: 'High-Speed 4K HDMI 2.1 Cable (10ft)',
    description: 'Durable nylon braided HDMI cable. Perfect for connecting laptops to campus project lab monitors or dorm TVs. Supports 4K 120Hz.',
    category: 'Electronics',
    condition: 'Good',
    location: 'South Quad Quadrangle',
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
    owner: users[1]._id,
    status: 'available',
    maxLendingDuration: '5 days',
    tags: ['HDMI', 'Cable', 'Display', 'Adapter'],
  },
  {
    name: 'YONEX Nanoflare Badminton Racket Set',
    description: 'Pair of lightweight graphite badminton rackets with 3 tournament shuttlecocks and carrying case. Ideal for evening games at the campus sports complex.',
    category: 'Sports',
    condition: 'Good',
    location: 'Campus Recreation Center',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    owner: users[2]._id,
    status: 'available',
    maxLendingDuration: '3 days',
    tags: ['Badminton', 'Sports', 'Yonex', 'Rec'],
  },
  {
    name: 'Engineering Mini Drafting & Drawing Kit',
    description: 'Complete drafting set including mini drafter, compass, set squares, T-scale, and protective hard case for ME101 Technical Drawing labs.',
    category: 'Lab Equipment',
    condition: 'Like New',
    location: 'Mechanical Engineering Workshop',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    owner: users[2]._id,
    status: 'available',
    maxLendingDuration: '10 days',
    tags: ['Drawing', 'Drafting', 'Mechanical', 'Lab'],
  },
  {
    name: 'Anker PowerCore 20,000mAh Power Bank',
    description: 'High-capacity portable charger that recharges smartphone up to 5 times. Features dual USB-A and USB-C output ports for long study marathons.',
    category: 'Electronics',
    condition: 'Good',
    location: 'Library Quiet Zone (3rd Floor)',
    imageUrl: 'https://images.unsplash.com/photo-1609592424082-f58c73335581?w=600&auto=format&fit=crop&q=80',
    owner: users[0]._id,
    status: 'borrowed',
    maxLendingDuration: '4 days',
    tags: ['PowerBank', 'Battery', 'Anker', 'Travel'],
  },
  {
    name: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    description: 'Top-tier active noise-cancelling wireless headphones with custom EQ. Phenomenal for studying in noisy cafeterias or dorm lounges.',
    category: 'Electronics',
    condition: 'Like New',
    location: 'West Hostel, Room 204',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    owner: users[1]._id,
    status: 'available',
    maxLendingDuration: '2 days',
    tags: ['Audio', 'Headphones', 'Sony', 'Focus'],
  },
  {
    name: 'White Unisex Chemistry & Bio Lab Coat (Size M)',
    description: '100% cotton flame-resistant white lab coat. Mandatory for Organic Chemistry and Bio-Engineering practicals. Freshly laundered.',
    category: 'Lab Equipment',
    condition: 'Good',
    location: 'Science Block B, Room 102',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
    owner: users[2]._id,
    status: 'available',
    maxLendingDuration: '14 days',
    tags: ['LabCoat', 'Chemistry', 'Safety', 'Science'],
  },
  {
    name: 'Elegoo Arduino UNO R3 Ultimate Starter Kit',
    description: 'Comprehensive electronics prototyping kit including Arduino UNO board, breadboard, step motors, LCD display, sensors, and jumper wires.',
    category: 'Lab Equipment',
    condition: 'New',
    location: 'Robotics Innovation Lab',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
    owner: users[1]._id,
    status: 'available',
    maxLendingDuration: '14 days',
    tags: ['Arduino', 'Robotics', 'Electronics', 'IoT'],
  },
  {
    name: 'Windproof Automatic Compact Umbrella',
    description: 'Sturdy 10-rib wind-resistant umbrella with auto-open button. Folds down small enough to slip into any campus backpack.',
    category: 'Accessories',
    condition: 'Good',
    location: 'North Hall Lobby',
    imageUrl: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=600&auto=format&fit=crop&q=80',
    owner: users[0]._id,
    status: 'available',
    maxLendingDuration: '2 days',
    tags: ['Umbrella', 'Rain', 'Accessory'],
  },
  {
    name: 'Ergonomic Aluminium Folding Laptop Stand',
    description: 'Vented aluminum laptop riser with 6 adjustable height settings. Elevates screen to eye level to prevent neck strain during long coding assignments.',
    category: 'Study',
    condition: 'Like New',
    location: 'Innovation Hub Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    owner: users[2]._id,
    status: 'available',
    maxLendingDuration: '7 days',
    tags: ['Laptop', 'Ergonomics', 'Study', 'Stand'],
  },
  {
    name: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
    description: 'Full-color high-resolution backlit screen graphing calculator. Loaded with math, statistics, and calculus software.',
    category: 'Study',
    condition: 'Good',
    location: 'Math Department Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    owner: users[1]._id,
    status: 'available',
    maxLendingDuration: '7 days',
    tags: ['TI84', 'Graphing', 'Calculus', 'Stats'],
  },
  {
    name: 'Heavy Duty Aluminum Camera & Phone Tripod',
    description: 'Extendable 60-inch tripod with 3-way pan head and universal phone mount clip. Great for filming class presentations or campus events.',
    category: 'Accessories',
    condition: 'Good',
    location: 'Media Club Studio',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    owner: users[0]._id,
    status: 'available',
    maxLendingDuration: '3 days',
    tags: ['Tripod', 'Camera', 'Video', 'Media'],
  },
  {
    name: 'Python Crash Course (3rd Edition - Eric Matthes)',
    description: 'Hands-on project-based introduction to programming in Python. Covers data analysis, web applications with Django, and game dev basics.',
    category: 'Books',
    condition: 'Like New',
    location: 'CS Department Library',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    owner: users[2]._id,
    status: 'available',
    maxLendingDuration: '10 days',
    tags: ['Python', 'Coding', 'Book', 'Programming'],
  },
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/borrowbox';
    await mongoose.connect(connStr, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed] Connected to MongoDB database.');

    // Clear old records
    await User.deleteMany({});
    await Item.deleteMany({});
    await BorrowRequest.deleteMany({});

    // Seed Demo Users
    const createdUsers = await User.insertMany(usersData);
    console.log(`[Seed] Created ${createdUsers.length} demo users.`);

    // Seed Items
    const itemsToInsert = getItemsData(createdUsers);
    const createdItems = await Item.insertMany(itemsToInsert);
    console.log(`[Seed] Created ${createdItems.length} campus items.`);

    // Seed Sample Borrow Requests
    const powerBankItem = createdItems.find(i => i.name.includes('Power Bank'));
    const calcItem = createdItems.find(i => i.name.includes('Casio'));
    const bookItem = createdItems.find(i => i.name.includes('Database'));
    const racketItem = createdItems.find(i => i.name.includes('Badminton'));

    const sampleRequests = [
      {
        item: powerBankItem._id,
        requester: createdUsers[1]._id,
        owner: createdUsers[0]._id,
        requestedDuration: '3 days',
        message: 'Need this for the weekend hackathon at the Student Union!',
        status: 'approved',
        requestedAt: new Date(Date.now() - 3 * 86400000),
        approvedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        item: calcItem._id,
        requester: createdUsers[2]._id,
        owner: createdUsers[0]._id,
        requestedDuration: '5 days',
        message: 'Hi Alex, have my midterms next week. Would love to borrow this!',
        status: 'pending',
        requestedAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        item: bookItem._id,
        requester: createdUsers[1]._id,
        owner: createdUsers[0]._id,
        requestedDuration: '7 days',
        message: 'Prepping for the DBMS midsem exam. Thanks!',
        status: 'returned',
        requestedAt: new Date(Date.now() - 10 * 86400000),
        approvedAt: new Date(Date.now() - 9 * 86400000),
        returnedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        item: racketItem._id,
        requester: createdUsers[0]._id,
        owner: createdUsers[2]._id,
        requestedDuration: '2 days',
        message: 'Planning a quick game this Thursday evening!',
        status: 'pending',
        requestedAt: new Date(Date.now() - 4 * 3600000),
      }
    ];

    await BorrowRequest.insertMany(sampleRequests);
    console.log('[Seed] Created sample borrowing requests.');

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.warn(`[Seed Warning] Could not connect to database: ${error.message}`);
    console.warn('[Seed Hint] Make sure MongoDB server is running locally or set MONGODB_URI in server/.env');
    process.exit(0);
  }
};

seedDB();
