'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { classNames } from '@/shared/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />
        <Dialog.Content
          className={classNames(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'bg-white rounded-lg shadow-xl w-full p-6',
            sizeClasses[size]
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>}
              {description && <Dialog.Description className="text-sm text-gray-500 mt-1">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 ml-4">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
