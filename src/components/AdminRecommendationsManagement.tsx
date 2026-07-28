import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  Sparkles,
  Lightbulb,
  Activity,
  HeartPulse,
  Clock,
  Layers,
  ShieldCheck,
  Award,
  Target,
  AlertTriangle,
  Zap,
  Tag,
  Sliders,
  Compass,
  Utensils,
  Dumbbell,
  Droplets,
  Users,
  X,
  FileText
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent } from './Card';
import Modal from './Modal';
import { Input, Select, Textarea } from './Input';
import Alert from './Alert';
import EmptyState from './EmptyState';
import { Skeleton } from './Skeleton';

export type RecommendationType = 'Food' | 'Exercise' | 'Hydration' | 'Lifestyle';
export type TargetUserGroup = 'Adults' | 'Children' | 'Elderly' | 'Athletes' | 'Everyone';
export type RecommendationStatus = 'Active' | 'Inactive';
export type RecommendationPriority = 'High' | 'Medium' | 'Low';

export interface ManagedRecommendation {
  id: string;
  title: string;
  type: RecommendationType;
  targetUsers: TargetUserGroup[];
  healthCondition: string;
  healthGoal: string;
  dietType: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  summary: string;
  clinicalRationale?: string;
  actionableSteps?: string[];
  updatedAt: string;
}

const STORAGE_KEY = 'smart_health_guide_managed_recommendations';

const INITIAL_RECOMMENDATIONS: ManagedRecommendation[] = [
  {
    id: 'rec-201',
    title: 'DASH Sodium Protocol',
    type: 'Food',
    targetUsers: ['Adults', 'Elderly'],
    healthCondition: 'Hypertension',
    healthGoal: 'Heart Health',
    dietType: 'DASH Diet',
    priority: 'High',
    status: 'Active',
    summary: 'Emphasize potassium-rich whole foods, leafy greens, legumes, and unrefined grains while capping daily sodium intake under 1,500mg.',
    clinicalRationale: 'DASH dietary patterns have been clinically demonstrated to lower systolic blood pressure by 8–14 mmHg in patients with stage 1 hypertension.',
    actionableSteps: [
      'Replace processed salt seasonings with citrus, garlic, and fresh herbs.',
      'Incorporate 3 servings of potassium-dense leafy greens daily.',
      'Monitor resting blood pressure twice weekly in the morning.'
    ],
    updatedAt: '2026-03-01'
  },
  {
    id: 'rec-202',
    title: 'Low-GI Carb Pairing',
    type: 'Food',
    targetUsers: ['Adults', 'Elderly'],
    healthCondition: 'Type 2 Diabetes',
    healthGoal: 'Weight Loss',
    dietType: 'Low GI / Diabetic Friendly',
    priority: 'High',
    status: 'Active',
    summary: 'Pair all complex carbohydrates with lean protein and soluble fibers to blunt postprandial glucose spikes.',
    clinicalRationale: 'Co-ingesting protein and dietary fiber slows gastric emptying and improves insulin responsiveness.',
    actionableSteps: [
      'Always add lean poultry, tofu, or legumes whenever consuming grain carbs.',
      'Choose whole grain fonio, quinoa, or steel-cut oats over refined flours.',
      'Log 2-hour post-meal capillary glucose readings.'
    ],
    updatedAt: '2026-03-10'
  },
  {
    id: 'rec-203',
    title: 'Mediterranean Omega-3 Protocol',
    type: 'Food',
    targetUsers: ['Adults', 'Athletes', 'Elderly'],
    healthCondition: 'Rheumatoid Arthritis',
    healthGoal: 'Mobility & Joint Health',
    dietType: 'Mediterranean',
    priority: 'Medium',
    status: 'Active',
    summary: 'Increase intake of cold-water oily fish, extra virgin olive oil, and antioxidant berries to decrease systemic inflammatory markers.',
    clinicalRationale: 'EPA and DHA omega-3 fatty acids inhibit pro-inflammatory eicosanoids and reduce joint morning stiffness.',
    actionableSteps: [
      'Consume wild salmon, sardines, or mackerel 3 times per week.',
      'Use cold-pressed extra virgin olive oil as primary cooking fat.',
      'Perform 15 minutes of low-impact morning range-of-motion mobility.'
    ],
    updatedAt: '2026-03-15'
  },
  {
    id: 'rec-204',
    title: 'Lumbar Decompression Routine',
    type: 'Exercise',
    targetUsers: ['Adults', 'Athletes'],
    healthCondition: 'Low Back Pain',
    healthGoal: 'Mobility & Joint Health',
    dietType: 'Balanced Whole Food',
    priority: 'Medium',
    status: 'Active',
    summary: 'Combine daily cat-cow decompression stretches with hydration and anti-inflammatory whole foods to support intervertebral disc hydration.',
    clinicalRationale: 'Adequate spinal tissue hydration combined with core stabilizer conditioning reduces intradiscal compression pressure.',
    actionableSteps: [
      'Drink 2.5–3.0 liters of filtered water daily.',
      'Execute 10 minutes of gentle spinal extension stretches twice daily.'
    ],
    updatedAt: '2026-03-20'
  },
  {
    id: 'rec-205',
    title: 'Cardiac Rehab Aerobics',
    type: 'Exercise',
    targetUsers: ['Elderly', 'Adults'],
    healthCondition: 'Post-Cardiac Surgery',
    healthGoal: 'Heart Health',
    dietType: 'Low Fat / Cardiac Safe',
    priority: 'High',
    status: 'Active',
    summary: 'Gradual low-intensity seated and standing aerobic walking strictly monitored under target heart rate boundaries.',
    clinicalRationale: 'Controlled submaximal aerobic conditioning improves myocardial oxygen delivery and speeds cardiac tissue repair.',
    actionableSteps: [
      'Walk on flat terrain at a light 2-3 Borg RPE scale for 15 minutes.',
      'Avoid heavy upper body pushing or pulling over 10 lbs until cleared.'
    ],
    updatedAt: '2026-03-25'
  },
  {
    id: 'rec-206',
    title: 'Bone Density Calcium Protocol',
    type: 'Lifestyle',
    targetUsers: ['Elderly', 'Adults'],
    healthCondition: 'Osteoporosis',
    healthGoal: 'Muscle Strength',
    dietType: 'High Calcium / Whole Food',
    priority: 'Medium',
    status: 'Active',
    summary: 'Dietary calcium from fortified plant milks and dark leafy greens paired with light axial bone weight-bearing loads.',
    clinicalRationale: 'Mechanical osteogenic stimulus combined with bioavailable calcium stimulates osteoblast bone remodeling.',
    actionableSteps: [
      'Incorporate 1,200 mg dietary calcium across 3 daily meals.',
      'Perform light resistance band scapular pulls and wall squats.'
    ],
    updatedAt: '2026-04-01'
  },
  {
    id: 'rec-207',
    title: 'Hydration & Satiety Strategy',
    type: 'Hydration',
    targetUsers: ['Everyone'],
    healthCondition: 'Obesity Management',
    healthGoal: 'Weight Loss',
    dietType: 'Calorie Controlled / High Fiber',
    priority: 'Low',
    status: 'Inactive',
    summary: 'Pre-meal broth soup and high-water vegetable appetizers to stimulate stretch receptors and promote early satiety.',
    clinicalRationale: 'Gastric distension triggers vagal nerve signaling to satiety centers in the hypothalamus prior to dense caloric intake.',
    actionableSteps: [
      'Drink 500 ml water 15 minutes before lunch and dinner.',
      'Fill half of every plate with non-starchy vegetables.'
    ],
    updatedAt: '2026-04-05'
  }
];

export const TYPE_OPTIONS: (RecommendationType | 'All')[] = ['All', 'Food', 'Exercise', 'Hydration', 'Lifestyle'];
export const TARGET_USER_OPTIONS: (TargetUserGroup | 'All')[] = ['All', 'Adults', 'Children', 'Elderly', 'Athletes', 'Everyone'];

export const CONDITION_OPTIONS = [
  'All',
  'Hypertension',
  'Type 2 Diabetes',
  'Rheumatoid Arthritis',
  'Low Back Pain',
  'Post-Cardiac Surgery',
  'Osteoporosis',
  'Obesity Management',
  'General Wellness'
];

export const GOAL_OPTIONS = [
  'All',
  'Heart Health',
  'Weight Loss',
  'Mobility & Joint Health',
  'Muscle Strength',
  'General Fitness'
];

export const DIET_OPTIONS = [
  'All',
  'DASH Diet',
  'Low GI / Diabetic Friendly',
  'Mediterranean',
  'Balanced Whole Food',
  'Low Fat / Cardiac Safe',
  'High Calcium / Whole Food',
  'Calorie Controlled / High Fiber'
];

export const STATUS_OPTIONS = ['All', 'Active', 'Inactive'];
export const PRIORITY_OPTIONS = ['All', 'High', 'Medium', 'Low'];

export default function AdminRecommendationsManagement() {
  const [recommendations, setRecommendations] = useState<ManagedRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            type: item.type || 'Food',
            targetUsers: Array.isArray(item.targetUsers) && item.targetUsers.length > 0
              ? item.targetUsers
              : [item.targetUser || 'Adults']
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse managed recommendations from storage', e);
    }
    return INITIAL_RECOMMENDATIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTargetUser, setSelectedTargetUser] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedRecommendation, setSelectedRecommendation] = useState<ManagedRecommendation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    type: RecommendationType;
    targetUsers: TargetUserGroup[];
    healthCondition: string;
    healthGoal: string;
    dietType: string;
    priority: RecommendationPriority;
    status: RecommendationStatus;
    summary: string;
    clinicalRationale: string;
    actionableSteps: string;
  }>({
    title: '',
    type: 'Food',
    targetUsers: ['Adults'],
    healthCondition: 'Hypertension',
    healthGoal: 'Heart Health',
    dietType: 'DASH Diet',
    priority: 'High',
    status: 'Active',
    summary: '',
    clinicalRationale: '',
    actionableSteps: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recommendations));
    } catch (e) {
      console.error('Failed to persist managed recommendations', e);
    }
  }, [recommendations]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const kpis = useMemo(() => {
    const total = recommendations.length;
    const active = recommendations.filter((r) => r.status === 'Active').length;
    const highPriority = recommendations.filter((r) => r.priority === 'High').length;
    const typesCount = new Set(recommendations.map((r) => r.type)).size;

    return { total, active, highPriority, typesCount };
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return recommendations
      .filter((rec) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          rec.title.toLowerCase().includes(q) ||
          rec.healthCondition.toLowerCase().includes(q) ||
          rec.healthGoal.toLowerCase().includes(q) ||
          rec.summary.toLowerCase().includes(q) ||
          rec.dietType.toLowerCase().includes(q) ||
          rec.type.toLowerCase().includes(q) ||
          rec.targetUsers.some((u) => u.toLowerCase().includes(q));

        const matchesType = selectedType === 'All' || rec.type === selectedType;
        const matchesTargetUser =
          selectedTargetUser === 'All' || rec.targetUsers.includes(selectedTargetUser as TargetUserGroup);
        const matchesCondition = selectedCondition === 'All' || rec.healthCondition === selectedCondition;
        const matchesGoal = selectedGoal === 'All' || rec.healthGoal === selectedGoal;
        const matchesDiet = selectedDiet === 'All' || rec.dietType === selectedDiet;
        const matchesStatus = selectedStatus === 'All' || rec.status === selectedStatus;
        const matchesPriority = selectedPriority === 'All' || rec.priority === selectedPriority;

        return (
          matchesQuery &&
          matchesType &&
          matchesTargetUser &&
          matchesCondition &&
          matchesGoal &&
          matchesDiet &&
          matchesStatus &&
          matchesPriority
        );
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.updatedAt.localeCompare(a.updatedAt);
        if (sortBy === 'oldest') return a.updatedAt.localeCompare(b.updatedAt);
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
        return 0;
      });
  }, [
    recommendations,
    searchQuery,
    selectedType,
    selectedTargetUser,
    selectedCondition,
    selectedGoal,
    selectedDiet,
    selectedStatus,
    selectedPriority,
    sortBy
  ]);

  const totalPages = Math.ceil(filteredRecommendations.length / itemsPerPage) || 1;
  const paginatedRecommendations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecommendations.slice(start, start + itemsPerPage);
  }, [filteredRecommendations, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedType,
    selectedTargetUser,
    selectedCondition,
    selectedGoal,
    selectedDiet,
    selectedStatus,
    selectedPriority,
    sortBy
  ]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedType !== 'All' ||
      selectedTargetUser !== 'All' ||
      selectedCondition !== 'All' ||
      selectedGoal !== 'All' ||
      selectedDiet !== 'All' ||
      selectedStatus !== 'All' ||
      selectedPriority !== 'All' ||
      sortBy !== 'newest'
    );
  }, [
    searchQuery,
    selectedType,
    selectedTargetUser,
    selectedCondition,
    selectedGoal,
    selectedDiet,
    selectedStatus,
    selectedPriority,
    sortBy
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedTargetUser('All');
    setSelectedCondition('All');
    setSelectedGoal('All');
    setSelectedDiet('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSortBy('newest');
    showToast('Filters reset to defaults', 'info');
  };

  const handleOpenView = (rec: ManagedRecommendation) => {
    setSelectedRecommendation(rec);
    setIsViewModalOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      type: 'Food',
      targetUsers: ['Adults'],
      healthCondition: 'Hypertension',
      healthGoal: 'Heart Health',
      dietType: 'DASH Diet',
      priority: 'High',
      status: 'Active',
      summary: '',
      clinicalRationale: '',
      actionableSteps: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (rec: ManagedRecommendation) => {
    setSelectedRecommendation(rec);
    setFormData({
      title: rec.title,
      type: rec.type,
      targetUsers: rec.targetUsers && rec.targetUsers.length > 0 ? rec.targetUsers : ['Adults'],
      healthCondition: rec.healthCondition,
      healthGoal: rec.healthGoal,
      dietType: rec.dietType,
      priority: rec.priority,
      status: rec.status,
      summary: rec.summary,
      clinicalRationale: rec.clinicalRationale || '',
      actionableSteps: rec.actionableSteps ? rec.actionableSteps.join('\n') : ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (rec: ManagedRecommendation) => {
    setSelectedRecommendation(rec);
    setIsDeleteModalOpen(true);
  };

  const handleDuplicate = (rec: ManagedRecommendation) => {
    const duplicated: ManagedRecommendation = {
      ...rec,
      id: `rec-${Date.now().toString().slice(-4)}`,
      title: `${rec.title} (Copy)`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setRecommendations((prev) => [duplicated, ...prev]);
    showToast(`Duplicated recommendation "${rec.title}"`);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.summary.trim()) return;

    const stepsArray = formData.actionableSteps
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newRec: ManagedRecommendation = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      title: formData.title.trim(),
      type: formData.type,
      targetUsers: formData.targetUsers.length > 0 ? formData.targetUsers : ['Everyone'],
      healthCondition: formData.healthCondition,
      healthGoal: formData.healthGoal,
      dietType: formData.dietType,
      priority: formData.priority,
      status: formData.status,
      summary: formData.summary.trim(),
      clinicalRationale: formData.clinicalRationale.trim(),
      actionableSteps: stepsArray.length > 0 ? stepsArray : undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setRecommendations((prev) => [newRec, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Added recommendation protocol "${newRec.title}"`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecommendation || !formData.title.trim() || !formData.summary.trim()) return;

    const stepsArray = formData.actionableSteps
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated: ManagedRecommendation = {
      ...selectedRecommendation,
      title: formData.title.trim(),
      type: formData.type,
      targetUsers: formData.targetUsers.length > 0 ? formData.targetUsers : ['Everyone'],
      healthCondition: formData.healthCondition,
      healthGoal: formData.healthGoal,
      dietType: formData.dietType,
      priority: formData.priority,
      status: formData.status,
      summary: formData.summary.trim(),
      clinicalRationale: formData.clinicalRationale.trim(),
      actionableSteps: stepsArray.length > 0 ? stepsArray : undefined,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setRecommendations((prev) => prev.map((item) => (item.id === selectedRecommendation.id ? updated : item)));
    setIsEditModalOpen(false);
    showToast(`Updated recommendation "${updated.title}"`);
  };

  const handleConfirmDelete = () => {
    if (!selectedRecommendation) return;
    setRecommendations((prev) => prev.filter((item) => item.id !== selectedRecommendation.id));
    setIsDeleteModalOpen(false);
    showToast(`Deleted recommendation protocol "${selectedRecommendation.title}"`, 'info');
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Type',
      'Target Users',
      'Health Condition',
      'Health Goal',
      'Diet Type',
      'Priority',
      'Status',
      'Summary',
      'Last Updated'
    ];
    const rows = recommendations.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.type,
      `"${r.targetUsers.join('; ')}"`,
      `"${r.healthCondition}"`,
      `"${r.healthGoal}"`,
      `"${r.dietType}"`,
      r.priority,
      r.status,
      `"${r.summary.replace(/"/g, '""')}"`,
      r.updatedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clinical_recommendations_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported recommendations catalog to CSV');
  };

  const renderTypeBadge = (type: RecommendationType) => {
    switch (type) {
      case 'Food':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
            <Utensils className="w-3 h-3 text-emerald-600 shrink-0" />
            Food
          </span>
        );
      case 'Exercise':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
            <Dumbbell className="w-3 h-3 text-indigo-600 shrink-0" />
            Exercise
          </span>
        );
      case 'Hydration':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
            <Droplets className="w-3 h-3 text-sky-600 shrink-0" />
            Hydration
          </span>
        );
      case 'Lifestyle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
            <Compass className="w-3 h-3 text-purple-600 shrink-0" />
            Lifestyle
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            <Zap className="w-3 h-3 text-rose-500 shrink-0" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
    }
  };

  const renderStatusBadge = (status: RecommendationStatus) => {
    return status === 'Active' ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <XCircle className="w-3 h-3 text-slate-400 shrink-0" />
        Inactive
      </span>
    );
  };

  const toggleTargetUser = (userGroup: TargetUserGroup) => {
    setFormData((prev) => {
      const exists = prev.targetUsers.includes(userGroup);
      if (exists) {
        if (prev.targetUsers.length === 1) return prev; // keep at least 1
        return { ...prev, targetUsers: prev.targetUsers.filter((u) => u !== userGroup) };
      } else {
        return { ...prev, targetUsers: [...prev.targetUsers, userGroup] };
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in" id="admin-recommendations-management-root">
      {/* Toast Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-extrabold ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-amber-500/30'
                : 'bg-amber-900 text-white border-amber-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/30 shrink-0 shadow-2xs mt-0.5">
            <Lightbulb className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                System Administration
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">• Clinical Guidance Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Recommendations Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Manage clinical decision rules, condition guidelines, recommendation types, and targeted user group protocols.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
            className="rounded-xl font-extrabold text-xs h-11"
            id="export-recommendations-csv-btn"
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="rounded-xl font-extrabold text-xs h-11 shadow-2xs"
            id="add-new-recommendation-btn"
          >
            Add Recommendation
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="recommendations-kpis-grid">
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">
                Total Recommendations
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.total}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Clinical guidance rules</span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <Lightbulb className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Recommendations
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.active}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Live in clinical engine</span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-rose-600 dark:text-rose-400">
                High Priority Rules
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.highPriority}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Critical pathways</span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/40">
              <Zap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                Categories Covered
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.typesCount}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Food, exercise, hydration...</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Controls Toolbar */}
      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by title, condition, goal, target user, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl text-xs sm:text-sm"
                id="recommendations-search-input"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="recommendation-type-filter"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedTargetUser}
                onChange={(e) => setSelectedTargetUser(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="recommendation-target-user-filter"
              >
                {TARGET_USER_OPTIONS.map((tu) => (
                  <option key={tu} value={tu}>
                    User: {tu}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="recommendation-condition-filter"
              >
                {CONDITION_OPTIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    Cond: {cond}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="recommendation-goal-filter"
              >
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal} value={goal}>
                    Goal: {goal}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                Priority:
              </span>
              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-9 py-1 rounded-lg text-xs font-semibold w-auto border-slate-200 dark:border-slate-800"
                id="recommendation-priority-select"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    Priority: {p}
                  </option>
                ))}
              </Select>

              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider ml-1">
                Status:
              </span>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 py-1 rounded-lg text-xs font-semibold w-auto border-slate-200 dark:border-slate-800"
                id="recommendation-status-select"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </Select>

              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider ml-1">
                Sort:
              </span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 py-1 rounded-lg text-xs font-semibold w-auto border-slate-200 dark:border-slate-800"
                id="recommendation-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title (A–Z)</option>
                <option value="title-desc">Title (Z–A)</option>
              </Select>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing <strong className="text-slate-900 dark:text-white font-extrabold">{filteredRecommendations.length}</strong> of {recommendations.length} recommendations
            </span>
          </div>

          {/* Active Filter Pills Toolbar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
              <span className="text-3xs font-black uppercase text-slate-400 tracking-wider">Active Filters:</span>
              
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60">
                  Search: "{searchQuery}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-amber-900" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {selectedType !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                  Type: {selectedType}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-900" onClick={() => setSelectedType('All')} />
                </span>
              )}

              {selectedTargetUser !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60">
                  User: {selectedTargetUser}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-purple-900" onClick={() => setSelectedTargetUser('All')} />
                </span>
              )}

              {selectedCondition !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                  Cond: {selectedCondition}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900" onClick={() => setSelectedCondition('All')} />
                </span>
              )}

              {selectedGoal !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60">
                  Goal: {selectedGoal}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-sky-900" onClick={() => setSelectedGoal('All')} />
                </span>
              )}

              {selectedPriority !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60">
                  Priority: {selectedPriority}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-900" onClick={() => setSelectedPriority('All')} />
                </span>
              )}

              {selectedStatus !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200">
                  Status: {selectedStatus}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900" onClick={() => setSelectedStatus('All')} />
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleResetFilters}
                className="h-7 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-extrabold ml-auto"
                id="reset-all-recommendations-filters-btn"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table / Cards View */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <EmptyState
          title="No Recommendations Found"
          description="No clinical rules match your search or filter parameters. Try clearing your filters or creating a new recommendation."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
          icon={<Lightbulb className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-black uppercase text-3xs tracking-wider">
                  <th className="py-4 px-5">Recommendation Title</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Target Users</th>
                  <th className="py-4 px-4">Condition & Goal</th>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Last Updated</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedRecommendations.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenView(rec)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate max-w-[200px]">
                            {rec.title}
                          </span>
                          <span className="text-3xs text-slate-400 dark:text-slate-500 font-bold truncate max-w-[200px]">
                            {rec.dietType}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">{renderTypeBadge(rec.type)}</td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {rec.targetUsers.map((u) => (
                          <span
                            key={u}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-3xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[160px]">
                          {rec.healthCondition}
                        </span>
                        <span className="text-3xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                          {rec.healthGoal}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">{renderPriorityBadge(rec.priority)}</td>

                    <td className="py-4 px-4">{renderStatusBadge(rec.status)}</td>

                    <td className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">
                      {rec.updatedAt}
                    </td>

                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenView(rec)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg"
                          title="View Full Protocol"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(rec)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                          title="Edit Protocol"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Copy className="w-3.5 h-3.5" />}
                          onClick={() => handleDuplicate(rec)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg"
                          title="Duplicate Protocol"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDelete(rec)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          title="Delete Protocol"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {paginatedRecommendations.map((rec) => (
              <Card
                key={rec.id}
                className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl flex flex-col justify-between"
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/50 flex items-center justify-center font-extrabold text-sm shrink-0">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                          {rec.title}
                        </h4>
                        <span className="text-3xs text-slate-400 dark:text-slate-500 font-bold">
                          {rec.healthCondition} • {rec.healthGoal}
                        </span>
                      </div>
                    </div>
                    {renderStatusBadge(rec.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                    {rec.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {renderTypeBadge(rec.type)}
                    {renderPriorityBadge(rec.priority)}
                    <div className="flex flex-wrap gap-1">
                      {rec.targetUsers.map((u) => (
                        <span
                          key={u}
                          className="px-2 py-0.5 rounded-md text-3xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                    <span className="text-3xs font-bold text-slate-400">Updated: {rec.updatedAt}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenView(rec)}
                        className="h-8 px-2 text-xs font-extrabold text-amber-600 dark:text-amber-400"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(rec)}
                        className="h-8 px-2 text-xs font-extrabold"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(rec)}
                        className="h-8 px-2 text-xs text-indigo-600 dark:text-indigo-400"
                      >
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(rec)}
                        className="h-8 px-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800/80 pt-5">
              <span className="text-xs text-slate-500 font-semibold">
                Page <strong className="text-slate-900 dark:text-white font-extrabold">{currentPage}</strong> of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                  className="rounded-xl font-extrabold text-xs h-9"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl font-extrabold text-xs h-9"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: VIEW RECOMMENDATION DETAILS */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Clinical Intervention Protocol Specification"
        size="lg"
        id="modal-view-recommendation"
      >
        {selectedRecommendation && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-2xs">
                <Lightbulb className="w-7 h-7" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  {selectedRecommendation.title}
                </h3>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  {selectedRecommendation.healthCondition} • {selectedRecommendation.healthGoal}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {renderTypeBadge(selectedRecommendation.type)}
                  {renderPriorityBadge(selectedRecommendation.priority)}
                  {renderStatusBadge(selectedRecommendation.status)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                Full Recommendation Details & Summary
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {selectedRecommendation.summary}
              </p>
            </div>

            {selectedRecommendation.clinicalRationale && (
              <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/30">
                <span className="text-3xs uppercase font-black text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Clinical & Scientific Rationale
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedRecommendation.clinicalRationale}
                </p>
              </div>
            )}

            {selectedRecommendation.actionableSteps && selectedRecommendation.actionableSteps.length > 0 && (
              <div>
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-2.5">
                  Actionable Implementation Steps
                </span>
                <ul className="space-y-2">
                  {selectedRecommendation.actionableSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                  Target User Groups
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedRecommendation.targetUsers.map((tu) => (
                    <span
                      key={tu}
                      className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50"
                    >
                      {tu}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                  Dietary Pattern
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedRecommendation.dietType}
                </span>
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                  Last Revision Date
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedRecommendation.updatedAt}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-wrap justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="h-11 px-5 rounded-xl font-extrabold"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleDuplicate(selectedRecommendation);
                }}
                icon={<Copy className="w-4 h-4" />}
                className="h-11 px-4 rounded-xl font-extrabold"
              >
                Duplicate
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedRecommendation);
                }}
                icon={<Edit3 className="w-4 h-4" />}
                className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
              >
                Edit Protocol
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: ADD / EDIT RECOMMENDATION FORM */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Clinical Recommendation' : 'Edit Clinical Recommendation'}
        size="lg"
        id="modal-add-edit-recommendation"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Recommendation Title <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. DASH Sodium Protocol"
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Recommendation Type
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as RecommendationType })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {TYPE_OPTIONS.filter((t) => t !== 'All').map((t) => (
                  <option key={t} value={t}>
                    {t} Protocol
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Target User Groups
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(['Adults', 'Children', 'Elderly', 'Athletes', 'Everyone'] as TargetUserGroup[]).map((group) => {
                  const isSelected = formData.targetUsers.includes(group);
                  return (
                    <button
                      type="button"
                      key={group}
                      onClick={() => toggleTargetUser(group)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Health Condition
              </label>
              <Select
                value={formData.healthCondition}
                onChange={(e) => setFormData({ ...formData, healthCondition: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {CONDITION_OPTIONS.filter((c) => c !== 'All').map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Health Goal
              </label>
              <Select
                value={formData.healthGoal}
                onChange={(e) => setFormData({ ...formData, healthGoal: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {GOAL_OPTIONS.filter((g) => g !== 'All').map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Dietary Strategy
              </label>
              <Select
                value={formData.dietType}
                onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {DIET_OPTIONS.filter((d) => d !== 'All').map((diet) => (
                  <option key={diet} value={diet}>
                    {diet}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Tier
              </label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as RecommendationPriority })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Rule Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RecommendationStatus })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Recommendation Summary <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Clear, concise intervention rule presented to the patient..."
              className="rounded-xl text-xs sm:text-sm font-medium p-3"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Clinical & Scientific Rationale
            </label>
            <Textarea
              value={formData.clinicalRationale}
              onChange={(e) => setFormData({ ...formData, clinicalRationale: e.target.value })}
              placeholder="Medical reasoning, study references, or clinical pathway basis..."
              className="rounded-xl text-xs sm:text-sm font-medium p-3"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Actionable Implementation Steps (One per line)
            </label>
            <Textarea
              value={formData.actionableSteps}
              onChange={(e) => setFormData({ ...formData, actionableSteps: e.target.value })}
              placeholder="Step 1: Replace sodium salt with citrus and herbs&#10;Step 2: Log morning blood pressure daily"
              className="rounded-xl text-xs sm:text-sm font-medium p-3"
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-1 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="h-11 px-5 rounded-xl font-extrabold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={isAddModalOpen ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
            >
              {isAddModalOpen ? 'Create Recommendation' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Recommendation Protocol"
        size="sm"
        id="modal-delete-recommendation"
      >
        {selectedRecommendation && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                  Confirm Protocol Removal
                </span>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  Are you sure you want to delete <strong className="font-black text-rose-950 dark:text-rose-100">"{selectedRecommendation.title}"</strong>? This will remove the rule from active recommendations.
                </p>
              </div>
            </div>

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
                Delete Rule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
