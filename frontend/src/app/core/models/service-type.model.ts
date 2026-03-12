export interface ServiceType {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  durationMinutes?: number;
  maxParticipants?: number;
  price: number;
  depositAmount?: number;
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string;
  createdAt: string;
}

export enum ServiceCategory {
  PRIVATE = 'PRIVATE',
  GROUP_CLASS = 'GROUP_CLASS',
  BOARD_AND_TRAIN = 'BOARD_AND_TRAIN',
}
