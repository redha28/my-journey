import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Building2,
  Clock,
  Save,
  FileSpreadsheet,
  Check,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { UserProfile, JourneyItem } from '../../types/journey';
import { vscode } from '../../utils/vscode';

interface ProfileViewProps {
  profile?: UserProfile;
  items: JourneyItem[];
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  items,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    nik: '',
    role: '',
    level: '',
    position: '',
    employeeStatus: '',
    division: '',
    department: '',
    services: '',
    defaultStartTime: '07:45:00',
    defaultEndTime: '17:15:00',
    officeLocation: '-6.1824778, 106.8300436',
    defaultPlace: 'WFH'
  });

  const [isSaved, setIsSaved] = useState(false);

  // Month options generation
  const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Collect all unique months from existing items + current year months
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(currentMonthKey);

    // Add recent 6 months
    const now = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      monthsSet.add(d.toISOString().slice(0, 7));
    }

    // Add months from items
    items.forEach(it => {
      if (it.date && it.date.length >= 7) {
        monthsSet.add(it.date.slice(0, 7));
      }
    });

    return Array.from(monthsSet).sort().reverse();
  }, [items, currentMonthKey]);

  // Tasks in selected month
  const tasksInMonth = useMemo(() => {
    return items.filter(it => it.date && it.date.startsWith(selectedMonth));
  }, [items, selectedMonth]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        nik: profile.nik || '',
        role: profile.role || '',
        level: profile.level || '',
        position: profile.position || '',
        employeeStatus: profile.employeeStatus || '',
        division: profile.division || '',
        department: profile.department || '',
        services: profile.services || '',
        defaultStartTime: profile.defaultStartTime || '07:45:00',
        defaultEndTime: profile.defaultEndTime || '17:15:00',
        officeLocation: profile.officeLocation || '-6.1824778, 106.8300436',
        defaultPlace: profile.defaultPlace || 'WFH'
      });
    }
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportExcel = () => {
    vscode.postMessage({
      command: 'EXPORT_EXCEL',
      payload: {
        items,
        profile: formData,
        selectedMonth
      }
    });
  };

  const formatMonthLabel = (monthKey: string) => {
    const [y, m] = monthKey.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* 1. EXPORT TIMESHEET CARD */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Export Timesheet Google Spreadsheet (.xlsx)</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Exact Template
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Header Biru Google Sheets, Border Hitam Tegas, Background Libur Abu-Abu, dan Multi-line Task
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Export Action */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <label className="text-xs font-semibold text-zinc-300 whitespace-nowrap flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pilih Bulan:</span>
            </label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900/90 text-zinc-100 border border-emerald-500/40 focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer outline-none shadow-sm"
            >
              {availableMonths.map(m => (
                <option key={m} value={m} className="bg-zinc-900 text-zinc-100 py-1">
                  {formatMonthLabel(m)} ({m})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1 bg-zinc-950/60 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span><strong>{tasksInMonth.length}</strong> task di bulan ini</span>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Timesheet (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROFILE SETTINGS FORM */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Data Profil & Informasi Timesheet</h3>
            <p className="text-xs text-zinc-400">
              Isi data di bawah ini untuk mengisi Baris 1 s/d 7 pada template timesheet
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          {/* Section 1: Data Pekerja (Baris 6 & 7) */}
          <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>1. Data Pekerja (Header Baris 6 & 7)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Nama Pekerja (Baris 6 Kolom B)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Redha Definto"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  NIK (Baris 7 Kolom B)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 260114"
                  value={formData.nik}
                  onChange={e => handleChange('nik', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Role (Baris 6 Kolom C)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Dev"
                  value={formData.role}
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Level (Baris 6 Kolom D)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Middle"
                  value={formData.level}
                  onChange={e => handleChange('level', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Position / Jabatan (Baris 6 Kolom E)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer"
                  value={formData.position}
                  onChange={e => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Organisasi & Project (Baris 1 - 4) */}
          <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>2. Informasi Organisasi & Services (Header Baris 1 - 4)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Employee Status (Baris 1)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kontrak, Tetap"
                  value={formData.employeeStatus}
                  onChange={e => handleChange('employeeStatus', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Division (Baris 2)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HR Shared Services Operation"
                  value={formData.division}
                  onChange={e => handleChange('division', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Department (Baris 3)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Recruitment & Training Operation"
                  value={formData.department}
                  onChange={e => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Services / Project (Baris 4)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pengadaan Kebutuhan Talent Subisidi Tepat MyPertamina 2026"
                  value={formData.services}
                  onChange={e => handleChange('services', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Default Jam Kehadiran & Lokasi */}
          <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>3. Default Jam Masuk/Pulang & Lokasi Kerja</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Default Start Time (Jam Masuk)
                </label>
                <input
                  type="text"
                  placeholder="07:45:00"
                  value={formData.defaultStartTime}
                  onChange={e => handleChange('defaultStartTime', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Default End Time (Jam Pulang)
                </label>
                <input
                  type="text"
                  placeholder="17:15:00"
                  value={formData.defaultEndTime}
                  onChange={e => handleChange('defaultEndTime', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Office GPS Coordinate (Lokasi Saat Hari Kerja Office)
                </label>
                <input
                  type="text"
                  placeholder="-6.1824778, 106.8300436"
                  value={formData.officeLocation}
                  onChange={e => handleChange('officeLocation', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  💡 Ketentuan: Hari <strong>Rabu</strong> otomatis <strong>WFH</strong> (tanpa lokasi), hari <strong>Senin, Selasa, Kamis, Jumat</strong> otomatis <strong>OFFICE</strong> dengan koordinat di atas.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800 flex-wrap">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-500" />
              <span>Data profil tersimpan di workspace lokal <code>.myjourney/data.json</code></span>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Profil Tersimpan!' : 'Simpan Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
