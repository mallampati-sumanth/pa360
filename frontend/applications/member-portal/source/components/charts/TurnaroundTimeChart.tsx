'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  week: string;
  avg_days: number;
  target?: number;
}

interface TurnaroundTimeChartProps {
  data: DataPoint[];
}

export function TurnaroundTimeChart({ data }: TurnaroundTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft', offset: 10 }} />
        <Tooltip formatter={(val: number) => [`${val} days`, '']} />
        <Legend />
        <Line type="monotone" dataKey="avg_days" stroke="#1E3A5F" strokeWidth={2} dot={{ r: 4 }} name="Avg Turnaround (days)" />
        <Line type="monotone" dataKey="target" stroke="#E74C3C" strokeDasharray="5 5" strokeWidth={1.5} name="Target" />
      </LineChart>
    </ResponsiveContainer>
  );
}
