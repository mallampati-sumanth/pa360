import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { AuthorizationStatus, EdgeCaseType, Priority } from './types';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculateDaysOpen(requestDate: string): number {
  return differenceInDays(new Date(), new Date(requestDate));
}

export function getStatusColor(status: AuthorizationStatus): string {
  const map: Record<AuthorizationStatus, string> = {
    'Draft': 'bg-gray-100 text-gray-700',
    'Ready for Submission': 'bg-blue-100 text-blue-700',
    'Submitted': 'bg-blue-200 text-blue-800',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Additional Info Requested': 'bg-orange-100 text-orange-700',
    'Coverage Validation': 'bg-cyan-100 text-cyan-700',
    'Not Required': 'bg-emerald-100 text-emerald-700',
    'Approved': 'bg-green-100 text-green-700',
    'Service Delivery': 'bg-indigo-100 text-indigo-700',
    'Billing / RCM': 'bg-violet-100 text-violet-700',
    'Denied': 'bg-red-100 text-red-700',
    'Expired': 'bg-gray-200 text-gray-600',
    'Existing (Reused)': 'bg-teal-100 text-teal-700',
    'Exception – Review Required': 'bg-purple-100 text-purple-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    ROUTINE: 'bg-gray-100 text-gray-600',
    URGENT: 'bg-yellow-100 text-yellow-700',
    EMERGENCY: 'bg-red-100 text-red-700 animate-pulse',
  };
  return map[priority] ?? 'bg-gray-100 text-gray-600';
}

export function getEdgeCaseBadgeVariant(type: EdgeCaseType): string {
  const map: Record<EdgeCaseType, string> = {
    NONE: '',
    EMERGENCY_RETRO: 'bg-red-600 text-white',
    NEWBORN_NEW_ENROLLEE: 'bg-orange-500 text-white',
    APPROVED_NOT_COVERED: 'bg-amber-500 text-white',
    DENIAL_APPEAL: 'bg-rose-600 text-white',
    CLINICAL_CHANGE: 'bg-violet-600 text-white',
    COB: 'bg-teal-600 text-white',
  };
  return map[type] ?? '';
}

export function getEdgeCaseLabel(type: EdgeCaseType): string {
  const map: Record<EdgeCaseType, string> = {
    NONE: '',
    EMERGENCY_RETRO: 'Emergency / Retro-Auth',
    NEWBORN_NEW_ENROLLEE: 'Newborn / New Enrollee',
    APPROVED_NOT_COVERED: 'Approved – Not Covered',
    DENIAL_APPEAL: 'Denial Appeal',
    CLINICAL_CHANGE: 'Clinical Change',
    COB: 'COB',
  };
  return map[type] ?? '';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
