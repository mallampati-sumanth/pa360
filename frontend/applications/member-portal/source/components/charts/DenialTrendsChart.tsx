'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  month: string;
  denied: number;
  appealed?: number;
  appeal_approved?: number;
}

interface DenialTrendsChartProps {
  data: DataPoint[];
}

export function DenialTrendsChart({ data }: DenialTrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="denied" fill="#E74C3C" name="Denied" radius={[3, 3, 0, 0]} />
        <Bar dataKey="appealed" fill="#F39C12" name="Appealed" radius={[3, 3, 0, 0]} />
        <Bar dataKey="appeal_approved" fill="#27AE60" name="Appeal Approved" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
