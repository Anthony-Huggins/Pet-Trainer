export interface Booking {
  id: string;
  sessionId: string;
  clientId: string;
  dogId: string;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  session?: Session;
  dog?: { id: string; name: string; breed?: string };
  trainer?: { id: string; firstName: string; lastName: string };
  serviceName?: string;
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  WAITLISTED = 'WAITLISTED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export interface Session {
  id: string;
  serviceTypeId?: string;
  classSeriesId?: string;
  trainerId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: string;
  notes?: string;
}

export interface ClassSeries {
  id: string;
  serviceTypeId: string;
  trainerId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  maxParticipants: number;
  currentEnrollment: number;
  status: string;
}
