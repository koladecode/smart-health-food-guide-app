import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
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
  Stethoscope,
  Activity,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Utensils,
  Dumbbell,
  Lightbulb,
  Check,
  X,
  Tag,
  Layers,
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent } from './Card';
import Modal from './Modal';
import { Input, Select, Textarea } from './Input';
import EmptyState from './EmptyState';
import { Skeleton } from './Skeleton';

export type ConditionStatus = 'Active' | 'Inactive';
export type RiskLevel = 'High Risk' | 'Moderate Risk' | 'Low Risk';

export interface ManagedCondition {
  id: string;
  name: string;
  category: string;
  riskLevel: RiskLevel;
  symptoms: string[];
  linkedFoods: string[];
  linkedExercises: string[];
  linkedRecommendations: string[];
  linkedRecommendationsCount: number;
  linkedExercisesCount: number;
  status: ConditionStatus;
  description: string;
  clinicalNotes?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'smart_health_guide_managed_conditions';

const INITIAL_CONDITIONS: ManagedCondition[] = [
  {
    id: 'cond-301',
    name: 'Essential Primary Hypertension',
    category: 'Cardiovascular',
    riskLevel: 'High Risk',
    symptoms: ['Elevated Resting BP (>130/80)', 'Occasional Morning Headaches', 'Dizziness', 'Fatigue'],
    linkedFoods: ['Potassium-rich Leafy Greens', 'Unsalted Almonds & Seeds', 'Citrus Fruits', 'Low-Sodium DASH Broth'],
    linkedExercises: ['Brisk Aerobic Walking (30m)', 'Submaximal Stationary Cycling', 'Light Resistance Bands'],
    linkedRecommendations: ['DASH Sodium Protocol (<1,500mg/day)', 'Resting Blood Pressure Log', 'Citrus & Herb Seasoning Swap'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Active',
    description: 'Chronic arterial wall pressure elevation requiring sodium restriction, cardiovascular aerobic walking, and continuous blood pressure monitoring.',
    clinicalNotes: 'First-line lifestyle interventions include DASH dietary guidelines and daily 30-minute moderate walking protocols.',
    updatedAt: '2026-03-01'
  },
  {
    id: 'cond-302',
    name: 'Type 2 Diabetes Mellitus',
    category: 'Endocrine & Metabolic',
    riskLevel: 'High Risk',
    symptoms: ['Hyperglycemia', 'Increased Thirst & Urination', 'Slow Wound Healing', 'Peripheral Fatigue'],
    linkedFoods: ['Whole Grain Fonio & Quinoa', 'Lean Poultry & Tofu', 'Soluble Oat Fiber', 'Wild Berries'],
    linkedExercises: ['Post-meal 15-minute Walk', 'Low-impact Elliptical Routine', 'Core Stability & Stretching'],
    linkedRecommendations: ['Low-GI Carb Pairing Protocol', '2-Hour Postprandial Glucose Log', 'Glycemic Index Control'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Active',
    description: 'Impaired insulin secretion and peripheral tissue resistance requiring glycemic index control, post-meal walks, and carbohydrate pairing.',
    clinicalNotes: 'Combine low GI dietary carbohydrates with lean protein to reduce postprandial glucose excursions.',
    updatedAt: '2026-03-08'
  },
  {
    id: 'cond-303',
    name: 'Rheumatoid Arthritis',
    category: 'Musculoskeletal & Autoimmune',
    riskLevel: 'Moderate Risk',
    symptoms: ['Symmetrical Joint Stiffness', 'Morning Joint Pain', 'Swelling in Hands & Knees', 'Reduced Range of Motion'],
    linkedFoods: ['Cold-Water Wild Salmon', 'Extra Virgin Olive Oil', 'Antioxidant Blueberry Smoothie', 'Walnuts'],
    linkedExercises: ['Aqueous Hydrotherapy', 'Gentle Morning Chair Yoga', 'Low-impact Swimming'],
    linkedRecommendations: ['Mediterranean Omega-3 Protocol', 'Joint Morning Range-of-Motion Routine', 'Anti-inflammatory Dietary Plan'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Active',
    description: 'Autoimmune joint synovial inflammation benefiting from omega-3 anti-inflammatory dietary strategies and low-impact hydrotherapy.',
    clinicalNotes: 'Aqueous movement and gentle chair yoga relieve joint pressure during active flare recovery.',
    updatedAt: '2026-03-12'
  },
  {
    id: 'cond-304',
    name: 'Lumbar Disc Herniation & Sciatica',
    category: 'Musculoskeletal & Spine',
    riskLevel: 'Moderate Risk',
    symptoms: ['Lower Back Pain', 'Radiating Leg Numbness', 'Spinal Stiffness', 'Sitting Intolerance'],
    linkedFoods: ['Anti-inflammatory Turmeric Tea', 'Hydrating Bone Broth', 'Magnesium-dense Pumpkin Seeds'],
    linkedExercises: ['Cat-Cow Decompression', 'Bird-Dog Core Hold', 'Pelvic Tilts & Glute Bridges'],
    linkedRecommendations: ['Lumbar Decompression Routine', 'Daily 3.0L Water Hydration Goal', 'Spinal Posture Alignment'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Active',
    description: 'Spinal disc compression irritating sciatic nerve roots. Managed with cat-cow decompression, core stability, and optimal hydration.',
    clinicalNotes: 'Strictly avoid heavy axial loading or forward flexion under heavy resistance.',
    updatedAt: '2026-03-18'
  },
  {
    id: 'cond-305',
    name: 'Post-Operative Cardiac Recovery',
    category: 'Cardiovascular Rehab',
    riskLevel: 'High Risk',
    symptoms: ['Sternal Incision Healing', 'Reduced Functional Capacity', 'Mild Dyspnea on Exertion'],
    linkedFoods: ['Steamed White Fish', 'Steel-Cut Oatmeal', 'Boiled Skinless Chicken Breast', 'Fresh Papaya'],
    linkedExercises: ['Flat Terrain Walking (Borg 2-3)', 'Seated Ankle Pumps', 'Gentle Diaphragmatic Breathing'],
    linkedRecommendations: ['Cardiac Rehab Aerobics Guideline', 'Sternotomy Weight Limits (<10 lbs)', 'Heart-Healthy Low-Fat Diet'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Active',
    description: 'Post-surgical myocardial recovery phase requiring submaximal Borg scale heart rate walking and heart-healthy low-fat nutrition.',
    clinicalNotes: 'Sternotomy precautions prohibit pushing or pulling over 10 lbs for 8–12 weeks.',
    updatedAt: '2026-03-22'
  },
  {
    id: 'cond-306',
    name: 'Osteoporosis & Osteopenia',
    category: 'Bone & Skeletal',
    riskLevel: 'Moderate Risk',
    symptoms: ['Reduced Bone Mineral Density', 'Postural Kyphosis Risk', 'Asymptomatic Fractures'],
    linkedFoods: ['Fortified Plant Milks', 'Dark Leafy Greens & Kale', 'Calcium-rich Sardines', 'Chia Seeds'],
    linkedExercises: ['Axial Load Standing Squats', 'Resistance Band Scapular Rows', 'Step-up Balance Drill'],
    linkedRecommendations: ['Bone Density Calcium Protocol (1,200mg)', 'Vitamin D3 & Sunlight Alignment', 'Fall Prevention Environment'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Active',
    description: 'Systemic skeletal fragility managed through dietary calcium fortification, Vitamin D3, and controlled weight-bearing exercise.',
    clinicalNotes: 'Osteogenic stimulus requires light ground reaction impact and resistance band rowing.',
    updatedAt: '2026-04-02'
  },
  {
    id: 'cond-307',
    name: 'Class I Adult Obesity',
    category: 'Metabolic & Lifestyle',
    riskLevel: 'Low Risk',
    symptoms: ['BMI 30.0–34.9', 'Exertional Shortness of Breath', 'Elevated Joint Stress'],
    linkedFoods: ['Pre-meal Non-starchy Vegetable Salads', 'Clear Bone Broth', 'High-Fiber Legumes'],
    linkedExercises: ['Progressive Incline Walking', 'Water Aerobics Class', 'Seated Cable Presses'],
    linkedRecommendations: ['Hydration & Satiety Strategy', 'Volumetric Eating Protocol', 'Daily Step Count Milestone'],
    linkedRecommendationsCount: 3,
    linkedExercisesCount: 3,
    status: 'Inactive',
    description: 'Excess adipose tissue accumulation addressed via pre-meal volumetric hydration and progressive low-impact aerobic walking.',
    clinicalNotes: 'Focus on sustainable habit formation and energy density reduction.',
    updatedAt: '2026-04-10'
  }
];

export const CATEGORY_OPTIONS = [
  'All',
  'Cardiovascular',
  'Endocrine & Metabolic',
  'Musculoskeletal & Autoimmune',
  'Musculoskeletal & Spine',
  'Cardiovascular Rehab',
  'Bone & Skeletal',
  'Metabolic & Lifestyle',
  'General Medicine'
];

export const RISK_OPTIONS = ['All', 'High Risk', 'Moderate Risk', 'Low Risk'];
export const STATUS_OPTIONS = ['All', 'Active', 'Inactive'];

export default function AdminDiseasesManagement() {
  const [conditions, setConditions] = useState<ManagedCondition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            symptoms: Array.isArray(item.symptoms) ? item.symptoms : [],
            linkedFoods: Array.isArray(item.linkedFoods) && item.linkedFoods.length > 0
              ? item.linkedFoods
              : ['Nutrient-dense Whole Foods', 'Low Sodium Options'],
            linkedExercises: Array.isArray(item.linkedExercises) && item.linkedExercises.length > 0
              ? item.linkedExercises
              : ['Gentle Walking', 'Stretching Routine'],
            linkedRecommendations: Array.isArray(item.linkedRecommendations) && item.linkedRecommendations.length > 0
              ? item.linkedRecommendations
              : ['Clinical Care Guideline'],
            linkedRecommendationsCount: item.linkedRecommendationsCount ?? (item.linkedRecommendations?.length || 1),
            linkedExercisesCount: item.linkedExercisesCount ?? (item.linkedExercises?.length || 1)
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse managed conditions from storage', e);
    }
    return INITIAL_CONDITIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'risk-desc' | 'most-linked'>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedCondition, setSelectedCondition] = useState<ManagedCondition | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    riskLevel: RiskLevel;
    symptoms: string;
    linkedFoods: string;
    linkedExercises: string;
    linkedRecommendations: string;
    status: ConditionStatus;
    description: string;
    clinicalNotes: string;
  }>({
    name: '',
    category: 'Cardiovascular',
    riskLevel: 'Moderate Risk',
    symptoms: '',
    linkedFoods: '',
    linkedExercises: '',
    linkedRecommendations: '',
    status: 'Active',
    description: '',
    clinicalNotes: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
    } catch (e) {
      console.error('Failed to persist managed conditions', e);
    }
  }, [conditions]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const kpis = useMemo(() => {
    const total = conditions.length;
    const active = conditions.filter((c) => c.status === 'Active').length;
    const highRisk = conditions.filter((c) => c.riskLevel === 'High Risk').length;
    const totalLinkedProtocols = conditions.reduce((acc, c) => {
      const foods = c.linkedFoods ? c.linkedFoods.length : 0;
      const exercises = c.linkedExercises ? c.linkedExercises.length : c.linkedExercisesCount;
      const recs = c.linkedRecommendations ? c.linkedRecommendations.length : c.linkedRecommendationsCount;
      return acc + foods + exercises + recs;
    }, 0);

    return { total, active, highRisk, totalLinkedProtocols };
  }, [conditions]);

  const filteredConditions = useMemo(() => {
    return conditions
      .filter((cond) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          cond.name.toLowerCase().includes(q) ||
          cond.category.toLowerCase().includes(q) ||
          cond.description.toLowerCase().includes(q) ||
          cond.symptoms.some((s) => s.toLowerCase().includes(q)) ||
          (cond.linkedFoods && cond.linkedFoods.some((f) => f.toLowerCase().includes(q))) ||
          (cond.linkedExercises && cond.linkedExercises.some((e) => e.toLowerCase().includes(q))) ||
          (cond.linkedRecommendations && cond.linkedRecommendations.some((r) => r.toLowerCase().includes(q)));

        const matchesCategory = selectedCategory === 'All' || cond.category === selectedCategory;
        const matchesRisk = selectedRisk === 'All' || cond.riskLevel === selectedRisk;
        const matchesStatus = selectedStatus === 'All' || cond.status === selectedStatus;

        return matchesQuery && matchesCategory && matchesRisk && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.updatedAt.localeCompare(a.updatedAt);
        if (sortBy === 'oldest') return a.updatedAt.localeCompare(b.updatedAt);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'risk-desc') {
          const score = { 'High Risk': 3, 'Moderate Risk': 2, 'Low Risk': 1 };
          return score[b.riskLevel] - score[a.riskLevel];
        }
        if (sortBy === 'most-linked') {
          const countA = (a.linkedFoods?.length || 0) + (a.linkedExercises?.length || a.linkedExercisesCount) + (a.linkedRecommendations?.length || a.linkedRecommendationsCount);
          const countB = (b.linkedFoods?.length || 0) + (b.linkedExercises?.length || b.linkedExercisesCount) + (b.linkedRecommendations?.length || b.linkedRecommendationsCount);
          return countB - countA;
        }
        return 0;
      });
  }, [conditions, searchQuery, selectedCategory, selectedRisk, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredConditions.length / itemsPerPage) || 1;
  const paginatedConditions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredConditions.slice(start, start + itemsPerPage);
  }, [filteredConditions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedRisk, selectedStatus, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategory !== 'All' ||
      selectedRisk !== 'All' ||
      selectedStatus !== 'All' ||
      sortBy !== 'newest'
    );
  }, [searchQuery, selectedCategory, selectedRisk, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRisk('All');
    setSelectedStatus('All');
    setSortBy('newest');
    showToast('Filters reset to defaults', 'info');
  };

  const handleOpenView = (cond: ManagedCondition) => {
    setSelectedCondition(cond);
    setIsViewModalOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Cardiovascular',
      riskLevel: 'Moderate Risk',
      symptoms: 'Elevated BP, Morning Fatigue, Dizziness',
      linkedFoods: 'Potassium Greens, Unsalted Almonds, Citrus Fruits',
      linkedExercises: 'Brisk Aerobic Walking, Stationary Cycling',
      linkedRecommendations: 'DASH Sodium Protocol, Resting BP Tracker',
      status: 'Active',
      description: '',
      clinicalNotes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cond: ManagedCondition) => {
    setSelectedCondition(cond);
    setFormData({
      name: cond.name,
      category: cond.category,
      riskLevel: cond.riskLevel,
      symptoms: cond.symptoms ? cond.symptoms.join(', ') : '',
      linkedFoods: cond.linkedFoods ? cond.linkedFoods.join(', ') : '',
      linkedExercises: cond.linkedExercises ? cond.linkedExercises.join(', ') : '',
      linkedRecommendations: cond.linkedRecommendations ? cond.linkedRecommendations.join(', ') : '',
      status: cond.status,
      description: cond.description,
      clinicalNotes: cond.clinicalNotes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (cond: ManagedCondition) => {
    setSelectedCondition(cond);
    setIsDeleteModalOpen(true);
  };

  const handleDuplicate = (cond: ManagedCondition) => {
    const duplicated: ManagedCondition = {
      ...cond,
      id: `cond-${Date.now().toString().slice(-4)}`,
      name: `${cond.name} (Copy)`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setConditions((prev) => [duplicated, ...prev]);
    showToast(`Duplicated condition profile "${cond.name}"`);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast(`Copied Condition ID "${id}" to clipboard`, 'info');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    const symptomsArray = formData.symptoms
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const foodsArray = formData.linkedFoods
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const exercisesArray = formData.linkedExercises
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const recsArray = formData.linkedRecommendations
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCondition: ManagedCondition = {
      id: `cond-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      category: formData.category,
      riskLevel: formData.riskLevel,
      symptoms: symptomsArray.length > 0 ? symptomsArray : ['General Symptoms'],
      linkedFoods: foodsArray.length > 0 ? foodsArray : ['Nutrient-dense Whole Foods'],
      linkedExercises: exercisesArray.length > 0 ? exercisesArray : ['Gentle Aerobic Walking'],
      linkedRecommendations: recsArray.length > 0 ? recsArray : ['Clinical Safeguard Guidelines'],
      linkedRecommendationsCount: recsArray.length > 0 ? recsArray.length : 1,
      linkedExercisesCount: exercisesArray.length > 0 ? exercisesArray.length : 1,
      status: formData.status,
      description: formData.description.trim(),
      clinicalNotes: formData.clinicalNotes.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setConditions((prev) => [newCondition, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Added clinical condition profile "${newCondition.name}"`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCondition || !formData.name.trim() || !formData.description.trim()) return;

    const symptomsArray = formData.symptoms
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const foodsArray = formData.linkedFoods
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const exercisesArray = formData.linkedExercises
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const recsArray = formData.linkedRecommendations
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated: ManagedCondition = {
      ...selectedCondition,
      name: formData.name.trim(),
      category: formData.category,
      riskLevel: formData.riskLevel,
      symptoms: symptomsArray,
      linkedFoods: foodsArray,
      linkedExercises: exercisesArray,
      linkedRecommendations: recsArray,
      linkedRecommendationsCount: recsArray.length > 0 ? recsArray.length : selectedCondition.linkedRecommendationsCount,
      linkedExercisesCount: exercisesArray.length > 0 ? exercisesArray.length : selectedCondition.linkedExercisesCount,
      status: formData.status,
      description: formData.description.trim(),
      clinicalNotes: formData.clinicalNotes.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setConditions((prev) => prev.map((item) => (item.id === selectedCondition.id ? updated : item)));
    setIsEditModalOpen(false);
    showToast(`Updated condition profile "${updated.name}"`);
  };

  const handleConfirmDelete = () => {
    if (!selectedCondition) return;
    setConditions((prev) => prev.filter((item) => item.id !== selectedCondition.id));
    setIsDeleteModalOpen(false);
    showToast(`Removed condition profile "${selectedCondition.name}"`, 'info');
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Condition Name',
      'Category',
      'Risk Level',
      'Status',
      'Symptoms',
      'Linked Foods',
      'Linked Exercises',
      'Linked Recommendations',
      'Description',
      'Clinical Notes',
      'Updated At'
    ];
    const rows = filteredConditions.map((c) => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.riskLevel,
      c.status,
      `"${(c.symptoms || []).join('; ')}"`,
      `"${(c.linkedFoods || []).join('; ')}"`,
      `"${(c.linkedExercises || []).join('; ')}"`,
      `"${(c.linkedRecommendations || []).join('; ')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${(c.clinicalNotes || '').replace(/"/g, '""')}"`,
      c.updatedAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `diseases_conditions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exported conditions catalog to CSV');
  };

  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case 'Cardiovascular':
      case 'Cardiovascular Rehab':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            <HeartPulse className="w-3 h-3 text-rose-500 shrink-0" />
            {category}
          </span>
        );
      case 'Endocrine & Metabolic':
      case 'Metabolic & Lifestyle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
            {category}
          </span>
        );
      case 'Musculoskeletal & Autoimmune':
      case 'Musculoskeletal & Spine':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
            <Dumbbell className="w-3 h-3 text-indigo-500 shrink-0" />
            {category}
          </span>
        );
      case 'Bone & Skeletal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
            <Layers className="w-3 h-3 text-sky-500 shrink-0" />
            {category}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
            <Stethoscope className="w-3 h-3 text-purple-500 shrink-0" />
            {category}
          </span>
        );
    }
  };

  const renderRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'High Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />
            High Risk
          </span>
        );
      case 'Moderate Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
            Moderate Risk
          </span>
        );
      case 'Low Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            Low Risk
          </span>
        );
    }
  };

  const renderStatusBadge = (status: ConditionStatus) => {
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

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in" id="admin-diseases-management-root">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-extrabold ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-rose-500/30'
                : 'bg-amber-900 text-white border-amber-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/30 shrink-0 shadow-2xs mt-0.5">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                System Administration
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">• Health Profiles Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Diseases & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Configure medical condition profiles, risk stratifications, clinical symptoms, and linked foods, exercises, and recommendations.
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
            id="export-conditions-csv-btn"
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="rounded-xl font-extrabold text-xs h-11 shadow-2xs"
            id="add-new-condition-btn"
          >
            Add New Condition
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="conditions-kpis-grid">
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">
                Total Disease Profiles
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.total}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Registered clinical entries</span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/40">
              <Stethoscope className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                Active In Engine
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.active}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">
                {Math.round((kpis.active / (kpis.total || 1)) * 100)}% active coverage
              </span>
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
                High-Risk Stratifications
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.highRisk}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Requires strict safeguards</span>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                Linked Protocols Total
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.totalLinkedProtocols}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Foods, exercises & recommendations</span>
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
                placeholder="Search by condition name, category, symptom, linked food or exercise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl text-xs sm:text-sm"
                id="conditions-search-input"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="condition-category-filter"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="condition-risk-filter"
              >
                {RISK_OPTIONS.map((risk) => (
                  <option key={risk} value={risk}>
                    Risk: {risk}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="condition-status-filter"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                Sort By:
              </span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 py-1 rounded-lg text-xs font-semibold w-auto border-slate-200 dark:border-slate-800"
                id="condition-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="risk-desc">Risk Level (High first)</option>
                <option value="most-linked">Most Linked Content</option>
              </Select>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing <strong className="text-slate-900 dark:text-white font-extrabold">{filteredConditions.length}</strong> of {conditions.length} condition profiles
            </span>
          </div>

          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
              <span className="text-3xs font-black uppercase text-slate-400 tracking-wider">Active Filters:</span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60">
                  Search: "{searchQuery}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-900" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                  Category: {selectedCategory}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900" onClick={() => setSelectedCategory('All')} />
                </span>
              )}

              {selectedRisk !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60">
                  Risk: {selectedRisk}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-amber-900" onClick={() => setSelectedRisk('All')} />
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
                id="reset-all-condition-filters-btn"
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
      ) : filteredConditions.length === 0 ? (
        <EmptyState
          title="No Conditions Found"
          description="No disease profiles match your active search or filter criteria. Try resetting filters or adding a new condition."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
          icon={<Stethoscope className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-black uppercase text-3xs tracking-wider">
                  <th className="py-4 px-5">Medical Condition</th>
                  <th className="py-4 px-4">Category & Risk</th>
                  <th className="py-4 px-4">Linked Foods</th>
                  <th className="py-4 px-4">Linked Exercises</th>
                  <th className="py-4 px-4">Linked Recs</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedConditions.map((cond) => (
                  <tr
                    key={cond.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenView(cond)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate max-w-[210px]">
                            {cond.name}
                          </span>
                          <span className="text-3xs text-slate-400 dark:text-slate-500 font-bold truncate max-w-[210px]">
                            {cond.symptoms && cond.symptoms.length > 0 ? cond.symptoms.join(' • ') : 'General Symptoms'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {renderCategoryBadge(cond.category)}
                        {renderRiskBadge(cond.riskLevel)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 max-w-[160px]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <Utensils className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {cond.linkedFoods ? cond.linkedFoods.length : 0} Linked Foods
                        </span>
                        {cond.linkedFoods && cond.linkedFoods.length > 0 && (
                          <span className="text-3xs text-slate-400 dark:text-slate-500 font-semibold truncate">
                            {cond.linkedFoods[0]}
                            {cond.linkedFoods.length > 1 ? ` +${cond.linkedFoods.length - 1} more` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 max-w-[160px]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          <Dumbbell className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {cond.linkedExercises ? cond.linkedExercises.length : cond.linkedExercisesCount} Linked Exercises
                        </span>
                        {cond.linkedExercises && cond.linkedExercises.length > 0 && (
                          <span className="text-3xs text-slate-400 dark:text-slate-500 font-semibold truncate">
                            {cond.linkedExercises[0]}
                            {cond.linkedExercises.length > 1 ? ` +${cond.linkedExercises.length - 1} more` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 max-w-[160px]">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {cond.linkedRecommendations ? cond.linkedRecommendations.length : cond.linkedRecommendationsCount} Linked Recs
                        </span>
                        {cond.linkedRecommendations && cond.linkedRecommendations.length > 0 && (
                          <span className="text-3xs text-slate-400 dark:text-slate-500 font-semibold truncate">
                            {cond.linkedRecommendations[0]}
                            {cond.linkedRecommendations.length > 1 ? ` +${cond.linkedRecommendations.length - 1} more` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">{renderStatusBadge(cond.status)}</td>

                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenView(cond)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          title="View Condition Specifications"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(cond)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                          title="Edit Condition Profile"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Copy className="w-3.5 h-3.5" />}
                          onClick={() => handleDuplicate(cond)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg"
                          title="Duplicate Profile"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDelete(cond)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          title="Delete Profile"
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
            {paginatedConditions.map((cond) => (
              <Card
                key={cond.id}
                className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl flex flex-col justify-between"
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 flex items-center justify-center font-extrabold text-sm shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                          {cond.name}
                        </h4>
                        <div className="mt-0.5">{renderCategoryBadge(cond.category)}</div>
                      </div>
                    </div>
                    {renderStatusBadge(cond.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                    {cond.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {renderRiskBadge(cond.riskLevel)}

                    <span className="inline-flex items-center gap-1 text-3xs font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50">
                      <Utensils className="w-3 h-3" />
                      {cond.linkedFoods ? cond.linkedFoods.length : 0} Foods
                    </span>

                    <span className="inline-flex items-center gap-1 text-3xs font-extrabold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200/50">
                      <Dumbbell className="w-3 h-3" />
                      {cond.linkedExercises ? cond.linkedExercises.length : cond.linkedExercisesCount} Exercises
                    </span>

                    <span className="inline-flex items-center gap-1 text-3xs font-extrabold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/50">
                      <Lightbulb className="w-3 h-3" />
                      {cond.linkedRecommendations ? cond.linkedRecommendations.length : cond.linkedRecommendationsCount} Recs
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                    <span className="text-3xs font-bold text-slate-400">Updated: {cond.updatedAt}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenView(cond)}
                        className="h-8 px-2.5 text-xs font-extrabold text-rose-600 dark:text-rose-400"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(cond)}
                        className="h-8 px-2.5 text-xs font-extrabold"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(cond)}
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
                          ? 'bg-rose-600 text-white shadow-2xs'
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

      {/* MODAL 1: VIEW CONDITION DETAILS */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Medical Condition Profile Specification"
        size="lg"
        id="modal-view-condition"
      >
        {selectedCondition && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-2xs">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                      {selectedCondition.name}
                    </h3>
                    <button
                      onClick={() => handleCopyId(selectedCondition.id)}
                      className="inline-flex items-center gap-1 text-3xs font-extrabold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                      title="Click to copy Condition ID"
                    >
                      <Copy className="w-3 h-3" />
                      {selectedCondition.id}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {renderCategoryBadge(selectedCondition.category)}
                    {renderRiskBadge(selectedCondition.riskLevel)}
                    {renderStatusBadge(selectedCondition.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                Condition Overview & Pathophysiology
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {selectedCondition.description}
              </p>
            </div>

            {selectedCondition.symptoms && selectedCondition.symptoms.length > 0 && (
              <div>
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-2">
                  Clinical Symptoms & Indicators
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCondition.symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCondition.clinicalNotes && (
              <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/30">
                <span className="text-3xs uppercase font-black text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Clinical Guidelines & Safeguards
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedCondition.clinicalNotes}
                </p>
              </div>
            )}

            {/* Linked Interventions Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Linked Foods */}
              <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/30 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-emerald-200/40 dark:border-emerald-900/40 pb-2">
                  <span className="text-3xs uppercase font-black text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" /> Linked Foods
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    {selectedCondition.linkedFoods ? selectedCondition.linkedFoods.length : 0}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  {selectedCondition.linkedFoods && selectedCondition.linkedFoods.length > 0 ? (
                    selectedCondition.linkedFoods.map((food, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {food}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No linked foods mapped</span>
                  )}
                </div>
              </div>

              {/* Linked Exercises */}
              <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/30 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-indigo-200/40 dark:border-indigo-900/40 pb-2">
                  <span className="text-3xs uppercase font-black text-indigo-700 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-indigo-600" /> Linked Exercises
                  </span>
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                    {selectedCondition.linkedExercises ? selectedCondition.linkedExercises.length : selectedCondition.linkedExercisesCount}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  {selectedCondition.linkedExercises && selectedCondition.linkedExercises.length > 0 ? (
                    selectedCondition.linkedExercises.map((ex, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        {ex}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No linked exercises mapped</span>
                  )}
                </div>
              </div>

              {/* Linked Recommendations */}
              <div className="p-4 bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-amber-200/40 dark:border-amber-900/40 pb-2">
                  <span className="text-3xs uppercase font-black text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Linked Recs
                  </span>
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                    {selectedCondition.linkedRecommendations ? selectedCondition.linkedRecommendations.length : selectedCondition.linkedRecommendationsCount}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  {selectedCondition.linkedRecommendations && selectedCondition.linkedRecommendations.length > 0 ? (
                    selectedCondition.linkedRecommendations.map((rec, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        {rec}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No linked recommendations mapped</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedCondition);
                }}
                icon={<Edit3 className="w-4 h-4" />}
                className="rounded-xl font-extrabold text-xs h-10"
              >
                Edit Condition Profile
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-xl font-extrabold text-xs h-10"
              >
                Close Specification
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: ADD CONDITION */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Medical Condition Profile"
        size="lg"
        id="modal-add-condition"
      >
        <form onSubmit={handleSaveAdd} className="flex flex-col gap-5 text-left">
          <div className="flex items-center gap-3 bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
            <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
              Register new health condition parameters to drive targeted nutrition, exercise safeguards, and recommendation filters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Condition Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Essential Primary Hypertension"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
                id="add-condition-name-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-category-select"
              >
                {CATEGORY_OPTIONS.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Risk Stratification</label>
              <Select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-risk-select"
              >
                <option value="High Risk">High Risk</option>
                <option value="Moderate Risk">Moderate Risk</option>
                <option value="Low Risk">Low Risk</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Symptoms (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. Elevated BP, Dizziness, Morning Fatigue"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-symptoms-input"
              />
            </div>

            {/* Linked Interventions Inputs */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" /> Linked Foods & Nutrition (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. Potassium-rich Greens, Unsalted Almonds, Citrus Fruits"
                value={formData.linkedFoods}
                onChange={(e) => setFormData({ ...formData, linkedFoods: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-linked-foods-input"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-indigo-600" /> Linked Exercises & Movement (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. Brisk Aerobic Walking, Stationary Cycling, Light Resistance Bands"
                value={formData.linkedExercises}
                onChange={(e) => setFormData({ ...formData, linkedExercises: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-linked-exercises-input"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Linked Clinical Recommendations (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. DASH Sodium Protocol, Resting BP Log, Citrus Seasoning Swap"
                value={formData.linkedRecommendations}
                onChange={(e) => setFormData({ ...formData, linkedRecommendations: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-linked-recs-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Engine Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ConditionStatus })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="add-condition-status-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Pathophysiology & Overview <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={3}
                required
                placeholder="Provide a clinical description of the medical condition..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl text-xs sm:text-sm font-medium"
                id="add-condition-description-input"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Clinical Guidelines & Safeguards
              </label>
              <Textarea
                rows={2}
                placeholder="Key clinical cautions or contraindications..."
                value={formData.clinicalNotes}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                className="rounded-xl text-xs font-medium"
                id="add-condition-notes-input"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl font-extrabold text-xs h-11"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={<Check className="w-4 h-4" />}
              className="rounded-xl font-extrabold text-xs h-11 shadow-2xs"
              id="save-add-condition-btn"
            >
              Save Condition Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EDIT CONDITION */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Medical Condition Profile"
        size="lg"
        id="modal-edit-condition"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Condition Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
                id="edit-condition-name-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-category-select"
              >
                {CATEGORY_OPTIONS.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Risk Stratification</label>
              <Select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as RiskLevel })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-risk-select"
              >
                <option value="High Risk">High Risk</option>
                <option value="Moderate Risk">Moderate Risk</option>
                <option value="Low Risk">Low Risk</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Symptoms (Comma Separated)
              </label>
              <Input
                type="text"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-symptoms-input"
              />
            </div>

            {/* Linked Interventions Inputs */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" /> Linked Foods & Nutrition (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. Potassium Greens, Unsalted Almonds, Citrus Fruits"
                value={formData.linkedFoods}
                onChange={(e) => setFormData({ ...formData, linkedFoods: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-linked-foods-input"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-indigo-600" /> Linked Exercises & Movement (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. Brisk Aerobic Walking, Stationary Cycling"
                value={formData.linkedExercises}
                onChange={(e) => setFormData({ ...formData, linkedExercises: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-linked-exercises-input"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Linked Clinical Recommendations (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. DASH Sodium Protocol, Resting BP Log"
                value={formData.linkedRecommendations}
                onChange={(e) => setFormData({ ...formData, linkedRecommendations: e.target.value })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-linked-recs-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Engine Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ConditionStatus })}
                className="h-11 rounded-xl text-xs font-semibold"
                id="edit-condition-status-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Pathophysiology & Overview <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl text-xs sm:text-sm font-medium"
                id="edit-condition-description-input"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Clinical Guidelines & Safeguards
              </label>
              <Textarea
                rows={2}
                value={formData.clinicalNotes}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                className="rounded-xl text-xs font-medium"
                id="edit-condition-notes-input"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl font-extrabold text-xs h-11"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={<Check className="w-4 h-4" />}
              className="rounded-xl font-extrabold text-xs h-11 shadow-2xs"
              id="save-edit-condition-btn"
            >
              Update Condition Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Condition Profile Removal"
        size="md"
        id="modal-delete-condition"
      >
        {selectedCondition && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-extrabold text-rose-900 dark:text-rose-200">
                  Are you sure you want to delete "{selectedCondition.name}"?
                </span>
                <span className="text-rose-700/80 dark:text-rose-300 font-medium">
                  Removing this medical condition profile will unmap its associated safety filters and linked protocols from the clinical engine.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="block text-3xs font-black uppercase text-slate-400 mb-1">Target Profile ID</span>
              {selectedCondition.id} • {selectedCondition.category} ({selectedCondition.riskLevel})
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl font-extrabold text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDelete}
                icon={<Trash2 className="w-4 h-4" />}
                className="rounded-xl font-extrabold text-xs h-10 shadow-2xs"
                id="confirm-delete-condition-btn"
              >
                Delete Condition
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
