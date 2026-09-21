import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { classNames } from '@/shared/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<AlertVariant, { bg: string; border: string; text: string; icon: React.FC<any> }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertTriangle },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
};

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  return (
    <div className={classNames('rounded-md border p-4', config.bg, config.border, className)}>
      <div className="flex">
        <Icon className={classNames('h-5 w-5 flex-shrink-0 mt-0.5', config.text)} />
        <div className="ml-3 flex-1">
          {title && <h3 className={classNames('text-sm font-medium', config.text)}>{title}</h3>}
          <div className={classNames('text-sm', title ? 'mt-1' : '', config.text)}>{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className={classNames('ml-auto flex-shrink-0', config.text)}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
