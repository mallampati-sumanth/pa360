'use client';
import { classNames } from '@/shared/utils';

interface WorkloadEntry {
  specialist_name: string;
  open_requests: number;
  pending_review: number;
  exceptions: number;
}

interface WorkloadHeatmapProps {
  data: WorkloadEntry[];
}

function intensity(val: number, max: number): string {
  const ratio = max > 0 ? val / max : 0;
  if (ratio === 0) return 'bg-gray-100';
  if (ratio < 0.33) return 'bg-blue-100';
  if (ratio < 0.66) return 'bg-blue-300';
  return 'bg-blue-600 text-white';
}

export function WorkloadHeatmap({ data }: WorkloadHeatmapProps) {
  const maxOpen = Math.max(...data.map(d => d.open_requests), 1);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-600">Specialist</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600">Open</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600">Pending Review</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600">Exceptions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.specialist_name}>
              <td className="py-2 pr-4 font-medium text-gray-900">{row.specialist_name}</td>
              <td className="py-2 px-2 text-center">
                <span className={classNames('inline-block w-12 rounded text-xs font-bold py-1', intensity(row.open_requests, maxOpen))}>
                  {row.open_requests}
                </span>
              </td>
              <td className="py-2 px-2 text-center">
                <span className={classNames('inline-block w-12 rounded text-xs font-bold py-1', intensity(row.pending_review, maxOpen))}>
                  {row.pending_review}
                </span>
              </td>
              <td className="py-2 px-2 text-center">
                <span className={classNames('inline-block w-12 rounded text-xs font-bold py-1', row.exceptions > 0 ? 'bg-red-500 text-white' : 'bg-gray-100')}>
                  {row.exceptions}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
