export interface TrainingGoal {
  id: string;
  dogId: string;
  trainerId?: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: string;
  progressPercent: number;
  createdAt: string;
}

export interface TrainingLog {
  id: string;
  sessionId?: string;
  dogId: string;
  trainerId: string;
  logDate: string;
  summary: string;
  skillsWorked: string[];
  behaviorNotes?: string;
  homework?: string;
  rating?: number;
  createdAt: string;
  // Populated fields
  trainerName?: string;
  media?: TrainingMedia[];
}

export interface TrainingMedia {
  id: string;
  trainingLogId?: string;
  dogId?: string;
  mediaType: 'PHOTO' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
}
