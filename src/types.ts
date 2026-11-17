export interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  issueType: 'pothole' | 'damaged_footpath' | 'blocked_ramp' | 'construction' | 'broken_footpath' | 'other';
  title: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  createdAt: string;
  verificationStatus: 'PENDING_AI' | 'AI_APPROVED' | 'AI_REJECTED' | 'MANUAL_REVIEW' | 'VERIFIED' | 'REJECTED';
  complaintStatus: 'PREPARED' | 'PUBLISHED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  aiConfidence: number;
  aiExplanation: string;
  authenticityScore: number;
  stillPresentVotes: number;
  noLongerPresentVotes: number;
  imageExpiryDate: string;
  imageValidityStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  adminVerifiedBy?: string;
  adminVerificationTimestamp?: string;
  publishedDepartmentId?: string;
  publishedAt?: string;
  complaintReferenceNumber?: string;
}

export interface GovernmentDepartment {
  id: string;
  name: string;
  type: string;
  officerName: string;
  email: string;
  phone: string;
  jurisdiction: string;
  categories: string[];
  active: boolean;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  commentText: string;
  createdAt: string;
}

export interface AccessibilitySettings {
  textSizeMultiplier: number; // 1.0, 1.25, 1.5
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
  textToSpeechEnabled: boolean;
  language: string;
  voiceAssistanceActive: boolean;
}

export interface RouteOption {
  id: string;
  title: string;
  type: 'safest' | 'shortest' | 'alternative';
  distance: string;
  duration: string;
  obstacleCount: number;
  confidenceScore: number;
  difficulty: 'Easy' | 'Moderate' | 'Caution Required';
  limitations: string[];
  color: string;
  path: { lat: number; lng: number }[];
  startName?: string;
  endName?: string;
  startCoords?: { lat: number; lng: number };
  endCoords?: { lat: number; lng: number };
  steps?: string[];
}
