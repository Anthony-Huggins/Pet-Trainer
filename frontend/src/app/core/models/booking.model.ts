export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  dogId: string;
  dogName: string;
  session: Session;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  sessionId: string;
  dogId: string;
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  WAITLISTED = 'WAITLISTED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export interface Session {
  id: string;
  serviceTypeId?: string;
  serviceTypeName?: string;
  classSeriesId?: string;
  trainerId: string;
  trainerName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface ClassSeries {
  id: string;
  serviceTypeId: string;
  serviceTypeName: string;
  trainerId: string;
  trainerName: string;
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
  spotsAvailable: number;
  status: string;
  createdAt: string;
}

export interface ClassEnrollment {
  id: string;
  classSeriesId: string;
  classSeriesTitle: string;
  clientId: string;
  clientName: string;
  dogId: string;
  dogName: string;
  status: EnrollmentStatus;
  waitlistPosition?: number;
  enrolledAt: string;
  createdAt: string;
}

export interface ClassEnrollmentRequest {
  classSeriesId: string;
  dogId: string;
}

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  WAITLISTED = 'WAITLISTED',
  DROPPED = 'DROPPED',
  COMPLETED = 'COMPLETED',
}

export interface SessionRequest {
  serviceTypeId: string;
  trainerId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
}

export interface ClassSeriesRequest {
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
}
