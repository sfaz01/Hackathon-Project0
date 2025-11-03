
import type { User, Report, Badge } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alex Johnson', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Alex`, credits: 150, isPhoneVerified: true, lastValidationDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], streak: 2, neighborhood: 'Downtown Core' },
  { id: 'user-2', name: 'Maria Garcia', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Maria`, credits: 75, isPhoneVerified: true, lastValidationDate: null, streak: 0, neighborhood: 'North Park' },
  { id: 'user-3', name: 'Chen Wei', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Chen`, credits: 240, isPhoneVerified: true, lastValidationDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], streak: 5, neighborhood: 'Downtown Core' },
  { id: 'user-4', name: 'Fatima Al-Fassi', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Fatima`, credits: 30, isPhoneVerified: false, lastValidationDate: null, streak: 0, neighborhood: 'West End' },
  { id: 'user-5', name: 'John Smith', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=John`, credits: 0, isPhoneVerified: true, lastValidationDate: null, streak: 0, neighborhood: 'North Park' },
];

export const MOCK_BADGES: Badge[] = [
    { id: 'badge-1', title: 'First Report', description: 'Submit your first validated report.', icon: 'TrophyIcon', criteria: { type: 'validated_count', threshold: 1 } },
    { id: 'badge-2', title: 'Community Helper', description: 'Get 5 reports validated.', icon: 'HeartIcon', criteria: { type: 'validated_count', threshold: 5 } },
    { id: 'badge-3', title: 'Civic Champion', description: 'Get 10 reports validated.', icon: 'SparklesIcon', criteria: { type: 'validated_count', threshold: 10 } },
    { id: 'badge-4', title: 'Hot Streak', description: 'Maintain a 3-day validation streak.', icon: 'RocketLaunchIcon', criteria: { type: 'streak_length', threshold: 3 } },
];