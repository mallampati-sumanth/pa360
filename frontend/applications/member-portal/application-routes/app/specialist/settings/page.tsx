'use client';
import { useCurrentUser } from '@/features/auth/hooks';

export default function SettingsPage() {
  const user = useCurrentUser();
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Current user';
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
              {fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
              <p className="text-slate-500">{user?.email || 'Email not available'}</p>
            </div>
          </div>
          
          <div className="space-y-6 max-w-md">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Full Name</span>
              <input type="text" defaultValue={fullName} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#1769aa]" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Role</span>
              <input type="text" readOnly defaultValue={user?.role || 'Role not available'} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md outline-none" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Phone Number</span>
              <input type="text" defaultValue={user?.phone_number || ''} placeholder="Phone number" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#1769aa]" />
            </label>
            <button className="bg-[#1356a1] text-white px-5 py-2.5 rounded-md font-semibold text-sm">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}