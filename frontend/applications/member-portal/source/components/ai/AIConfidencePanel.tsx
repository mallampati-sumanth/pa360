'use client';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { classNames } from '@/shared/utils';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

interface AIConfidencePanelProps {
  confidenceScore: number | null;
  aiSummary: string;
  missingInformation: string[];
  requiresHumanReview: boolean;
  humanReviewReason?: string;
}

function ConfidenceGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600';
  const ring = pct >= 80 ? 'stroke-green-500' : pct >= 60 ? 'stroke-yellow-500' : 'stroke-red-500';
  const circumference = 2 * Math.PI * 36;
  const dashoffset = circumference - (pct / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="40" cy="40" r="36" fill="none" className={ring} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" />
      </svg>
      <div className="-mt-14 flex flex-col items-center">
        <span className={classNames('text-xl font-bold', color)}>{pct}%</span>
        <span className="text-xs text-gray-500">confidence</span>
      </div>
      <p className="mt-2 text-xs text-gray-600 text-center">AI Confidence Score</p>
    </div>
  );
}

export function AIConfidencePanel({
  confidenceScore,
  aiSummary,
  missingInformation,
  requiresHumanReview,
  humanReviewReason,
}: AIConfidencePanelProps) {
  return (
    <Card>
      <CardHeader title="AI Analysis" subtitle="Automated document understanding and completeness check" />
      <CardBody className="space-y-4">
        {requiresHumanReview && (
          <Alert variant="warning" title="Human Review Required">
            {humanReviewReason || 'This request requires review by an Authorization Specialist before submission.'}
          </Alert>
        )}
        <div className="flex items-start gap-6">
          {confidenceScore !== null && <ConfidenceGauge score={confidenceScore} />}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Clinical Summary</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{aiSummary || 'No summary available.'}</p>
          </div>
        </div>
        {missingInformation.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Missing Information ({missingInformation.length})
            </h4>
            <ul className="space-y-1">
              {missingInformation.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {missingInformation.length === 0 && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            All required information is present
          </div>
        )}
      </CardBody>
    </Card>
  );
}
