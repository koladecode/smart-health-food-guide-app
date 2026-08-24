import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Eye,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Mail,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  Download,
  Sparkles,
  Activity,
  MoreVertical,
  X,
  UserPlus
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import Modal from './Modal';
import { Input, Select } from './Input';
import Alert from './Alert';
import EmptyState from './EmptyState';
import { Skeleton } from './Skeleton';

export type UserRole = 'Admin' | 'Clinician' | 'User';
export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
  healthGoal?: string;
  bmi?: number;
  age?: number;
  gender?: string;
}

const STORAGE_KEY = 'smart_health_guide_managed_users';

const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'usr-101',
    fullName: 'Eleanor Vance',
    email: 'eleanor.vance@healthguide.org',
    role: 'Admin',
    status: 'Active',
    createdAt: '2025-11-10',
    lastLogin: '2026-07-26 10:14',
    healthGoal: 'Maintain Wellness',
    bmi: 22.4,
    age: 34,
    gender: 'Female'
  },
  {
    id: 'usr-102',
    fullName: 'Dr. Marcus Vance',
    email: 'm.vance@clinic.org',
    role: 'Clinician',
    status: 'Active',
    createdAt: '2025-12-01',
    lastLogin: '2026-07-25 18:30',
    healthGoal: 'Heart Health',
    bmi: 24.1,
    age: 42,
    gender: 'Male'
  },
  {
    id: 'usr-103',
    fullName: 'Akanji Cornelius',
    email: 'akanjicornelius@gmail.com',
    role: 'User',
    status: 'Active',
    createdAt: '2026-01-15',
    lastLogin: '2026-07-26 12:05',
    healthGoal: 'Improve Overall Health',
    bmi: 23.8,
    age: 29,
    gender: 'Male'
  },
  {
    id: 'usr-104',
    fullName: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    role: 'User',
    status: 'Active',
    createdAt: '2026-02-04',
    lastLogin: '2026-07-24 09:12',
    healthGoal: 'Weight Loss',
    bmi: 27.2,
    age: 31,
    gender: 'Female'
  },
  {
    id: 'usr-105',
    fullName: 'David K. Chen',
    email: 'david.chen@biomail.com',
    role: 'Clinician',
    status: 'Active',
    createdAt: '2026-02-18',
    lastLogin: '2026-07-20 14:45',
    healthGoal: 'Blood Sugar Control',
    bmi: 25.0,
    age: 48,
    gender: 'Male'
  },
  {
    id: 'usr-106',
    fullName: 'Amara Okafor',
    email: 'amara.okafor@wellness.co',
    role: 'User',
    status: 'Pending',
    createdAt: '2026-03-02',
    lastLogin: 'Never',
    healthGoal: 'Muscle Gain',
    bmi: 21.6,
    age: 26,
    gender: 'Female'
  },
  {
    id: 'usr-107',
    fullName: 'Robert Sterling',
    email: 'rsterling@shadowdomain.net',
    role: 'User',
    status: 'Suspended',
    createdAt: '2026-03-20',
    lastLogin: '2026-06-11 08:22',
    healthGoal: 'Improve Overall Health',
    bmi: 29.5,
    age: 51,
    gender: 'Male'
  },
  {
    id: 'usr-108',
    fullName: 'Elena Rostova',
    email: 'elena.r@diagnostics.eu',
    role: 'Clinician',
    status: 'Active',
    createdAt: '2026-04-12',
    lastLogin: '2026-07-23 11:50',
    healthGoal: 'Heart Health',
    bmi: 22.9,
    age: 38,
    gender: 'Female'
  },
  {
    id: 'usr-109',
    fullName: 'Liam Hemsworth',
    email: 'liam.h@healthtest.com',
    role: 'User',
    status: 'Active',
    createdAt: '2026-05-01',
    lastLogin: '2026-07-21 16:10',
    healthGoal: 'Muscle Gain',
    bmi: 24.8,
    age: 30,
    gender: 'Male'
  },
  {
    id: 'usr-110',
    fullName: 'Kendra Wright',
    email: 'kendra.w@medcenter.org',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-05-19',
    lastLogin: '2026-07-26 08:00',
    healthGoal: 'Maintain Wellness',
    bmi: 23.1,
    age: 39,
    gender: 'Female'
  }
];

export default function AdminUsersManagement() {
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved admin users:', e);
    }
    return INITIAL_USERS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'role'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'User' as UserRole,
    status: 'Active' as UserStatus,
    healthGoal: 'Improve Overall Health',
    age: '30',
    gender: 'Male'
  });

  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever users change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save admin users:', e);
    }
  }, [users]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Filtered and Sorted users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.healthGoal && user.healthGoal.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'role') return a.role.localeCompare(b.role);
      return 0;
    });
  }, [users, searchQuery, roleFilter, statusFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, itemsPerPage]);

  // Paginated data
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Key Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'Active').length;
    const suspended = users.filter((u) => u.status === 'Suspended').length;
    const staff = users.filter((u) => u.role === 'Admin' || u.role === 'Clinician').length;
    return { total, active, suspended, staff };
  }, [users]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Open View Modal
  const handleOpenView = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: ManagedUser) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      healthGoal: user.healthGoal || 'Improve Overall Health',
      age: user.age ? String(user.age) : '30',
      gender: user.gender || 'Male'
    });
    setIsEditModalOpen(true);
  };

  // Save Edit User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              fullName: formData.fullName.trim() || u.fullName,
              email: formData.email.trim() || u.email,
              role: formData.role,
              status: formData.status,
              healthGoal: formData.healthGoal,
              age: parseInt(formData.age, 10) || u.age,
              gender: formData.gender
            }
          : u
      )
    );

    setIsEditModalOpen(false);
    showToast(`User account "${formData.fullName}" updated successfully.`);
  };

  // Open Delete Modal
  const handleOpenDelete = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    showToast(`User account "${selectedUser.fullName}" has been removed from system records.`, 'info');
  };

  // Open Suspend/Reactivate Modal
  const handleOpenSuspend = (user: ManagedUser) => {
    setSelectedUser(user);
    setIsSuspendModalOpen(true);
  };

  // Confirm Suspend Toggle
  const handleConfirmSuspend = () => {
    if (!selectedUser) return;
    const newStatus: UserStatus = selectedUser.status === 'Suspended' ? 'Active' : 'Suspended';
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
    );
    setIsSuspendModalOpen(false);
    showToast(
      `User "${selectedUser.fullName}" is now ${newStatus.toLowerCase()}.`,
      newStatus === 'Suspended' ? 'error' : 'success'
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'User',
      status: 'Active',
      healthGoal: 'Improve Overall Health',
      age: '28',
      gender: 'Female'
    });
    setIsAddModalOpen(true);
  };

  // Confirm Add
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    const newId = `usr-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newUser: ManagedUser = {
      id: newId,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
      createdAt: today,
      lastLogin: 'Never',
      healthGoal: formData.healthGoal,
      bmi: 23.5,
      age: parseInt(formData.age, 10) || 28,
      gender: formData.gender
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsAddModalOpen(false);
    showToast(`New ${formData.role.toLowerCase()} account created for ${formData.fullName}.`);
  };

  // Export Users CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Status', 'Health Goal', 'Created Date', 'Last Login'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      u.email,
      u.role,
      u.status,
      `"${(u.healthGoal || '').replace(/"/g, '""')}"`,
      u.createdAt,
      u.lastLogin
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `admin_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('User directory exported successfully as CSV.', 'info');
  };

  // Helper Badge Renderers
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Admin
          </span>
        );
      case 'Clinician':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
            <Activity className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            Clinician
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <UserIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            User
          </span>
        );
    }
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Suspended
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto text-left" id="admin-users-management-root">
      
      {/* Toast Alert floating notice */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <Alert
            variant={toastNotification.type === 'error' ? 'error' : toastNotification.type === 'info' ? 'info' : 'success'}
            title={toastNotification.type === 'error' ? 'Security Action' : toastNotification.type === 'info' ? 'System Notice' : 'Success'}
            className="shadow-xl rounded-2xl border backdrop-blur-md"
          >
            {toastNotification.message}
          </Alert>
        </div>
      )}

      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/80 dark:border-slate-800/80 pb-6" id="admin-header-hierarchy">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-emerald-500/15 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-3xs font-extrabold uppercase tracking-wider border border-purple-500/20">
                System Administration
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Access Control</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Admin Users Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Directory of registered patient accounts, clinical staff practitioners, and system administration privileges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap self-start md:self-auto">
          <Button
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            className="h-11 px-4 font-extrabold rounded-xl"
            id="admin-export-csv-btn"
          >
            Export Directory
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="h-11 px-4 font-extrabold rounded-xl shadow-2xs"
            id="admin-add-user-btn"
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Quick KPI Metrics Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-summary-cards">
        
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Total Users</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</span>
              <span className="text-3xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Fully Synchronized
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Active Status</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</span>
              <span className="text-3xs text-slate-400 font-medium mt-1.5">
                {Math.round((stats.active / (stats.total || 1)) * 100)}% active accounts
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Clinical & Admin</span>
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.staff}</span>
              <span className="text-3xs text-purple-600/80 dark:text-purple-400/80 font-medium mt-1.5">Elevated permissions</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Suspended</span>
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{stats.suspended}</span>
              <span className="text-3xs text-rose-500 font-medium mt-1.5">Restricted access</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 shrink-0">
              <UserX className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Controls Bar: Search, Filters, Sorting */}
      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden" id="admin-user-filters-bar">
        <CardContent className="p-4 md:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, user ID, or health goal..."
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="h-11 text-xs sm:text-sm rounded-xl"
                maxLength={250}
                id="admin-search-users-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter by Role (2 cols) */}
            <div className="md:col-span-2">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-role-filter-select"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Clinician">Clinician</option>
                <option value="User">User</option>
              </Select>
            </div>

            {/* Filter by Status (2 cols) */}
            <div className="md:col-span-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-status-filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </Select>
            </div>

            {/* Sort Dropdown (3 cols) */}
            <div className="md:col-span-3 flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-sort-by-select"
              >
                <option value="newest">Sort: Newest Joined</option>
                <option value="oldest">Sort: Oldest Joined</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="role">Sort: By Role</option>
              </Select>

              {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  title="Reset Search Filters"
                  className="h-11 w-11 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 rounded-xl transition-all"
                  id="admin-reset-filters-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>

          </div>

          {/* Active Filter Badges Summary */}
          {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800/80 text-2xs" id="active-filters-pills">
              <span className="font-extrabold uppercase text-slate-400 tracking-wider text-3xs">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700/60">
                  Query: "{searchQuery}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {roleFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/50">
                  Role: {roleFilter}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setRoleFilter('All')} />
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50">
                  Status: {statusFilter}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setStatusFilter('All')} />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Area: Users Table or Cards */}
      {isLoading ? (
        <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <Skeleton variant="rect" className="w-full h-12" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
        </div>
      ) : paginatedUsers.length === 0 ? (
        <EmptyState
          title="No Users Match Your Search Criteria"
          description={
            searchQuery || roleFilter !== 'All' || statusFilter !== 'All'
              ? 'Try refining your search terms, clearing active role/status filters, or resetting parameters.'
              : 'There are currently no registered users in the database directory.'
          }
          icon={<UserIcon className="w-10 h-10 text-slate-400" />}
          actionLabel={searchQuery || roleFilter !== 'All' || statusFilter !== 'All' ? 'Reset All Filters' : 'Add First User'}
          onAction={searchQuery || roleFilter !== 'All' || statusFilter !== 'All' ? handleResetFilters : handleOpenAdd}
          id="admin-empty-users-state"
        />
      ) : (
        <div className="flex flex-col gap-4" id="admin-users-table-container">
          
          {/* DESKTOP TABLE VIEW (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 text-3xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Health Focus</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
                    id={`user-row-${user.id}`}
                  >
                    {/* User Info Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {user.fullName}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {renderRoleBadge(user.role)}
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {renderStatusBadge(user.status)}
                    </td>

                    {/* Health Focus Column */}
                    <td className="py-4 px-4 min-w-[150px]">
                      {user.healthGoal ? (
                        <span className="text-2xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 truncate inline-block max-w-[180px]">
                          {user.healthGoal}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Unspecified</span>
                      )}
                    </td>

                    {/* Joined Date Column */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {user.createdAt}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(user)}
                          className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                          title="View User Details"
                          aria-label={`View ${user.fullName}`}
                          id={`btn-view-${user.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
                          title="Edit User Account"
                          aria-label={`Edit ${user.fullName}`}
                          id={`btn-edit-${user.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenSuspend(user)}
                          className={`p-2 rounded-xl transition-all ${
                            user.status === 'Suspended'
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                          title={user.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                          aria-label={`${user.status === 'Suspended' ? 'Reactivate' : 'Suspend'} ${user.fullName}`}
                          id={`btn-suspend-${user.id}`}
                        >
                          {user.status === 'Suspended' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenDelete(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                          title="Delete User"
                          aria-label={`Delete ${user.fullName}`}
                          id={`btn-delete-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE / TABLET CARDS VIEW (visible on small screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden" id="admin-users-mobile-cards">
            {paginatedUsers.map((user) => (
              <Card
                key={user.id}
                className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs rounded-2xl flex flex-col justify-between"
                id={`user-card-${user.id}`}
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold text-xs shrink-0">
                        {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">
                          {user.fullName}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {renderRoleBadge(user.role)}
                    {renderStatusBadge(user.status)}
                  </div>

                  <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-2xs">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span className="font-bold">Health Goal:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-200">{user.healthGoal || 'Unspecified'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span className="font-bold">Joined:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{user.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenView(user)} icon={<Eye className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(user)} icon={<Edit3 className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                    <Button
                      variant={user.status === 'Suspended' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleOpenSuspend(user)}
                      className={user.status === 'Suspended' ? 'text-emerald-600' : 'text-amber-600'}
                    >
                      {user.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(user)} className="text-rose-600 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls Footer */}
          {totalPages <= 1 ? (
            <div className="flex items-center justify-between gap-4 p-4 md:px-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400" id="admin-pagination-footer-single">
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> user{filteredUsers.length === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-2xs uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                All items are displayed.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:px-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs" id="admin-pagination-footer">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                  <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> users
                </span>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-2xs uppercase tracking-wider font-extrabold text-slate-400">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    id="admin-page-size-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5" id="admin-pagination-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                  id="pagination-prev-btn"
                >
                  Prev
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all ${
                        currentPage === p
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                  id="pagination-next-btn"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW USER DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Account Details"
        size="lg"
        id="modal-view-user"
      >
        {selectedUser && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl shrink-0 shadow-2xs">
                {selectedUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{selectedUser.fullName}</h3>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedUser.email}
                </span>
                <div className="flex items-center gap-2 mt-2.5">
                  {renderRoleBadge(selectedUser.role)}
                  {renderStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> User Account ID
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800 self-start">
                  {selectedUser.id}
                </span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registered Date
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{selectedUser.createdAt}</span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" /> Primary Health Goal
                </span>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{selectedUser.healthGoal || 'Unspecified'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Active Session
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{selectedUser.lastLogin}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="h-11 px-5 rounded-xl font-extrabold"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => { setIsViewModalOpen(false); handleOpenEdit(selectedUser); }}
                icon={<Edit3 className="w-4 h-4" />}
                className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
              >
                Edit Account
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Configuration"
        size="md"
        id="modal-edit-user"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              maxLength={254}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Role Permission
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="User">User</option>
                <option value="Clinician">Clinician</option>
                <option value="Admin">Admin</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Health Profile Goal Focus
            </label>
            <Select
              value={formData.healthGoal}
              onChange={(e) => setFormData({ ...formData, healthGoal: e.target.value })}
              className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <option value="Improve Overall Health">Improve Overall Health</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Weight Gain">Weight Gain</option>
              <option value="Heart Health">Heart Health</option>
              <option value="Blood Sugar Control">Blood Sugar Control</option>
              <option value="Muscle Gain">Muscle Gain</option>
            </Select>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-1 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="h-11 px-5 rounded-xl font-extrabold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Account to Directory"
        size="md"
        id="modal-add-user"
      >
        <form onSubmit={handleSaveAdd} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Sarah Connor"
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. sarah@example.com"
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              maxLength={254}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Assign Role
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="User">User</option>
                <option value="Clinician">Clinician</option>
                <option value="Admin">Admin</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </Select>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-1 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="h-11 px-5 rounded-xl font-extrabold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Plus className="w-4 h-4" />}
              className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
            >
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* SUSPEND CONFIRMATION MODAL */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={selectedUser?.status === 'Suspended' ? 'Reactivate User Account' : 'Suspend User Account'}
        size="sm"
        id="modal-suspend-user"
      >
        {selectedUser && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {selectedUser.status === 'Suspended' ? 'Confirm Reactivation' : 'Confirm Access Suspension'}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Are you sure you want to {selectedUser.status === 'Suspended' ? 'reactivate' : 'suspend'} access for{' '}
                  <strong className="text-slate-900 dark:text-white font-extrabold">{selectedUser.fullName}</strong> ({selectedUser.email})?
                </p>
              </div>
            </div>

            {selectedUser.status !== 'Suspended' && (
              <Alert variant="warning" title="Security Warning">
                Suspended users will immediately lose sign-in privileges and API access until reactivated by an admin.
              </Alert>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsSuspendModalOpen(false)}
                className="h-11 px-5 rounded-xl font-extrabold"
              >
                Cancel
              </Button>
              <Button
                variant={selectedUser.status === 'Suspended' ? 'primary' : 'danger'}
                onClick={handleConfirmSuspend}
                className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
              >
                {selectedUser.status === 'Suspended' ? 'Confirm Reactivation' : 'Confirm Suspension'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User Record"
        size="sm"
        id="modal-delete-user"
      >
        {selectedUser && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                  Confirm Permanent Deletion
                </span>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  You are about to permanently delete <strong className="font-extrabold text-rose-950 dark:text-rose-100">{selectedUser.fullName}</strong> ({selectedUser.email}).
                </p>
              </div>
            </div>

            <Alert variant="error" title="Irreversible Action">
              This operation cannot be undone and will purge all associated user history.
            </Alert>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="h-11 px-5 rounded-xl font-extrabold"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                icon={<Trash2 className="w-4 h-4" />}
                className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
