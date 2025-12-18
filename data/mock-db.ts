export type UserRole = 'scoutmaster' | 'spl' | 'patrol_leader' | 'parent' | 'scout';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  scoutId?: string;
  patrolId?: string;
  rank?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medicalFormStatus?: {
    partA: boolean;
    partB: boolean;
    partC: boolean;
  };
}

export interface Scout {
  id: string;
  name: string;
  rank: string;
  patrolId: string;
  joinDate: string;
  parentIds: string[];
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medicalFormStatus?: {
    partA: boolean;
    partB: boolean;
    partC: boolean;
  };
  eagleScout?: boolean;
  eagleDate?: string;
}

export interface Patrol {
  id: string;
  name: string;
  leaderId?: string;
  members: string[];
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  cost?: number;
  attendees?: string[];
  permissionSlips?: {
    scoutId: string;
    signed: boolean;
    signedDate?: string;
  }[];
}

export interface Photo {
  id: string;
  filename: string;
  url: string;
  uploadDate: string;
  aiTags: {
    tag: string;
    confidence: number;
    verified: boolean;
  }[];
  event?: string;
  scoutsIdentified?: string[];
}

export interface Newsletter {
  id: string;
  title: string;
  month: string;
  year: number;
  pdfUrl: string;
  summary?: string;
}

export interface MemoryOfDay {
  id: string;
  date: string;
  title: string;
  description: string;
  photo: string;
  yearAgo: number;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: 'scoutmaster-1',
    name: 'Mark Thompson',
    email: 'mark.thompson@troop78.org',
    role: 'scoutmaster',
    phone: '610-555-0123',
    address: '123 Main St, Malvern, PA 19355'
  },
  {
    id: 'spl-1',
    name: 'Danny Wilson',
    email: 'danny.wilson@email.com',
    role: 'spl',
    scoutId: 'scout-1',
    phone: '610-555-0124'
  },
  {
    id: 'pl-1',
    name: 'Kavya Patel',
    email: 'kavya.patel@email.com',
    role: 'patrol_leader',
    scoutId: 'scout-2',
    patrolId: 'patrol-1',
    phone: '610-555-0125'
  },
  {
    id: 'parent-1',
    name: 'Jennifer Wilson',
    email: 'j.wilson@email.com',
    role: 'parent',
    phone: '610-555-0126',
    address: '456 Oak Ave, Wayne, PA 19087'
  }
];

export const mockScouts: Scout[] = [
  {
    id: 'scout-1',
    name: 'Danny Wilson',
    rank: 'Eagle Scout',
    patrolId: 'patrol-1',
    joinDate: '2020-03-15',
    parentIds: ['parent-1'],
    phone: '610-555-0124',
    eagleScout: true,
    eagleDate: '2024-08-15',
    medicalFormStatus: {
      partA: true,
      partB: true,
      partC: true
    }
  },
  {
    id: 'scout-2',
    name: 'Kavya Patel',
    rank: 'Life Scout',
    patrolId: 'patrol-1',
    joinDate: '2020-09-20',
    parentIds: ['parent-2'],
    medicalFormStatus: {
      partA: true,
      partB: true,
      partC: false
    }
  },
  {
    id: 'scout-3',
    name: 'Alex Rodriguez',
    rank: 'Star Scout',
    patrolId: 'patrol-2',
    joinDate: '2021-01-10',
    parentIds: ['parent-3'],
    medicalFormStatus: {
      partA: true,
      partB: false,
      partC: false
    }
  },
  {
    id: 'scout-4',
    name: 'Michael Chen',
    rank: 'First Class',
    patrolId: 'patrol-1',
    joinDate: '2021-06-01',
    parentIds: ['parent-4']
  },
  {
    id: 'scout-5',
    name: 'Sarah Johnson',
    rank: 'Second Class',
    patrolId: 'patrol-2',
    joinDate: '2022-03-15',
    parentIds: ['parent-5']
  }
];

export const mockPatrols: Patrol[] = [
  {
    id: 'patrol-1',
    name: 'Flaming Arrows',
    leaderId: 'scout-2',
    members: ['scout-1', 'scout-2', 'scout-4']
  },
  {
    id: 'patrol-2',
    name: 'Thunder Hawks',
    leaderId: 'scout-3',
    members: ['scout-3', 'scout-5']
  }
];

export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    name: 'Switzerland High Adventure 2026',
    description: 'International Scout Centre Kandersteg - Alpine adventure including hiking, climbing, and cultural experiences.',
    startDate: '2026-07-15',
    endDate: '2026-07-29',
    location: 'Kandersteg, Switzerland',
    cost: 3500,
    attendees: ['scout-1', 'scout-2'],
    permissionSlips: [
      { scoutId: 'scout-1', signed: true, signedDate: '2024-12-10' },
      { scoutId: 'scout-2', signed: false }
    ]
  },
  {
    id: 'trip-2',
    name: 'Disney World Adventure 2026',
    description: 'Behind the scenes tours, teamwork challenges, and magical experiences.',
    startDate: '2026-04-12',
    endDate: '2026-04-16',
    location: 'Orlando, FL',
    cost: 1200,
    attendees: ['scout-3', 'scout-4', 'scout-5']
  },
  {
    id: 'trip-3',
    name: 'Winter Camp at Horseshoe',
    description: 'Traditional winter camping experience with cold weather activities.',
    startDate: '2025-01-09',
    endDate: '2025-01-11',
    location: 'Camp Horseshoe Scout Reservation',
    cost: 75,
    attendees: ['scout-1', 'scout-2', 'scout-3', 'scout-4', 'scout-5']
  },
  {
    id: 'trip-4',
    name: 'Knoebels Amusement Resort',
    description: 'Annual troop fun day at Americas largest free-admission amusement park.',
    startDate: '2025-06-14',
    endDate: '2025-06-14',
    location: 'Elysburg, PA',
    cost: 45
  },
  {
    id: 'trip-5',
    name: 'Gettysburg National Battlefield',
    description: 'Educational tour of Civil War battlefield with camping.',
    startDate: '2025-09-20',
    endDate: '2025-09-22',
    location: 'Gettysburg, PA',
    cost: 65
  }
];

export const mockPhotos: Photo[] = [
  {
    id: 'photo-1',
    filename: 'winter_camp_2024_01.jpg',
    url: '/images/winter-camp-1.jpg',
    uploadDate: '2024-01-15',
    aiTags: [
      { tag: 'Winter Camp', confidence: 98, verified: true },
      { tag: 'Horseshoe', confidence: 95, verified: true },
      { tag: 'Snow Activities', confidence: 92, verified: false }
    ],
    event: 'Winter Camp 2024',
    scoutsIdentified: ['scout-1', 'scout-2']
  },
  {
    id: 'photo-2',
    filename: 'archery_range_2024.jpg',
    url: '/images/archery-range.jpg',
    uploadDate: '2024-07-20',
    aiTags: [
      { tag: 'Archery', confidence: 99, verified: true },
      { tag: 'Merit Badge', confidence: 88, verified: false },
      { tag: 'Summer Camp', confidence: 85, verified: true }
    ],
    event: 'Summer Camp 2024',
    scoutsIdentified: ['scout-3', 'scout-4']
  },
  {
    id: 'photo-3',
    filename: 'eagle_ceremony_danny.jpg',
    url: '/images/eagle-ceremony.jpg',
    uploadDate: '2024-08-20',
    aiTags: [
      { tag: 'Eagle Scout', confidence: 99, verified: true },
      { tag: 'Ceremony', confidence: 97, verified: true },
      { tag: 'Danny Wilson', confidence: 95, verified: true }
    ],
    event: 'Eagle Scout Ceremony',
    scoutsIdentified: ['scout-1']
  }
];

export const mockNewsletters: Newsletter[] = [
  {
    id: 'newsletter-1',
    title: 'Troop 78 Newsletter - January 2025',
    month: 'January',
    year: 2025,
    pdfUrl: '/newsletters/2025-01.pdf',
    summary: 'Winter camp preparation, new merit badge opportunities, and upcoming Switzerland trip details.'
  },
  {
    id: 'newsletter-2',
    title: 'Troop 78 Newsletter - December 2024',
    month: 'December',
    year: 2024,
    pdfUrl: '/newsletters/2024-12.pdf',
    summary: 'Holiday court of honor, Eagle Scout recognitions, and year-end activities.'
  },
  {
    id: 'newsletter-3',
    title: 'Troop 78 Newsletter - November 2024',
    month: 'November',
    year: 2024,
    pdfUrl: '/newsletters/2024-11.pdf',
    summary: 'Fall camping recap, advancement updates, and Disney World 2026 announcements.'
  }
];

export const mockMemoriesOfDay: MemoryOfDay[] = [
  {
    id: 'memory-1',
    date: '2024-12-17',
    title: 'Winter Camp Planning Meeting',
    description: 'On this day 1 year ago, we held our annual winter camp planning meeting where scouts chose their cold weather activities and prepared for the adventure ahead.',
    photo: '/images/winter-planning.jpg',
    yearAgo: 1
  },
  {
    id: 'memory-2',
    date: '2024-12-16',
    title: 'Eagle Board of Review',
    description: '3 years ago today, three scouts completed their Eagle Scout Board of Review, marking the culmination of years of hard work and dedication.',
    photo: '/images/eagle-board.jpg',
    yearAgo: 3
  }
];

export const eagleScouts2024 = [
  'Danny Wilson - August 15, 2024',
  'Sarah Mitchell - June 10, 2024',
  'Tyler Brooks - March 22, 2024'
];

export const historicalEagleScouts = [
  '2023: Michael Thompson, Jessica Chen, Ryan O\'Connor',
  '2022: Alex Rodriguez, Emma Davis, Nathan Kim',
  '2021: Chloe Johnson, Marcus Williams, Isabella Garcia',
  '2020: Ethan Moore, Sophia Taylor, Jacob Anderson'
];

// Utility functions for working with mock data
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getScoutById = (id: string): Scout | undefined => {
  return mockScouts.find(scout => scout.id === id);
};

export const getPatrolById = (id: string): Patrol | undefined => {
  return mockPatrols.find(patrol => patrol.id === id);
};

export const getTripById = (id: string): Trip | undefined => {
  return mockTrips.find(trip => trip.id === id);
};

export const getScoutsByPatrol = (patrolId: string): Scout[] => {
  return mockScouts.filter(scout => scout.patrolId === patrolId);
};

export const getCurrentMemoryOfDay = (): MemoryOfDay => {
  const today = new Date().getDate() % mockMemoriesOfDay.length;
  return mockMemoriesOfDay[today];
};

export const searchContent = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  const results = {
    scouts: mockScouts.filter(scout =>
      scout.name.toLowerCase().includes(lowercaseQuery) ||
      scout.rank.toLowerCase().includes(lowercaseQuery)
    ),
    trips: mockTrips.filter(trip =>
      trip.name.toLowerCase().includes(lowercaseQuery) ||
      trip.location.toLowerCase().includes(lowercaseQuery)
    ),
    photos: mockPhotos.filter(photo =>
      photo.aiTags.some(tag => tag.tag.toLowerCase().includes(lowercaseQuery)) ||
      photo.event?.toLowerCase().includes(lowercaseQuery)
    ),
    newsletters: mockNewsletters.filter(newsletter =>
      newsletter.title.toLowerCase().includes(lowercaseQuery) ||
      newsletter.summary?.toLowerCase().includes(lowercaseQuery)
    )
  };
  return results;
};