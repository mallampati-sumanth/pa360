export interface User {
  id: number;
  email: string;
  role: 'AUTHORIZATION_SPECIALIST' | 'PROVIDER' | 'BILLING' | 'OPS_MANAGER';
  first_name: string;
  last_name: string;
  phone_number?: string | null;
}
export type UserRole = User['role'];
export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthorizationStatus =
  | 'Draft'
  | 'Ready for Submission'
  | 'Submitted'
  | 'Pending'
  | 'Additional Info Requested'
  | 'Coverage Validation'
  | 'Not Required'
  | 'Approved'
  | 'Service Delivery'
  | 'Billing / RCM'
  | 'Denied'
  | 'Expired'
  | 'Existing (Reused)'
  | 'Exception – Review Required';

export type EdgeCaseType =
  | 'NONE'
  | 'EMERGENCY_RETRO'
  | 'NEWBORN_NEW_ENROLLEE'
  | 'APPROVED_NOT_COVERED'
  | 'DENIAL_APPEAL'
  | 'CLINICAL_CHANGE'
  | 'COB';

export type Priority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface AuthorizationRequest {
  authorization_id: string;
  patient: { patient_id: string; name: string };
  provider: { provider_id: string; provider_name: string };
  payer: { payer_id: string; payer_name: string };
  plan: { plan_id: string; plan_name: string };
  service_code: { service_code: string; service_name: string };
  diagnosis: string;
  clinical_indication: string;
  request_date: string;
  status: AuthorizationStatus;
  priority: Priority;
  missing_information: string[];
  supporting_document?: string;
}