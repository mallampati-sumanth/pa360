import { AuthorizationRequest, AuthorizationStatus, EdgeCaseType } from '@/shared/types';

export interface PARequirementResult {
  result: 'REQUIRED' | 'NOT_REQUIRED' | 'UNKNOWN';
  reason: string;
  required_fields?: string[];
  existing_authorization?: AuthorizationRequest | null;
}

export interface CompletenessResult {
  status: 'COMPLETE' | 'INCOMPLETE' | 'CONFLICTING';
  missing_fields: string[];
  conflicting_fields: string[];
  requires_human_review: boolean;
  human_review_reason: string;
}

export type WorkflowAction = 
  | 'submit_for_review'
  | 'approve_for_submission'
  | 'submit_to_payer'
  | 'request_more_info'
  | 'appeal'
  | 'retro_auth'
  | 'verify_coverage'
  | 'check_clinical_change';
