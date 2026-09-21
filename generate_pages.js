const fs = require('fs');
const path = require('path');

const base = 'd:/projects/PA360-PRIORAUTH-NOVA-dev/frontend/applications/member-portal/application-routes/app';

const pages = [
  {
    path: 'specialist/patients/page.tsx',
    content: `'use client';
import { usePatients } from '@/features/authorization-workspace/hooks';
import { Table } from '@/components/ui';
import { Search, UserPlus } from 'lucide-react';

export default function PatientsPage() {
  const { data, isLoading } = usePatients();
  const columns = [
    { key: 'patient_id', header: 'ID', render: (val) => <span className="text-slate-500 font-mono text-sm">{val.slice(0, 8)}</span> },
    { key: 'name', header: 'Name', render: (val) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: 'dob', header: 'DOB' },
    { key: 'plan_id', header: 'Plan ID' },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">Manage patient records and insurance details.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add Patient
        </button>
      </div>
      <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
        <div className="mb-4 flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 w-72">
          <Search className="h-4 w-4 text-slate-400" />
          <input placeholder="Search patients..." className="outline-none text-sm w-full" />
        </div>
        <Table columns={columns} data={data?.results ?? data ?? []} loading={isLoading} keyExtractor={(r) => r.patient_id} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'specialist/providers/page.tsx',
    content: `'use client';
import { useProviders } from '@/features/authorization-workspace/hooks';
import { Table } from '@/components/ui';
import { Search, Stethoscope } from 'lucide-react';

export default function ProvidersPage() {
  const { data, isLoading } = useProviders();
  const columns = [
    { key: 'provider_id', header: 'NPI', render: (val) => <span className="text-slate-500 font-mono text-sm">{val.slice(0, 10)}</span> },
    { key: 'provider_name', header: 'Provider Name', render: (val) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: 'specialty', header: 'Specialty', render: (val) => <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">{val || 'General'}</span> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Providers</h1>
          <p className="text-sm text-slate-500 mt-1">Directory of ordering providers and specialists.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
          <Stethoscope className="h-4 w-4" /> New Provider
        </button>
      </div>
      <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
        <div className="mb-4 flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 w-72">
          <Search className="h-4 w-4 text-slate-400" />
          <input placeholder="Search providers..." className="outline-none text-sm w-full" />
        </div>
        <Table columns={columns} data={data?.results ?? data ?? []} loading={isLoading} keyExtractor={(r) => r.provider_id} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'specialist/payers/page.tsx',
    content: `'use client';
import { usePayers } from '@/features/authorization-workspace/hooks';
import { Table } from '@/components/ui';
import { Building, Search } from 'lucide-react';

export default function PayersPage() {
  const { data, isLoading } = usePayers();
  const columns = [
    { key: 'payer_id', header: 'Payer ID', render: (val) => <span className="text-slate-500 font-mono text-sm">{val.slice(0, 8)}</span> },
    { key: 'payer_name', header: 'Payer Name', render: (val) => <span className="font-semibold text-slate-800">{val}</span> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Payers</h1>
          <p className="text-sm text-slate-500 mt-1">Connected insurance payers and plans.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2">
          <Building className="h-4 w-4" /> Add Payer
        </button>
      </div>
      <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
        <div className="mb-4 flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 w-72">
          <Search className="h-4 w-4 text-slate-400" />
          <input placeholder="Search payers..." className="outline-none text-sm w-full" />
        </div>
        <Table columns={columns} data={data?.results ?? data ?? []} loading={isLoading} keyExtractor={(r) => r.payer_id} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'specialist/settings/page.tsx',
    content: `'use client';
import { useCurrentUser } from '@/features/auth/hooks';

export default function SettingsPage() {
  const user = useCurrentUser();
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and settings.</p>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button className="px-6 py-3 text-sm font-semibold text-[#1769aa] border-b-2 border-[#1769aa]">Profile</button>
          <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">Notifications</button>
          <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">Preferences</button>
          <button className="px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">Security</button>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-20 w-20 rounded-full bg-[#e6f6fb] text-[#0b5575] flex items-center justify-center text-2xl font-bold">
              {user?.username?.substring(0,2).toUpperCase() || 'JS'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Jessica Smith</h2>
              <p className="text-slate-500">jessica.smith@healthcare.com</p>
            </div>
          </div>
          
          <div className="space-y-6 max-w-md">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Full Name</span>
              <input type="text" defaultValue="Jessica Smith" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#1769aa]" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Role</span>
              <input type="text" readOnly defaultValue="Authorization Specialist" className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md outline-none" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Phone Number</span>
              <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#1769aa]" />
            </label>
            <button className="bg-[#1356a1] text-white px-5 py-2.5 rounded-md font-semibold text-sm">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'specialist/reports/page.tsx',
    content: `'use client';
import { BarChart2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Exportable operational reports and performance metrics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Approval Rate', val: '84%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Avg Turnaround', val: '18 min', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Denial Rate', val: '12%', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
          { label: 'Total Volume', val: '1,245', icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((s,i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={\`h-12 w-12 rounded-full flex items-center justify-center \${s.bg} \${s.color}\`}><s.icon className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-slate-500">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.val}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <div className="mx-auto w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4">
          <BarChart2 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Advanced Reporting Module</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2">Connect to your BI tools or export raw JSON extracts. Available in production deployment.</p>
      </div>
    </div>
  );
}`
  },
  {
    path: 'provider/status/page.tsx',
    content: `'use client';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
import { Table, StatusBadge } from '@/components/ui';
import Link from 'next/link';
import { formatDate } from '@/shared/utils';

export default function ProviderStatus() {
  const { data, isLoading } = useAuthorizationRequests();
  const columns = [
    { key: 'authorization_id', header: 'ID', render: (val) => <span className="text-[#1769aa] font-medium">{val.slice(0, 8)}...</span> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'service_name', header: 'Service' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'request_date', header: 'Submitted', render: (val) => formatDate(val) },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cases</h1>
          <p className="text-sm text-slate-500 mt-1">Track the status of your submitted prior authorizations.</p>
        </div>
        <button className="bg-[#1356a1] text-white px-4 py-2 rounded-md font-semibold text-sm">Submit New</button>
      </div>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <Table columns={columns} data={data?.results ?? data ?? []} loading={isLoading} keyExtractor={(r) => r.authorization_id} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'billing/risk-flags/page.tsx',
    content: `'use client';
import { ShieldAlert } from 'lucide-react';
export default function RiskFlagsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk Flags</h1>
        <p className="text-sm text-slate-500 mt-1">Identify potential denials and revenue leakage.</p>
      </div>
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
        <ShieldAlert className="h-16 w-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">No active risk flags</h2>
        <p className="text-slate-500 max-w-md mx-auto mt-2">All current cases are proceeding normally without billing anomalies.</p>
      </div>
    </div>
  );
}`
  },
  {
    path: 'billing/authorizations/page.tsx',
    content: `'use client';
import { useAuthorizationRequests } from '@/features/authorization-workspace/hooks';
import { Table, StatusBadge } from '@/components/ui';
import { formatDate } from '@/shared/utils';

export default function BillingAuthsPage() {
  const { data, isLoading } = useAuthorizationRequests();
  const columns = [
    { key: 'authorization_id', header: 'ID', render: (val) => <span className="text-[#1769aa] font-medium">{val.slice(0, 8)}...</span> },
    { key: 'patient_name', header: 'Patient' },
    { key: 'payer_name', header: 'Payer' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'request_date', header: 'Auth Date', render: (val) => formatDate(val) },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing Authorizations</h1>
        <p className="text-sm text-slate-500 mt-1">Approved authorizations ready for claims processing.</p>
      </div>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <Table columns={columns} data={(data?.results ?? data ?? []).filter(r=>r.status==='Approved' || r.status==='Completed')} loading={isLoading} keyExtractor={(r) => r.authorization_id} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'manager/trends/page.tsx',
    content: `'use client';
import { TrendingDown, TrendingUp } from 'lucide-react';
export default function TrendsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Denial & Approval Trends</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <h2 className="font-semibold text-slate-800">Approvals (Last 30 Days)</h2>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[40, 55, 45, 70, 65, 80, 90].map((h, i) => <div key={i} className="flex-1 bg-emerald-400 rounded-t-md" style={{height: h + '%'}}></div>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><TrendingDown className="h-5 w-5" /></div>
            <h2 className="font-semibold text-slate-800">Denials (Last 30 Days)</h2>
          </div>
          <div className="h-48 flex items-end gap-2">
            {[20, 15, 25, 10, 12, 8, 5].map((h, i) => <div key={i} className="flex-1 bg-rose-400 rounded-t-md" style={{height: h + '%'}}></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'manager/workload/page.tsx',
    content: `'use client';
import { Table } from '@/components/ui';
export default function WorkloadPage() {
  const data = [
    { staff: 'Jessica Smith', queue: 12, completed: 45, avg_time: '14m' },
    { staff: 'Marcus Johnson', queue: 8, completed: 52, avg_time: '12m' },
    { staff: 'Sarah Davis', queue: 15, completed: 38, avg_time: '18m' },
  ];
  const columns = [
    { key: 'staff', header: 'Specialist' },
    { key: 'queue', header: 'Active Queue', render: (v) => <span className="font-bold text-slate-800">{v}</span> },
    { key: 'completed', header: 'Completed Today' },
    { key: 'avg_time', header: 'Avg Processing Time' },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Staff Workload</h1>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <Table columns={columns} data={data} keyExtractor={(r) => r.staff} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'manager/sla/page.tsx',
    content: `'use client';
import { Table, PriorityBadge } from '@/components/ui';
export default function SLAPage() {
  const data = [
    { id: 'PA-100345', time_elapsed: '46h', threshold: '48h', status: 'At Risk', priority: 'High' },
    { id: 'PA-100290', time_elapsed: '22h', threshold: '24h', status: 'At Risk', priority: 'Urgent' },
  ];
  const columns = [
    { key: 'id', header: 'Auth ID', render: (v) => <span className="text-[#1769aa] font-medium">{v}</span> },
    { key: 'priority', header: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
    { key: 'time_elapsed', header: 'Time Elapsed' },
    { key: 'status', header: 'Status', render: (v) => <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded">{v}</span> },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">SLA Management</h1>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <Table columns={columns} data={data} keyExtractor={(r) => r.id} />
      </div>
    </div>
  );
}`
  },
  {
    path: 'manager/audit/page.tsx',
    content: `'use client';
import { Table } from '@/components/ui';
export default function AuditPage() {
  const data = [
    { date: '2023-10-25 14:30', user: 'Jessica Smith', action: 'Approved PA-100244' },
    { date: '2023-10-25 14:15', user: 'System AI', action: 'Flagged missing clinical notes PA-100245' },
    { date: '2023-10-25 13:50', user: 'Dr. Anderson', action: 'Submitted PA-100246' },
  ];
  const columns = [
    { key: 'date', header: 'Timestamp' },
    { key: 'user', header: 'Actor' },
    { key: 'action', header: 'Action Event' },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
      <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
        <Table columns={columns} data={data} keyExtractor={(r) => r.date} />
      </div>
    </div>
  );
}`
  }
];

pages.forEach(p => {
  const fullPath = path.join(base, p.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, p.content);
  console.log('Created ' + p.path);
});
