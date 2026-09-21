'use client';

import { Search } from 'lucide-react';

export function TableControls({ search, onSearch, searchPlaceholder, filters, sortOrder, onSort, onClear }: { search: string; onSearch: (value: string) => void; searchPlaceholder: string; filters?: { value: string; onChange: (value: string) => void; options: string[]; placeholder: string; ariaLabel: string }[]; sortOrder: 'recent' | 'oldest'; onSort: (value: 'recent' | 'oldest') => void; onClear: () => void }) {
  return <div className="mb-4 flex flex-col gap-3">
    <div className="relative w-full sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={searchPlaceholder} className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1769aa]" /></div>
    <div className="flex flex-wrap gap-3">
      {filters?.map((filter) => <select key={filter.ariaLabel} value={filter.value} onChange={(event) => filter.onChange(event.target.value)} aria-label={filter.ariaLabel} className="max-w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1769aa]"><option value="">{filter.placeholder}</option>{filter.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>)}
      <select value={sortOrder} onChange={(event) => onSort(event.target.value as 'recent' | 'oldest')} aria-label="Sort by date" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1769aa]"><option value="recent">Recent to oldest</option><option value="oldest">Oldest to recent</option></select>
      <button type="button" onClick={onClear} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Clear filters</button>
    </div>
  </div>;
}
