'use client';
import { Check, Clock, AlertCircle, Circle } from 'lucide-react';
import { classNames } from '@/shared/utils';

const WORKFLOW_STEPS = [
  { key: 'collect_info', label: 'Collect Patient Info', step: 1 },
  { key: 'pa_determination', label: 'PA Determination', step: 2 },
  { key: 'existing_auth_check', label: 'Existing Auth Check', step: 3 },
  { key: 'gather_documentation', label: 'Gather Documentation', step: 4 },
  { key: 'prepare_request', label: 'Prepare Request', step: 5 },
  { key: 'human_review', label: 'Human Review', step: 6 },
  { key: 'submit_to_payer', label: 'Submit to Payer', step: 7 },
  { key: 'payer_response', label: 'Payer Response', step: 8 },
  { key: 'coverage_validation', label: 'Coverage Validation', step: 9 },
  { key: 'decision', label: 'Decision', step: 10 },
  { key: 'service_delivery', label: 'Service Delivery', step: 11 },
  { key: 'billing', label: 'Billing / RCM', step: 12 },
];

const STATUS_TO_STEP: Record<string, number> = {
  'Draft': 1,
  'Ready for Submission': 5,
  'Submitted': 7,
  'Pending': 8,
  'Additional Info Requested': 8,
  'Coverage Validation': 9,
  'Approved': 10,
  'Service Delivery': 11,
  'Billing / RCM': 12,
  'Denied': 10,
  'Expired': 10,
  'Existing (Reused)': 3,
  'Exception – Review Required': 6,
};

interface StatusTimelineProps {
  currentStatus: string;
  completedDate?: string;
}

export function StatusTimeline({ currentStatus, completedDate }: StatusTimelineProps) {
  const currentStep = STATUS_TO_STEP[currentStatus] ?? 1;

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-0 min-w-max py-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const completed = step.step < currentStep;
          const current = step.step === currentStep;
          const upcoming = step.step > currentStep;
          return (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className={classNames(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                  completed ? 'bg-green-500 border-green-500 text-white' :
                  current ? 'bg-primary border-primary text-white' :
                  'bg-white border-gray-300 text-gray-400'
                )}>
                  {completed ? <Check className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : step.step}
                </div>
                <p className={classNames(
                  'mt-2 text-xs text-center max-w-[80px] leading-tight',
                  completed ? 'text-green-600 font-medium' :
                  current ? 'text-primary font-semibold' :
                  'text-gray-400'
                )}>
                  {step.label}
                </p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={classNames(
                  'h-0.5 w-8 mt-4 flex-shrink-0',
                  completed ? 'bg-green-400' : 'bg-gray-200'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
