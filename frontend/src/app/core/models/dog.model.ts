export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed?: string;
  dateOfBirth?: string;
  weightLbs?: number;
  gender?: string;
  spayedNeutered?: boolean;
  microchipId?: string;
  veterinarianName?: string;
  veterinarianPhone?: string;
  specialNeeds?: string;
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DogVaccination {
  id: string;
  dogId: string;
  vaccinationName: string;
  administeredDate: string;
  expirationDate?: string;
  documentUrl?: string;
  createdAt: string;
}
