export interface ManagerSummary {
  total_requests_this_month: number;
  avg_turnaround_days: number;
  denial_rate_percent: number;
  exception_count: number;
  pending_human_review: number;
  sla_breach_count: number;
  turnaround_data: TurnaroundDataPoint[];
  denial_data: DenialDataPoint[];
  workload_data: WorkloadDataPoint[];
  exception_trend: ExceptionTrendPoint[];
}

export interface TurnaroundDataPoint {
  week: string;
  avg_days: number;
  payer: string;
}

export interface DenialDataPoint {
  month: string;
  payer: string;
  service: string;
  count: number;
}

export interface WorkloadDataPoint {
  specialist_name: string;
  open_requests: number;
  pending_review: number;
  exceptions: number;
}

export interface ExceptionTrendPoint {
  date: string;
  EMERGENCY_RETRO: number;
  NEWBORN_NEW_ENROLLEE: number;
  APPROVED_NOT_COVERED: number;
  DENIAL_APPEAL: number;
  CLINICAL_CHANGE: number;
  COB: number;
}
