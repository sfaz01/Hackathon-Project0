
export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface TriageResult {
  category: string;
  severity: 1 | 2 | 3 | 4 | 5;
  priority_score: number;
  summary: string;
  suggested_action: string;
  probable_cause: string;
  confidence_level: number;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface MapSource {
  uri: string;
  title:string;
  placeAnswerSources?: { reviewSnippets: { uri: string; title: string }[] };
}

export interface GroundingChunk {
  web?: WebSource;
  maps?: MapSource;
}

export interface Feedback {
    rating: number;
    comment: string;
}

export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  credits: number;
  isPhoneVerified: boolean;
  lastValidationDate: string | null; // ISO string for date
  streak: number;
  neighborhood: string;
}

export type BadgeCriteria = {
    type: 'validated_count' | 'streak_length';
    threshold: number;
};

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: 'TrophyIcon' | 'SparklesIcon' | 'HeartIcon' | 'RocketLaunchIcon';
  criteria: BadgeCriteria;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  awardedAt: Date;
}


export interface Report {
  id: string;
  userId: string; // Link report to a user
  description: string;
  photo: {
    base64: string;
    mimeType: string;
    url: string;
  };
  location: Geolocation | null;
  timestamp: Date;
  triageResult: TriageResult | null;
  groundingChunks: GroundingChunk[] | null;
  status: 'pending' | 'triaging' | 'complete' | 'error' | 'resolved';
  kanbanStatus: 'pending' | 'in-progress' | 'done';
  acceptanceStatus: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  errorMessage?: string;
  thinkingMode: boolean;
  feedback?: Feedback;
  validatedAt: Date | null;
}

export interface Prediction {
  id: string;
  type: 'Pothole/Crack Formation' | 'Localized Flooding' | 'Structural Stress';
  location: Geolocation;
  riskLevel: 'High' | 'Medium' | 'Low';
  timeframe: string; // e.g., "Next 2-4 weeks"
  reasoning: string;
  confidence: number;
}