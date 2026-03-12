export interface TrainerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specializations: string[];
  certifications: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  profilePhotoUrl?: string;
  isAcceptingClients: boolean;
  createdAt: string;
}

export interface TrainerAvailability {
  id: string;
  trainerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
  isAvailable: boolean;
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
}
