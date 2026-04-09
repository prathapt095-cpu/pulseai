export interface UserBehavior {
  id: string;
  name: string;
  email: string;
  loginFrequency: number; // logins per week
  avgSessionDuration: number; // minutes
  featureUsage: {
    feature: string;
    count: number;
  }[];
  lastActive: string; // ISO date
  status: 'active' | 'at-risk' | 'churned';
  churnProbability: number; // 0-100
}

export interface OutreachMessage {
  id: string;
  userId: string;
  userName: string;
  type: 'email' | 'whatsapp' | 'push';
  content: string;
  status: 'pending' | 'sent' | 'failed';
  timestamp: string;
}

export interface ChurnInsight {
  userId: string;
  riskFactors: string[];
  recommendation: string;
  suggestedChannel: 'email' | 'whatsapp' | 'push';
}
