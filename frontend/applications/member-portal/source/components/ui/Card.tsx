import { classNames } from '@/shared/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={classNames('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={classNames('flex items-center justify-between px-6 py-4 border-b border-gray-200', className)}>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: CardProps) {
  return <div className={classNames('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps) {
  return <div className={classNames('px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg', className)}>{children}</div>;
}

// KPI card for dashboards
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; direction: 'up' | 'down'; good: 'up' | 'down' };
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, subtitle, trend, icon, className }: KPICardProps) {
  const trendGood = trend && trend.direction === trend.good;
  return (
    <div className={classNames('bg-white rounded-lg border border-gray-200 shadow-sm p-6', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      {trend && (
        <p className={classNames('mt-2 text-sm font-medium', trendGood ? 'text-green-600' : 'text-red-600')}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% vs last month
        </p>
      )}
    </div>
  );
}
