export interface TrainerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  specializations: string[];
  certifications: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  profilePhotoUrl?: string;
  acceptingClients: boolean;
  createdAt: string;
}

export interface TrainerProfileRequest {
  bio?: string;
  specializations?: string[];
  certifications?: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  acceptingClients?: boolean;
}

export interface TrainerAvailability {
  id: string;
  trainerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  recurring: boolean;
  specificDate?: string;
  available: boolean;
}

export interface TrainerAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  recurring?: boolean;
  specificDate?: string;
  available?: boolean;
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
}
