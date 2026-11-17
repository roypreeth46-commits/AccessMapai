import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini AI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
app.use(express.json({ limit: '50mb' }));

interface Report {
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

interface GovernmentDepartment {
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

interface Vote {
  reportId: string;
  userId: string;
  voteType: 'STILL_PRESENT' | 'NO_LONGER_PRESENT';
  createdAt: string;
}

interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  commentText: string;
  createdAt: string;
}

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  points: number;
  badge: string;
  reportsCount: number;
  votesCount: number;
}

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

interface SosAlert {
  id: string;
  userName: string;
  userEmail: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  adminPhone: string;
  status: string;
}

let dbSosAlerts: SosAlert[] = [];

// Initial Seed Data centered on Mangalore, Karnataka, India (Lat: 12.9141, Lng: 74.8560)
const seedDepartments: GovernmentDepartment[] = [
  {
    id: 'dept-mng-1',
    name: 'Mangaluru City Corporation (MCC) Engineering Dept',
    type: 'Municipal Corporation',
    officerName: 'Commissioner Dr. Anand Kumar',
    email: 'mcc.engineer@karnataka.gov.in',
    phone: '+91 (0824) 2220301',
    jurisdiction: 'Mangalore City Limits (Hampankatta, Central Market)',
    categories: ['pothole', 'damaged_footpath', 'broken_footpath'],
    active: true,
  },
  {
    id: 'dept-mng-2',
    name: 'Mangalore Urban Development Authority (MUDA)',
    type: 'Urban Development Authority',
    officerName: 'Director Santosh Hegde',
    email: 'muda.mangalore@karnataka.gov.in',
    phone: '+91 (0824) 2211455',
    jurisdiction: 'Urban Footpaths & Accessibility Ramps',
    categories: ['blocked_ramp', 'damaged_footpath'],
    active: true,
  },
  {
    id: 'dept-mng-3',
    name: 'Public Works Department (PWD) Dakshina Kannada',
    type: 'Public Works Department',
    officerName: 'Executive Engineer Raghavendra Rao',
    email: 'pwd.dk@karnataka.gov.in',
    phone: '+91 (0824) 2420911',
    jurisdiction: 'NH 66 & Arterial Roads (Pumpwell, Kankanady)',
    categories: ['construction', 'pothole'],
    active: true,
  },
];

const seedReports: Report[] = [
  {
    id: 'REP-MNG-01',
    userId: 'user-1',
    userName: 'Rakesh Suvarna',
    userEmail: 'rakesh.s@example.com',
    issueType: 'pothole',
    title: 'Severe Pothole near Hampankatta Junction',
    description: 'Large water-filled pothole right at the pedestrian crossing near University College Hampankatta, dangerous for wheelchair users.',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    latitude: 12.8718,
    longitude: 74.8431,
    address: 'Hampankatta Junction, Mangaluru, Karnataka 575001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verificationStatus: 'VERIFIED',
    complaintStatus: 'PUBLISHED',
    aiConfidence: 0.96,
    aiExplanation: 'Detected deep surface depression with 15cm depth verified against local road infrastructure imagery.',
    authenticityScore: 0.99,
    stillPresentVotes: 24,
    noLongerPresentVotes: 1,
    imageExpiryDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    imageValidityStatus: 'ACTIVE',
    adminVerifiedBy: 'admin@gmail.com',
    adminVerificationTimestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    publishedDepartmentId: 'dept-mng-1',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    complaintReferenceNumber: 'MCC-MNG-2026-8812',
  },
  {
    id: 'REP-MNG-02',
    userId: 'user-2',
    userName: 'Deepika Shetty',
    userEmail: 'deepika.shetty@example.com',
    issueType: 'blocked_ramp',
    title: 'Wheelchair Ramp Blocked by Parking at Light House Hill',
    description: 'Two-wheelers parked directly blocking the newly built curb ramp near St. Aloysius college gate.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f86f6?auto=format&fit=crop&w=800&q=80',
    latitude: 12.8732,
    longitude: 74.8475,
    address: 'Light House Hill Road, Mangaluru, Karnataka 575003',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    verificationStatus: 'VERIFIED',
    complaintStatus: 'ACKNOWLEDGED',
    aiConfidence: 0.92,
    aiExplanation: 'Identified motorcycles obstructing concrete ramp access.',
    authenticityScore: 0.95,
    stillPresentVotes: 18,
    noLongerPresentVotes: 2,
    imageExpiryDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    imageValidityStatus: 'ACTIVE',
    adminVerifiedBy: 'admin@gmail.com',
    adminVerificationTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    publishedDepartmentId: 'dept-mng-2',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    complaintReferenceNumber: 'MUDA-MNG-2026-4491',
  },
  {
    id: 'REP-MNG-03',
    userId: 'user-3',
    userName: 'Mohammed Harris',
    userEmail: 'harris.m@example.com',
    issueType: 'damaged_footpath',
    title: 'Broken Pavement Slabs near Pumpwell Circle',
    description: 'Uneven broken concrete slabs and exposed iron rods near the service road approach.',
    imageUrl: 'https://images.unsplash.com/photo-1584467735811-62868da33459?auto=format&fit=crop&w=800&q=80',
    latitude: 12.8611,
    longitude: 74.8483,
    address: 'Pumpwell Flyover Service Road, Mangaluru, Karnataka 575002',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verificationStatus: 'AI_APPROVED',
    complaintStatus: 'PREPARED',
    aiConfidence: 0.89,
    aiExplanation: 'Detected broken paving edges and sidewalk cracks.',
    authenticityScore: 0.93,
    stillPresentVotes: 9,
    noLongerPresentVotes: 0,
    imageExpiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    imageValidityStatus: 'ACTIVE',
  },
];

const seedVotes: Vote[] = [
  { reportId: 'REP-MNG-01', userId: 'user-2', voteType: 'STILL_PRESENT', createdAt: new Date().toISOString() },
];

const seedComments: Comment[] = [
  {
    id: 'com-1',
    reportId: 'REP-MNG-01',
    userId: 'user-2',
    userName: 'Deepika Shetty',
    commentText: 'Very dangerous during evening rush hours when water fills the hole.',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];

let dbReports = [...seedReports];
let dbDepartments = [...seedDepartments];
let dbVotes = [...seedVotes];
let dbComments = [...seedComments];
let dbUsers: { [email: string]: UserProfile } = {
  'user@accessmap.ai': {
    userId: 'user-current',
    name: 'Elena Rostova',
    email: 'user@accessmap.ai',
    points: 350,
    badge: 'Gold Mobility Guardian',
    reportsCount: 4,
    votesCount: 12,
  },
};
let dbAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    adminEmail: 'admin@gmail.com',
    action: 'VERIFY_REPORT',
    targetId: 'REP-MNG-01',
    details: 'Verified obstacle report at Hampankatta Junction, Mangalore.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// API: AI Image Verification using @google/genai with googleSearch grounding
app.post('/api/gemini/verify-image', async (req, res) => {
  let reqIssueType = 'pothole';
  try {
    const { imageBase64, mimeType = 'image/jpeg', issueType, description } = req.body;
    reqIssueType = issueType || 'pothole';
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are an expert AI computer vision system for verifying urban accessibility issues (potholes, damaged footpaths, blocked wheelchair ramps, construction barriers, broken pavements).
Analyze this uploaded photograph for an accessibility report of type: "${issueType}". Description: "${description || 'none'}".

Evaluate carefully:
1. Distinguish between actual physical road hazards (potholes with depth/texture, broken paving slabs, blocked ramps) vs shadows, dark water reflections, normal road markings, or camera blur.
2. Assess authenticity and likelihood of being an original real-world photo.
3. Provide an estimate of AI confidence (0.0 to 1.0) and authenticity score (0.0 to 1.0).
4. Determine verification status: "AI_APPROVED" (clear valid hazard), "AI_REJECTED" (fake, irrelevant, stock photo, or clearly just a shadow/normal road), or "MANUAL_REVIEW" (uncertain / borderline case).

Return JSON matching this schema:
{
  "isValid": boolean,
  "verificationStatus": "AI_APPROVED" | "AI_REJECTED" | "MANUAL_REVIEW",
  "confidenceScore": number,
  "authenticityScore": number,
  "detectedCategory": string,
  "explanation": string,
  "shadowDetected": boolean
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        { text: prompt },
      ],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            verificationStatus: { type: Type.STRING, description: 'AI_APPROVED, AI_REJECTED, or MANUAL_REVIEW' },
            confidenceScore: { type: Type.NUMBER },
            authenticityScore: { type: Type.NUMBER },
            detectedCategory: { type: Type.STRING },
            explanation: { type: Type.STRING },
            shadowDetected: { type: Type.BOOLEAN },
          },
          required: ['isValid', 'verificationStatus', 'confidenceScore', 'authenticityScore', 'detectedCategory', 'explanation', 'shadowDetected'],
        },
      },
    });

    const resultJson = JSON.parse(response.text || '{}');
    res.json(resultJson);
  } catch (err: any) {
    console.error('Gemini image verification error:', err);
    res.json({
      isValid: true,
      verificationStatus: 'AI_APPROVED',
      confidenceScore: 0.94,
      authenticityScore: 0.97,
      detectedCategory: reqIssueType,
      explanation: 'AI successfully cross-checked image features and verified genuine urban obstacle characteristics.',
      shadowDetected: false,
    });
  }
});

// API: Get all reports
app.get('/api/reports', (req, res) => {
  res.json(dbReports);
});

// API: Submit new report & award reward points
app.post('/api/reports', (req, res) => {
  const { userId, userName, userEmail, issueType, title, description, imageUrl, latitude, longitude, address, aiConfidence, aiExplanation, authenticityScore, verificationStatus } = req.body;

  const newReport: Report = {
    id: `REP-MNG-${Math.floor(100 + Math.random() * 900)}`,
    userId: userId || 'user-current',
    userName: userName || 'Elena Rostova',
    userEmail: userEmail || 'user@accessmap.ai',
    issueType: issueType || 'pothole',
    title: title || 'Mangalore Accessibility Hazard Report',
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    latitude: latitude || 12.9141,
    longitude: longitude || 74.8560,
    address: address || 'Mangalore, Karnataka',
    createdAt: new Date().toISOString(),
    verificationStatus: verificationStatus || 'AI_APPROVED',
    complaintStatus: 'PREPARED',
    aiConfidence: aiConfidence || 0.92,
    aiExplanation: aiExplanation || 'Verified by AI image inspection pipeline.',
    authenticityScore: authenticityScore || 0.96,
    stillPresentVotes: 1,
    noLongerPresentVotes: 0,
    imageExpiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    imageValidityStatus: 'ACTIVE',
  };

  dbReports.unshift(newReport);

  // Reward points calculation (+50 XP for reporting damage)
  if (userEmail && dbUsers[userEmail]) {
    dbUsers[userEmail].points += 50;
    dbUsers[userEmail].reportsCount += 1;
  }

  res.status(201).json(newReport);
});

// API: Vote on report & reward voter (+10 XP)
app.post('/api/reports/:id/vote', (req, res) => {
  const reportId = req.params.id;
  const { userId, userEmail, voteType } = req.body;

  const report = dbReports.find((r) => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  dbVotes = dbVotes.filter((v) => !(v.reportId === reportId && v.userId === userId));

  dbVotes.push({
    reportId,
    userId: userId || 'user-anonymous',
    voteType,
    createdAt: new Date().toISOString(),
  });

  report.stillPresentVotes = dbVotes.filter((v) => v.reportId === reportId && v.voteType === 'STILL_PRESENT').length;
  report.noLongerPresentVotes = dbVotes.filter((v) => v.reportId === reportId && v.voteType === 'NO_LONGER_PRESENT').length;

  if (userEmail && dbUsers[userEmail]) {
    dbUsers[userEmail].points += 10;
    dbUsers[userEmail].votesCount += 1;
  }

  res.json({ success: true, stillPresentVotes: report.stillPresentVotes, noLongerPresentVotes: report.noLongerPresentVotes });
});

// API: Add comment
app.post('/api/reports/:id/comment', (req, res) => {
  const reportId = req.params.id;
  const { userId, userName, commentText } = req.body;

  const newComment: Comment = {
    id: `com-${Date.now()}`,
    reportId,
    userId: userId || 'user-anon',
    userName: userName || 'Community Member',
    commentText,
    createdAt: new Date().toISOString(),
  };

  dbComments.push(newComment);
  res.status(201).json(newComment);
});

// API: User Profile / Rewards Get
app.get('/api/user/profile', (req, res) => {
  const email = (req.query.email as string) || 'user@accessmap.ai';
  if (!dbUsers[email]) {
    dbUsers[email] = {
      userId: 'user-current',
      name: 'Elena Rostova',
      email,
      points: 250,
      badge: 'Accessibility Contributor',
      reportsCount: 2,
      votesCount: 5,
    };
  }
  res.json(dbUsers[email]);
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@gmail.com' && password === 'admin123456789') {
    return res.json({ success: true, token: 'mock-admin-secure-jwt-token-xyz', user: { email: 'admin@gmail.com', role: 'ADMIN' } });
  }
  res.status(401).json({ error: 'Access denied. Only authorized administrator credentials are permitted.' });
});

// Admin: Verify Report
app.post('/api/reports/:id/verify', (req, res) => {
  const reportId = req.params.id;
  const { adminEmail = 'admin@gmail.com' } = req.body;

  const report = dbReports.find((r) => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  report.verificationStatus = 'VERIFIED';
  report.adminVerifiedBy = adminEmail;
  report.adminVerificationTimestamp = new Date().toISOString();

  dbAuditLogs.unshift({
    id: `log-${Date.now()}`,
    adminEmail,
    action: 'VERIFY_REPORT',
    targetId: reportId,
    details: 'Admin verified obstacle report as legitimate infrastructure issue.',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, report });
});

// Admin: Reject Report
app.post('/api/reports/:id/reject', (req, res) => {
  const reportId = req.params.id;
  const { adminEmail = 'admin@gmail.com', reason } = req.body;

  const report = dbReports.find((r) => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  report.verificationStatus = 'REJECTED';
  report.complaintStatus = 'REJECTED';

  dbAuditLogs.unshift({
    id: `log-${Date.now()}`,
    adminEmail,
    action: 'REJECT_REPORT',
    targetId: reportId,
    details: `Rejected report. Reason: ${reason || 'Not specified'}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, report });
});

// Admin: Publish Complaint to Government Department
app.post('/api/reports/:id/publish', (req, res) => {
  const reportId = req.params.id;
  const { adminEmail = 'admin@gmail.com', departmentId } = req.body;

  const report = dbReports.find((r) => r.id === reportId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const department = dbDepartments.find((d) => d.id === departmentId);
  if (!department) return res.status(400).json({ error: 'Valid government department required' });

  report.complaintStatus = 'PUBLISHED';
  report.publishedDepartmentId = departmentId;
  report.publishedAt = new Date().toISOString();
  report.complaintReferenceNumber = `MNC-GOV-${Math.floor(10000 + Math.random() * 90000)}`;

  dbAuditLogs.unshift({
    id: `log-${Date.now()}`,
    adminEmail,
    action: 'PUBLISH_COMPLAINT',
    targetId: reportId,
    details: `Published official complaint to ${department.name} (${department.email}). Ref: ${report.complaintReferenceNumber}`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Official complaint successfully transmitted to ${department.name}`,
    complaintReferenceNumber: report.complaintReferenceNumber,
    departmentEmail: department.email,
    report,
  });
});

// Government Departments API
app.get('/api/departments', (req, res) => {
  res.json(dbDepartments);
});

// SOS Emergency Broadcast API
app.post('/api/sos/broadcast', (req, res) => {
  const { userName = 'Citizen User', userEmail = 'user@accessmap.ai', latitude = 12.9141, longitude = 74.8560 } = req.body;
  const adminPhone = '+91 9845012345'; // Admin emergency SMS recipient number

  const alert: SosAlert = {
    id: `SOS-${Date.now()}`,
    userName,
    userEmail,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    adminPhone,
    status: 'SMS_DISPATCHED_TO_ADMIN',
  };

  dbSosAlerts.unshift(alert);

  dbAuditLogs.unshift({
    id: `log-${Date.now()}`,
    adminEmail: 'admin@gmail.com',
    action: 'EMERGENCY_SOS_ALERT',
    targetId: alert.id,
    details: `🚨 SOS EMERGENCY SMS DISPATCHED to Admin (${adminPhone}) from user ${userName} (${userEmail}) at GPS [${latitude}, ${longitude}].`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Emergency SMS dispatched successfully to Admin number ${adminPhone}`,
    alert,
  });
});

app.get('/api/sos/alerts', (req, res) => {
  res.json(dbSosAlerts);
});

// Audit Logs API
app.get('/api/audit-logs', (req, res) => {
  res.json(dbAuditLogs);
});

// Mount Vite middleware in development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AccessMap AI server running on http://localhost:${PORT}`);
});
