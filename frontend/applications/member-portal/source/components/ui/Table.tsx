'use client';
import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { classNames } from '@/shared/utils';
import { Spinner } from './Spinner';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
  className?: string;
}

export function Table<T>({ columns, data, loading, emptyMessage = 'No records found.', keyExtractor, className }: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <div className={classNames('overflow-x-auto rounded-md border border-gray-200', className)}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={classNames('px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-gray-400">{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => {
                  const value = (row as any)[col.key];
                  return (
                    <td key={col.key} className={classNames('px-4 py-3 text-gray-700', col.className)}>
                      {col.render ? col.render(value, row) : value ?? '—'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
