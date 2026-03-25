export * from './user.model';
export * from './dog.model';
export * from './service-type.model';
export * from './trainer.model';
export * from './booking.model';
export * from './payment.model';
export * from './notification.model';
export * from './review.model';
export * from './training-log.model';
export * from './board-train.model';
export * from './admin.model';
export * from './referral.model';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: string[];
  timestamp: string;
}
