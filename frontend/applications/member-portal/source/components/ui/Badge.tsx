import { classNames } from '@/shared/utils';
import { AuthorizationStatus, EdgeCaseType, Priority } from '@/shared/types';
import { getStatusColor, getPriorityColor, getEdgeCaseBadgeVariant, getEdgeCaseLabel } from '@/shared/utils';

interface StatusBadgeProps {
  status: AuthorizationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getStatusColor(status),
      className
    )}>
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getPriorityColor(priority),
      className
    )}>
      {priority}
    </span>
  );
}

interface EdgeCaseBadgeProps {
  type: EdgeCaseType;
  className?: string;
}

export function EdgeCaseBadge({ type, className }: EdgeCaseBadgeProps) {
  if (type === 'NONE') return null;
  return (
    <span className={classNames(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide',
      getEdgeCaseBadgeVariant(type),
      className
    )}>
      {getEdgeCaseLabel(type)}
    </span>
  );
}
