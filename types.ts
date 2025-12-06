export interface JobConfig {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: number; // 0-10 years
  weights: {
    skills: number;
    experience: number;
    fit: number;
  };
}

export interface CandidateFile {
  id: string;
  file: File;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  extractedText?: string;
  previewUrl?: string; // For images or PDF thumbnails
  type: 'pdf' | 'image';
}

export interface AnalysisResult {
  candidateId: string;
  candidateName: string; // Extracted from CV
  score: number; // 0-100
  matchSummary: string;
  pros: string[];
  cons: string[];
  skillsFound: string[];
}

export interface ComparisonResult {
  winnerId: string;
  summary: string;
  dimensions: {
    name: string; // e.g., "Technical Skills", "Experience Depth", "Communication"
    evaluations: Record<string, string>; // candidateId -> specific comment
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppState {
  view: 'landing' | 'setup' | 'processing' | 'results';
  jobConfig: JobConfig;
  candidates: CandidateFile[];
  analysisResults: AnalysisResult[];
}
