export type UserRole = 'ADOPTER' | 'PROTECTOR' | 'SHELTER_MEMBER' | 'MASTER_ADMIN';

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

export type AnimalSpecies = 'DOG' | 'CAT' | 'OTHER';

export type AnimalSex = 'MALE' | 'FEMALE';

export type AnimalSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'GIANT';

export type AnimalAgeUnit = 'MONTHS' | 'YEARS';

export type AnimalStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'AVAILABLE'
  | 'IN_ADOPTION'
  | 'ADOPTED'
  | 'UNAVAILABLE'
  | 'ARCHIVED';

export type AdoptionApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

