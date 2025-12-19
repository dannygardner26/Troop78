export type UserRole = 'admin' | 'scoutmaster' | 'spl' | 'aspl' | 'patrol_leader' | 'parent' | 'scout';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rank?: string;
  patrol?: string;
  phone: string;
  address: string;
  medicalStatus?: 'complete' | 'pending' | 'missing';
  joinDate?: string;
  eagleDate?: string;
}

export interface PermissionSlip {
  scoutId: string;
  signed: boolean;
  signedDate?: string;
  signedBy?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  cost: number;
  imageUrl: string;
  description: string;
  requirements: string[];
  attendees: string[];
  maxParticipants?: number;
  status: 'planning' | 'open' | 'closed' | 'completed';
  permissionSlips?: PermissionSlip[];
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  date: string;
  event: string;
  aiTags: string[];
  verifiedTags: string[];
  faceDetections: {
    scoutId?: string;
    confidence: number;
    verified: boolean;
  }[];
  confidenceScore: number;
  location?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'medical' | 'permission' | 'waiver' | 'policy' | 'newsletter';
  url: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  expirationDate?: string;
  associatedTrip?: string;
}

export interface Newsletter {
  id: string;
  title: string;
  date: string;
  url: string;
  thumbnailUrl: string;
  excerpt: string;
  searchableContent: string;
  month: string;
  year: string;
}

export interface BlastMessage {
  id: string;
  title: string;
  content: string;
  sender: string;
  recipients: string[];
  channels: ('sms' | 'email' | 'app')[];
  isEmergency: boolean;
  sentDate: string;
  readBy: string[];
}

// Mock Users - THE KEY CHARACTERS
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mark Thompson',
    email: 'mark.thompson@troop78.org',
    role: 'scoutmaster',
    phone: '610-555-0123',
    address: '123 Eagle Way, Malvern, PA 19355',
    medicalStatus: 'complete',
    joinDate: '2018-01-01'
  },
  {
    id: '2',
    name: 'Danny',
    email: 'danny@troop78.org',
    role: 'spl',
    rank: 'Eagle Scout',
    patrol: 'Leadership',
    phone: '610-555-0124',
    address: '456 Scout Trail, Malvern, PA 19355',
    medicalStatus: 'complete',
    joinDate: '2019-03-15',
    eagleDate: '2023-08-15'
  },
  {
    id: '3',
    name: 'Kavya',
    email: 'kavya@troop78.org',
    role: 'aspl',
    rank: 'Life Scout',
    patrol: 'Leadership',
    phone: '610-555-0125',
    address: '789 Merit Badge Blvd, Malvern, PA 19355',
    medicalStatus: 'complete',
    joinDate: '2020-01-20'
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@troop78.org',
    role: 'patrol_leader',
    rank: 'Star Scout',
    patrol: 'Thunderbirds',
    phone: '610-555-0126',
    address: '321 Adventure Ave, Malvern, PA 19355',
    medicalStatus: 'pending',
    joinDate: '2021-05-10'
  },
  {
    id: '5',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gmail.com',
    role: 'parent',
    phone: '610-555-0127',
    address: '654 Family Circle, Malvern, PA 19355',
    medicalStatus: 'complete'
  },
  {
    id: '6',
    name: 'Michael Chen',
    email: 'michael.chen@troop78.org',
    role: 'scout',
    rank: 'First Class',
    patrol: 'Thunderbirds',
    phone: '610-555-0128',
    address: '987 Scout Hollow, Malvern, PA 19355',
    medicalStatus: 'missing',
    joinDate: '2022-09-01'
  },
  {
    id: '7',
    name: 'James Wilson',
    email: 'james.wilson@troop78.org',
    role: 'patrol_leader',
    rank: 'Life Scout',
    patrol: 'Eagles',
    phone: '610-555-0129',
    address: '147 Badge Boulevard, Malvern, PA 19355',
    medicalStatus: 'complete',
    joinDate: '2020-08-15'
  },
  {
    id: '8',
    name: 'Tyler Brooks',
    email: 'tyler.brooks@troop78.org',
    role: 'scout',
    rank: 'Tenderfoot',
    patrol: 'Eagles',
    phone: '610-555-0130',
    address: '258 Outdoor Way, Malvern, PA 19355',
    medicalStatus: 'pending',
    joinDate: '2023-02-01'
  }
];

// Mock Trips - THE BIG ADVENTURES
export const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Switzerland Adventure 2026',
    destination: 'Swiss Alps, Switzerland',
    startDate: '2026-07-15',
    endDate: '2026-07-29',
    cost: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    description: 'Two-week adventure through the Swiss Alps including hiking, cultural immersion, and outdoor skills development.',
    requirements: ['Passport', 'Medical Form Part A', 'Medical Form Part B', 'International Travel Waiver', 'Permission Slip'],
    attendees: ['2', '3', '4', '6', '7'],
    maxParticipants: 12,
    status: 'open',
    permissionSlips: [
      { scoutId: '2', signed: true, signedDate: '2024-12-01', signedBy: 'Sarah Johnson' },
      { scoutId: '3', signed: false },
      { scoutId: '4', signed: true, signedDate: '2024-12-10', signedBy: 'James Rodriguez' },
      { scoutId: '6', signed: false },
      { scoutId: '7', signed: false }
    ]
  },
  {
    id: '2',
    name: 'Disney World 2026',
    destination: 'Orlando, Florida',
    startDate: '2026-03-20',
    endDate: '2026-03-24',
    cost: 850,
    imageUrl: 'https://images.unsplash.com/photo-1566552513520-5fe0a9156ba4?w=800',
    description: 'Spring break adventure at Disney World with leadership development activities and fun.',
    requirements: ['Medical Form Part A', 'Permission Slip', 'Packing List Acknowledgment'],
    attendees: ['2', '4', '6', '7', '8'],
    maxParticipants: 20,
    status: 'open',
    permissionSlips: [
      { scoutId: '2', signed: true, signedDate: '2024-11-15', signedBy: 'Sarah Johnson' },
      { scoutId: '4', signed: false },
      { scoutId: '6', signed: false },
      { scoutId: '7', signed: true, signedDate: '2024-11-20', signedBy: 'Mike Wilson' },
      { scoutId: '8', signed: false }
    ]
  },
  {
    id: '3',
    name: 'Winter Camp at Horseshoe',
    destination: 'Horseshoe Scout Reservation, PA',
    startDate: '2024-12-28',
    endDate: '2025-01-02',
    cost: 200,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    description: 'Traditional winter camping with cold weather training and New Year activities.',
    requirements: ['Medical Form Part A', 'Permission Slip', 'Cold Weather Gear Checklist'],
    attendees: ['2', '3', '4', '6', '7', '8'],
    maxParticipants: 25,
    status: 'completed'
  },
  {
    id: '4',
    name: 'Knoebels Amusement Park',
    destination: 'Elysburg, PA',
    startDate: '2024-08-15',
    endDate: '2024-08-16',
    cost: 75,
    imageUrl: 'https://images.unsplash.com/photo-1544075528-2c5b87fa7f52?w=800',
    description: 'Day trip to historic Knoebels amusement park for summer fun and bonding.',
    requirements: ['Permission Slip', 'Swimming Permission (if applicable)'],
    attendees: ['2', '3', '4', '5', '6', '7', '8'],
    maxParticipants: 30,
    status: 'completed'
  },
  {
    id: '5',
    name: 'Gettysburg History Trek',
    destination: 'Gettysburg, PA',
    startDate: '2024-10-12',
    endDate: '2024-10-13',
    cost: 120,
    imageUrl: 'https://images.unsplash.com/photo-1609208421685-d0e644052932?w=800',
    description: 'Educational overnight trip exploring Civil War history and citizenship merit badge requirements.',
    requirements: ['Medical Form Part A', 'Permission Slip', 'History Merit Badge Prerequisites'],
    attendees: ['2', '4', '6', '7'],
    maxParticipants: 15,
    status: 'completed'
  }
];

// Mock Photos - AI TAGGING SHOWCASE
export const mockPhotos: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=200',
    date: '2024-08-15',
    event: 'Knoebels Trip',
    aiTags: ['amusement park', 'scouts', 'group photo', 'summer'],
    verifiedTags: ['amusement park', 'scouts'],
    faceDetections: [
      { scoutId: '2', confidence: 0.98, verified: true },
      { scoutId: '4', confidence: 0.92, verified: false }
    ],
    confidenceScore: 0.95,
    location: 'Knoebels Amusement Resort'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1533873981879-b1f3e82c4d95?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533873981879-b1f3e82c4d95?w=200',
    date: '2024-12-30',
    event: 'Winter Camp',
    aiTags: ['camping', 'winter', 'snow', 'tents', 'cold weather'],
    verifiedTags: ['camping', 'winter'],
    faceDetections: [
      { scoutId: '3', confidence: 0.89, verified: true }
    ],
    confidenceScore: 0.91,
    location: 'Horseshoe Scout Reservation'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
    date: '2024-10-12',
    event: 'Gettysburg Trip',
    aiTags: ['hiking', 'history', 'battlefield', 'educational'],
    verifiedTags: ['history', 'educational'],
    faceDetections: [
      { scoutId: '2', confidence: 0.94, verified: true },
      { scoutId: '7', confidence: 0.87, verified: false }
    ],
    confidenceScore: 0.88,
    location: 'Gettysburg National Battlefield'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=200',
    date: '2024-06-15',
    event: 'Summer Camp',
    aiTags: ['campfire', 'evening', 'scouts', 'outdoor cooking'],
    verifiedTags: ['campfire', 'scouts'],
    faceDetections: [
      { scoutId: '6', confidence: 0.85, verified: false },
      { scoutId: '8', confidence: 0.91, verified: true }
    ],
    confidenceScore: 0.88,
    location: 'Camp Horseshoe'
  }
];

// Mock Documents - THE VAULT
export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Medical Form Part A',
    type: 'medical',
    url: '/documents/medical-form-a.pdf',
    uploadDate: '2024-01-15',
    uploadedBy: '1',
    status: 'approved'
  },
  {
    id: '2',
    name: 'Medical Form Part B',
    type: 'medical',
    url: '/documents/medical-form-b.pdf',
    uploadDate: '2024-01-15',
    uploadedBy: '1',
    status: 'approved',
    expirationDate: '2025-01-15'
  },
  {
    id: '3',
    name: 'Switzerland Trip Permission Slip',
    type: 'permission',
    url: '/documents/switzerland-permission.pdf',
    uploadDate: '2024-11-01',
    uploadedBy: '2',
    status: 'pending',
    associatedTrip: '1'
  },
  {
    id: '4',
    name: 'Whitewater Rafting Waiver',
    type: 'waiver',
    url: '/documents/whitewater-waiver.pdf',
    uploadDate: '2024-06-15',
    uploadedBy: '1',
    status: 'approved'
  }
];

// Mock Newsletters - AI OCR SEARCH
export const mockNewsletters: Newsletter[] = [
  {
    id: '1',
    title: 'December 2023 - Eagle Recognitions',
    date: '2023-12-01',
    url: '/newsletters/december-2023.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    excerpt: 'Congratulations to our newest Eagle Scouts and winter camp preparations.',
    searchableContent: 'Eagle Scout recognition ceremony Danny Kavya winter camp preparations merit badge opportunities leadership development outdoor skills advancement ceremony celebration achievement rank advancement scouting excellence community service project leadership skills development',
    month: 'December',
    year: '2023'
  },
  {
    id: '2',
    title: 'September 2024 - Fall Activities',
    date: '2024-09-01',
    url: '/newsletters/september-2024.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200',
    excerpt: 'Fall camping schedule and upcoming fundraising activities.',
    searchableContent: 'fall camping schedule fundraising popcorn sales hiking trips merit badge sessions outdoor activities patrol competitions leadership development autumn adventures gear preparation weather safety camping skills advancement opportunities',
    month: 'September',
    year: '2024'
  },
  {
    id: '3',
    title: 'March 2024 - Spring Adventures',
    date: '2024-03-01',
    url: '/newsletters/march-2024.pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
    excerpt: 'Spring camping plans and summer trip preparations.',
    searchableContent: 'spring camping plans summer trip preparations Switzerland 2026 Disney World planning sessions international travel passport requirements medical forms preparation hiking equipment outdoor skills development adventure planning leadership opportunities',
    month: 'March',
    year: '2024'
  }
];

// Mock Blast Messages - COMMUNICATION SYSTEM
export const mockBlastMessages: BlastMessage[] = [
  {
    id: '1',
    title: 'Meeting Reminder - This Thursday',
    content: 'Don\'t forget about this Thursday\'s troop meeting at 7:30 PM. We\'ll be working on knots and emergency preparedness.',
    sender: '1',
    recipients: ['2', '3', '4', '6', '7', '8'],
    channels: ['sms', 'email'],
    isEmergency: false,
    sentDate: '2024-12-16T10:00:00Z',
    readBy: ['2', '3']
  },
  {
    id: '2',
    title: '🚨 EMERGENCY: Weather Alert',
    content: 'URGENT: Winter camp activities suspended due to severe weather. All scouts shelter in main lodge immediately.',
    sender: '1',
    recipients: ['all'],
    channels: ['sms', 'email', 'app'],
    isEmergency: true,
    sentDate: '2024-12-30T08:15:00Z',
    readBy: ['2', '3', '4', '6', '7', '8']
  }
];

// Helper Functions
export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(user => user.role === role);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getTripById = (id: string): Trip | undefined => {
  return mockTrips.find(trip => trip.id === id);
};

export const getPhotosByEvent = (event: string): Photo[] => {
  return mockPhotos.filter(photo => photo.event.toLowerCase().includes(event.toLowerCase()));
};

export const searchNewsletters = (query: string): Newsletter[] => {
  const searchTerm = query.toLowerCase();
  return mockNewsletters.filter(newsletter =>
    newsletter.searchableContent.toLowerCase().includes(searchTerm) ||
    newsletter.title.toLowerCase().includes(searchTerm) ||
    newsletter.excerpt.toLowerCase().includes(searchTerm)
  );
};

export const getCurrentMemoryOfDay = (): Photo => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % mockPhotos.length;
  return mockPhotos[index];
};

// Constants for the Application
export const PATROLS = ['Thunderbirds', 'Eagles', 'Leadership'];
export const RANKS = ['Scout', 'Tenderfoot', 'Second Class', 'First Class', 'Star Scout', 'Life Scout', 'Eagle Scout'];
export const DOCUMENT_TYPES = ['Medical Form Part A', 'Medical Form Part B', 'Permission Slip', 'Waiver', 'Packing List'];

// Location Constants for the Interactive Map
export const TROOP_LOCATION = {
  address: '15 Mill Road, Malvern, PA 19355',
  coordinates: { lat: 40.0348, lng: -75.5134 },
  mapNote: 'Navigation Warning: Google Maps is inaccurate here. Follow the pin, not the street number.'
};

// Eagle Scouts 2024 - for the quick stats
export const eagleScouts2024 = mockUsers.filter(user =>
  user.eagleDate && user.eagleDate.startsWith('2024')
);

// Search functionality
export const searchContent = (query: string) => {
  const searchTerm = query.toLowerCase();
  const results = [];

  // Search users
  const userResults = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm) ||
    (user.rank && user.rank.toLowerCase().includes(searchTerm))
  ).map(user => ({
    id: user.id,
    type: 'scout' as const,
    title: user.name,
    subtitle: user.role === 'scout' ? user.rank || 'Scout' : user.role,
    description: user.email
  }));

  // Search trips
  const tripResults = mockTrips.filter(trip =>
    trip.name.toLowerCase().includes(searchTerm) ||
    trip.destination.toLowerCase().includes(searchTerm) ||
    trip.description.toLowerCase().includes(searchTerm)
  ).map(trip => ({
    id: trip.id,
    type: 'trip' as const,
    title: trip.name,
    subtitle: trip.destination,
    description: trip.description
  }));

  // Search photos
  const photoResults = mockPhotos.filter(photo =>
    photo.event.toLowerCase().includes(searchTerm) ||
    photo.aiTags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    photo.verifiedTags.some(tag => tag.toLowerCase().includes(searchTerm))
  ).map(photo => ({
    id: photo.id,
    type: 'photo' as const,
    title: photo.event,
    subtitle: photo.date,
    description: photo.verifiedTags.join(', ')
  }));

  return [...userResults, ...tripResults, ...photoResults];
};