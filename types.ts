export enum AppStep {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD'
}

export enum FileType {
  PDF = 'application/pdf',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  TEXT = 'text/plain'
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'MCQ' | 'Short' | 'TrueFalse';
}

export interface StructuredNotes {
  summary: string;
  bulletPoints: string[];
  detailedNotes: {
    heading: string;
    content: string;
  }[];
  definitions: {
    term: string;
    definition: string;
  }[];
  mindMap: {
    topic: string;
    subtopics: string[];
  }[];
}

export interface AIResponseData {
  notes: StructuredNotes;
  assessments: Question[];
}

export type ProcessingStatus = 'idle' | 'reading' | 'analyzing' | 'generating' | 'complete' | 'error';
