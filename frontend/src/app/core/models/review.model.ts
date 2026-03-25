export interface Review {
  id: string;
  clientId: string;
  trainerId?: string;
  serviceTypeId?: string;
  rating: number;
  title?: string;
  body?: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
  // Populated fields
  clientName?: string;
  trainerName?: string;
  serviceName?: string;
}

export interface ReviewRequest {
  trainerId?: string;
  serviceTypeId?: string;
  rating: number;
  title?: string;
  body?: string;
}
