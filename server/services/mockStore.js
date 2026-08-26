/**
 * In-Memory Mock Store for BorrowBox
 * Activated automatically whenever MongoDB server is not running locally
 */

const mockUsers = [
  {
    _id: '65f000000000000000000001',
    name: 'Alex Johnson',
    email: 'alex.j@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000002',
    name: 'Sarah Chen',
    email: 'sarah.c@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    department: 'Electrical & Communication Eng',
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000003',
    name: 'Marcus Vance',
    email: 'marcus.v@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    department: 'Mechanical Engineering',
    createdAt: new Date(),
  },
];

let mockItems = [
  {
    _id: '65f000000000000000000101',
    name: 'Casio FX-991EX Scientific Calculator',
    description: 'Casio scientific calculator in good working condition, suitable for engineering and mathematics coursework. Dual power (solar + battery) with natural textbook display.',
    category: 'Study',
    condition: 'Good',
    location: 'North Hall, Dorm 3B',
    imageUrl: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48d?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[0],
    status: 'available',
    maxLendingDuration: '7 days',
    tags: ['Calculator', 'Math', 'Exam', 'Casio'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000102',
    name: 'Database System Concepts (Silberschatz 7th Ed)',
    description: 'Essential textbook for CS301 Database Systems. Hardcover edition with minimal highlighting in early chapters. Extremely clear diagrams and SQL reference.',
    category: 'Books',
    condition: 'Like New',
    location: 'Campus Library Annex',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[0],
    status: 'available',
    maxLendingDuration: '14 days',
    tags: ['DBMS', 'Textbook', 'Computer Science', 'SQL'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000103',
    name: 'Anker 65W GaN USB-C Fast Charger',
    description: 'Compact 3-port fast wall charger capable of charging laptops, phones, and tablets simultaneously. Includes 6ft braided USB-C cable.',
    category: 'Electronics',
    condition: 'New',
    location: 'Student Union, East Wing',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[1],
    status: 'available',
    maxLendingDuration: '3 days',
    tags: ['Charger', 'USB-C', 'Anker', 'Power'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000104',
    name: 'High-Speed 4K HDMI 2.1 Cable (10ft)',
    description: 'Durable nylon braided HDMI cable. Perfect for connecting laptops to campus project lab monitors or dorm TVs. Supports 4K 120Hz.',
    category: 'Electronics',
    condition: 'Good',
    location: 'South Quad Quadrangle',
    imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[1],
    status: 'available',
    maxLendingDuration: '5 days',
    tags: ['HDMI', 'Cable', 'Display', 'Adapter'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000105',
    name: 'YONEX Nanoflare Badminton Racket Set',
    description: 'Pair of lightweight graphite badminton rackets with 3 tournament shuttlecocks and carrying case. Ideal for evening games at the campus sports complex.',
    category: 'Sports',
    condition: 'Good',
    location: 'Campus Recreation Center',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[2],
    status: 'available',
    maxLendingDuration: '3 days',
    tags: ['Badminton', 'Sports', 'Yonex', 'Rec'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000106',
    name: 'Engineering Mini Drafting & Drawing Kit',
    description: 'Complete drafting set including mini drafter, compass, set squares, T-scale, and protective hard case for ME101 Technical Drawing labs.',
    category: 'Lab Equipment',
    condition: 'Like New',
    location: 'Mechanical Engineering Workshop',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[2],
    status: 'available',
    maxLendingDuration: '10 days',
    tags: ['Drawing', 'Drafting', 'Mechanical', 'Lab'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000107',
    name: 'Anker PowerCore 20,000mAh Power Bank',
    description: 'High-capacity portable charger that recharges smartphone up to 5 times. Features dual USB-A and USB-C output ports for long study marathons.',
    category: 'Electronics',
    condition: 'Good',
    location: 'Library Quiet Zone (3rd Floor)',
    imageUrl: 'https://images.unsplash.com/photo-1609592424082-f58c73335581?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[0],
    status: 'borrowed',
    maxLendingDuration: '4 days',
    tags: ['PowerBank', 'Battery', 'Anker', 'Travel'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000108',
    name: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    description: 'Top-tier active noise-cancelling wireless headphones with custom EQ. Phenomenal for studying in noisy cafeterias or dorm lounges.',
    category: 'Electronics',
    condition: 'Like New',
    location: 'West Hostel, Room 204',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[1],
    status: 'available',
    maxLendingDuration: '2 days',
    tags: ['Audio', 'Headphones', 'Sony', 'Focus'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000109',
    name: 'White Unisex Chemistry & Bio Lab Coat (Size M)',
    description: '100% cotton flame-resistant white lab coat. Mandatory for Organic Chemistry and Bio-Engineering practicals. Freshly laundered.',
    category: 'Lab Equipment',
    condition: 'Good',
    location: 'Science Block B, Room 102',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[2],
    status: 'available',
    maxLendingDuration: '14 days',
    tags: ['LabCoat', 'Chemistry', 'Safety', 'Science'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000110',
    name: 'Elegoo Arduino UNO R3 Ultimate Starter Kit',
    description: 'Comprehensive electronics prototyping kit including Arduino UNO board, breadboard, step motors, LCD display, sensors, and jumper wires.',
    category: 'Lab Equipment',
    condition: 'New',
    location: 'Robotics Innovation Lab',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[1],
    status: 'available',
    maxLendingDuration: '14 days',
    tags: ['Arduino', 'Robotics', 'Electronics', 'IoT'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000111',
    name: 'Windproof Automatic Compact Umbrella',
    description: 'Sturdy 10-rib wind-resistant umbrella with auto-open button. Folds down small enough to slip into any campus backpack.',
    category: 'Accessories',
    condition: 'Good',
    location: 'North Hall Lobby',
    imageUrl: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[0],
    status: 'available',
    maxLendingDuration: '2 days',
    tags: ['Umbrella', 'Rain', 'Accessory'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000112',
    name: 'Ergonomic Aluminium Folding Laptop Stand',
    description: 'Vented aluminum laptop riser with 6 adjustable height settings. Elevates screen to eye level to prevent neck strain during long coding assignments.',
    category: 'Study',
    condition: 'Like New',
    location: 'Innovation Hub Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[2],
    status: 'available',
    maxLendingDuration: '7 days',
    tags: ['Laptop', 'Ergonomics', 'Study', 'Stand'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000113',
    name: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
    description: 'Full-color high-resolution backlit screen graphing calculator. Loaded with math, statistics, and calculus software.',
    category: 'Study',
    condition: 'Good',
    location: 'Math Department Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[1],
    status: 'available',
    maxLendingDuration: '7 days',
    tags: ['TI84', 'Graphing', 'Calculus', 'Stats'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000114',
    name: 'Heavy Duty Aluminum Camera & Phone Tripod',
    description: 'Extendable 60-inch tripod with 3-way pan head and universal phone mount clip. Great for filming class presentations or campus events.',
    category: 'Accessories',
    condition: 'Good',
    location: 'Media Club Studio',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[0],
    status: 'available',
    maxLendingDuration: '3 days',
    tags: ['Tripod', 'Camera', 'Video', 'Media'],
    createdAt: new Date(),
  },
  {
    _id: '65f000000000000000000115',
    name: 'Python Crash Course (3rd Edition - Eric Matthes)',
    description: 'Hands-on project-based introduction to programming in Python. Covers data analysis, web applications with Django, and game dev basics.',
    category: 'Books',
    condition: 'Like New',
    location: 'CS Department Library',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    owner: mockUsers[2],
    status: 'available',
    maxLendingDuration: '10 days',
    tags: ['Python', 'Coding', 'Book', 'Programming'],
    createdAt: new Date(),
  },
];

let mockRequests = [
  {
    _id: '65f000000000000000000201',
    item: mockItems[6], // Power Bank
    requester: mockUsers[1], // Sarah
    owner: mockUsers[0], // Alex
    requestedDuration: '3 days',
    message: 'Need this for the weekend hackathon at the Student Union!',
    status: 'approved',
    requestedAt: new Date(Date.now() - 3 * 86400000),
    approvedAt: new Date(Date.now() - 2 * 86400000),
    updatedAt: new Date(Date.now() - 2 * 86400000),
  },
  {
    _id: '65f000000000000000000202',
    item: mockItems[0], // Casio Calculator
    requester: mockUsers[2], // Marcus
    owner: mockUsers[0], // Alex
    requestedDuration: '5 days',
    message: 'Hi Alex, have my midterms next week. Would love to borrow this!',
    status: 'pending',
    requestedAt: new Date(Date.now() - 1 * 86400000),
    updatedAt: new Date(Date.now() - 1 * 86400000),
  },
  {
    _id: '65f000000000000000000203',
    item: mockItems[1], // DBMS Book
    requester: mockUsers[1], // Sarah
    owner: mockUsers[0], // Alex
    requestedDuration: '7 days',
    message: 'Prepping for the DBMS midsem exam. Thanks!',
    status: 'returned',
    requestedAt: new Date(Date.now() - 10 * 86400000),
    approvedAt: new Date(Date.now() - 9 * 86400000),
    returnedAt: new Date(Date.now() - 2 * 86400000),
    updatedAt: new Date(Date.now() - 2 * 86400000),
  },
];

// Helper methods
const getMockUsers = () => mockUsers;
const findMockUserById = (id) => mockUsers.find((u) => u._id === id) || mockUsers[0];

const getMockItems = ({ search, category, condition, status, owner, sort }) => {
  let list = [...mockItems];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(s) ||
        i.description.toLowerCase().includes(s) ||
        i.location.toLowerCase().includes(s) ||
        (i.tags && i.tags.some((t) => t.toLowerCase().includes(s)))
    );
  }

  if (category && category !== 'All') {
    list = list.filter((i) => i.category === category);
  }

  if (condition && condition !== 'All') {
    list = list.filter((i) => i.condition === condition);
  }

  if (status && status !== 'All') {
    list = list.filter((i) => i.status.toLowerCase() === status.toLowerCase());
  }

  if (owner) {
    list = list.filter((i) => (i.owner._id ? i.owner._id === owner : i.owner === owner));
  }

  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
};

const getMockItemById = (id) => {
  const item = mockItems.find((i) => i._id === id);
  if (!item) return { item: null, similarItems: [] };

  const similarItems = mockItems.filter((i) => i.category === item.category && i._id !== item._id).slice(0, 4);
  return { item, similarItems };
};

const createMockItem = (data, ownerUser) => {
  const newItem = {
    _id: '65f0000000000000000' + (mockItems.length + 100),
    ...data,
    owner: ownerUser || mockUsers[0],
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockItems.unshift(newItem);
  return newItem;
};

const updateMockItem = (id, data) => {
  const idx = mockItems.findIndex((i) => i._id === id);
  if (idx === -1) return null;

  mockItems[idx] = {
    ...mockItems[idx],
    ...data,
    updatedAt: new Date(),
  };
  return mockItems[idx];
};

const deleteMockItem = (id) => {
  mockItems = mockItems.filter((i) => i._id !== id);
  mockRequests = mockRequests.filter((r) => r.item?._id !== id && r.item !== id);
  return true;
};

const getMockRequests = (userId, role) => {
  let list = [...mockRequests];
  if (role === 'sent') {
    list = list.filter((r) => r.requester._id === userId);
  } else if (role === 'received') {
    list = list.filter((r) => r.owner._id === userId);
  } else {
    list = list.filter((r) => r.requester._id === userId || r.owner._id === userId);
  }
  return list;
};

const createMockRequest = (itemId, requestedDuration, message, requesterUser) => {
  const item = mockItems.find((i) => i._id === itemId);
  if (!item) throw new Error('Item not found');

  if (item.owner._id === requesterUser._id) {
    throw new Error('You cannot request your own item');
  }

  if (item.status === 'borrowed') {
    throw new Error('Item is currently borrowed');
  }

  const newReq = {
    _id: '65f0000000000000000' + (mockRequests.length + 200),
    item,
    requester: requesterUser,
    owner: item.owner,
    requestedDuration,
    message: message || '',
    status: 'pending',
    requestedAt: new Date(),
    updatedAt: new Date(),
  };

  mockRequests.unshift(newReq);
  return newReq;
};

const updateMockRequestStatus = (id, status) => {
  const req = mockRequests.find((r) => r._id === id);
  if (!req) throw new Error('Borrow request not found');

  const item = mockItems.find((i) => i._id === (req.item._id || req.item));

  if (status === 'approved') {
    req.status = 'approved';
    req.approvedAt = new Date();
    if (item) item.status = 'borrowed';
  } else if (status === 'returned') {
    req.status = 'returned';
    req.returnedAt = new Date();
    if (item) item.status = 'available';
  } else if (status === 'rejected' || status === 'cancelled') {
    const wasApproved = req.status === 'approved';
    req.status = status;
    if (wasApproved && item) item.status = 'available';
  }

  req.updatedAt = new Date();
  return req;
};

const getMockDashboard = (userId) => {
  const userItems = mockItems.filter((i) => i.owner._id === userId);
  const activeBorrows = mockRequests.filter((r) => r.requester._id === userId && r.status === 'approved');
  const pendingRequests = mockRequests.filter(
    (r) => (r.owner._id === userId || r.requester._id === userId) && r.status === 'pending'
  );
  const itemsLent = mockRequests.filter((r) => r.owner._id === userId && r.status === 'approved');
  const completedBorrows = mockRequests.filter(
    (r) => (r.owner._id === userId || r.requester._id === userId) && r.status === 'returned'
  );

  const recentActivity = mockRequests
    .filter((r) => r.owner._id === userId || r.requester._id === userId)
    .slice(0, 6);

  const currentBorrows = mockRequests.filter(
    (r) => (r.owner._id === userId || r.requester._id === userId) && r.status === 'approved'
  );

  return {
    stats: {
      itemsListed: userItems.length,
      activeBorrows: activeBorrows.length,
      pendingRequests: pendingRequests.length,
      itemsLent: itemsLent.length,
      completedBorrows: completedBorrows.length,
    },
    recentActivity,
    currentBorrows,
  };
};

module.exports = {
  getMockUsers,
  findMockUserById,
  getMockItems,
  getMockItemById,
  createMockItem,
  updateMockItem,
  deleteMockItem,
  getMockRequests,
  createMockRequest,
  updateMockRequestStatus,
  getMockDashboard,
};
