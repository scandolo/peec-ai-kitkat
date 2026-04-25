export type Platform = 'linkedin' | 'reddit' | 'x';
export type ConnectionType = 'direct' | 'adjacent' | 'cultural';

export interface VisibilityGap {
  topicId: string;
  topicName: string;
  visibility: number;
  competitorAvg: number;
  shareOfVoice: number;
}

export interface ConversationOpportunity {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  relevanceScore: number;
  connectionType: ConnectionType;
  relatedTopicId: string;
  peecInsight: string;
  estimatedVisibilityLift: number;
  draftScaffold?: DraftScaffold;
}

export interface DraftScaffold {
  opener: string;
  angle: string;
  supporting: string;
  cta: string;
  alternates: { bolder: string; technical: string; shorter: string };
}

export interface VoiceProfile {
  summary: string;
  traits: string[];
  toneSpectrum: {
    formality: number;
    technicality: number;
    boldness: number;
    humor: number;
    warmth: number;
  };
  signaturePhrases: string[];
  taboos: string[];
  engagementStyle: string;
  brandContextSummary: string;
}

export interface Trend {
  id: string;
  title: string;
  description: string;
  surface: 'world' | 'niche';
  relatedTopicId: string;
  expectedLiftPp: number;
  evidence: string[];
}

export interface BrandSetup {
  name: string;
  domain: string;
  competitors: string[];
  voiceSources: string[];
  peecProjectId: string;
}
