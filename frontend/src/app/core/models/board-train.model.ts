export interface BoardTrainProgram {
  id: string;
  serviceTypeId: string;
  serviceTypeName?: string;
  clientId: string;
  clientName?: string;
  dogId: string;
  dogName?: string;
  trainerId?: string;
  trainerName?: string;
  startDate: string;
  endDate: string;
  status: BoardTrainStatus;
  pickupInstructions?: string;
  dropoffInstructions?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dailyNotes?: DailyNote[];
  createdAt: string;
}

export type BoardTrainStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface BoardTrainRequest {
  dogId: string;
  serviceTypeId: string;
  startDate: string;
  endDate: string;
  pickupInstructions?: string;
  dropoffInstructions?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  goals?: string[];
}

export interface DailyNote {
  date: string;
  note: string;
  mediaUrls?: string[];
  mood?: string;
}

export interface DailyNoteRequest {
  date: string;
  note: string;
  mediaUrls?: string[];
  mood?: string;
}
