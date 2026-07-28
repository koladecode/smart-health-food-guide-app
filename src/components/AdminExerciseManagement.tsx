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
  Dumbbell,
  Activity,
  HeartPulse,
  Flame,
  Clock,
  Layers,
  Check,
  X,
  ShieldCheck,
  Target,
  AlertTriangle,
  Zap,
  Tag,
  FileText,
  SlidersHorizontal,
  Stethoscope
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent } from './Card';
import Modal from './Modal';
import { Input, Select, Textarea } from './Input';
import EmptyState from './EmptyState';
import { Skeleton } from './Skeleton';

export type ExerciseStatus = 'Active' | 'Inactive';
export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ManagedExercise {
  id: string;
  name: string;
  category: string;
  difficulty: ExerciseDifficulty;
  duration: string;
  targetBodyArea: string;
  healthGoal: string;
  compatibleConditions: string[];
  status: ExerciseStatus;
  caloriesBurned?: number;
  equipmentNeeded?: string;
  description?: string;
  instructions?: string;
  createdAt: string;
}

const STORAGE_KEY = 'smart_health_guide_managed_exercises';

const INITIAL_EXERCISES: ManagedExercise[] = [
  {
    id: 'ex-101',
    name: 'Low-Impact Brisk Walking',
    category: 'Cardio',
    difficulty: 'Beginner',
    duration: '30 mins',
    targetBodyArea: 'Cardiovascular System',
    healthGoal: 'Heart Health',
    compatibleConditions: ['Hypertension Safe', 'Heart Healthy', 'Diabetes Friendly', 'Low Back Pain Safe', 'Arthritis Gentle'],
    status: 'Active',
    caloriesBurned: 140,
    equipmentNeeded: 'Comfortable Shoes',
    description: 'Gentle, continuous aerobic walking designed to support systemic blood flow, arterial elasticity, and cardiovascular stamina without joint strain.',
    instructions: 'Maintain an upright posture, engage your core lightly, and swing arms rhythmically. Keep a conversational pace.',
    createdAt: '2026-01-10'
  },
  {
    id: 'ex-102',
    name: 'Chair Aerobics & Gentle Mobility',
    category: 'Rehab & Recovery',
    difficulty: 'Beginner',
    duration: '15 mins',
    targetBodyArea: 'Full Body',
    healthGoal: 'Mobility & Joint Health',
    compatibleConditions: ['Hypertension Safe', 'Arthritis Gentle', 'Post-Op Approved', 'Cardiac Rehab Safe'],
    status: 'Active',
    caloriesBurned: 75,
    equipmentNeeded: 'Sturdy Armless Chair',
    description: 'Seated upper and lower body movements that safely lubricate major joints, stimulate circulation, and increase daily mobility.',
    instructions: 'Sit erect near the front edge of a firm chair. Execute controlled shoulder rolls, seated marching, and gentle arm reaches.',
    createdAt: '2026-01-15'
  },
  {
    id: 'ex-103',
    name: 'Bodyweight Squats & Wall Pushes',
    category: 'Strength Training',
    difficulty: 'Intermediate',
    duration: '20 mins',
    targetBodyArea: 'Lower Body',
    healthGoal: 'Muscle Strength',
    compatibleConditions: ['Diabetes Friendly', 'Osteoporosis Safe'],
    status: 'Active',
    caloriesBurned: 120,
    equipmentNeeded: 'None (Bodyweight)',
    description: 'Functional multi-joint resistance movements strengthening the quadriceps, gluteal complex, and postural spinal stabilizers.',
    instructions: 'Keep feet hip-width apart, lower hips as if sitting back into a chair while driving knees outward inline with toes.',
    createdAt: '2026-02-01'
  },
  {
    id: 'ex-104',
    name: 'Spine & Hip Restorative Yoga Stretch',
    category: 'Flexibility & Mobility',
    difficulty: 'Beginner',
    duration: '20 mins',
    targetBodyArea: 'Joints & Back',
    healthGoal: 'Mobility & Joint Health',
    compatibleConditions: ['Low Back Pain Safe', 'Arthritis Gentle', 'Hypertension Safe'],
    status: 'Active',
    caloriesBurned: 90,
    equipmentNeeded: 'Yoga Mat',
    description: 'Decompressing spinal flexions and cat-cow flows aimed at relieving lumbar tension, lengthening tight hamstrings, and calming stress.',
    instructions: 'Flow breath with movement. Inhale on gentle spinal extension, exhale on abdominal contraction and back rounding.',
    createdAt: '2026-02-14'
  },
  {
    id: 'ex-105',
    name: 'Recumbent Stationary Cycling',
    category: 'Cardio',
    difficulty: 'Beginner',
    duration: '25 mins',
    targetBodyArea: 'Lower Body',
    healthGoal: 'Heart Health',
    compatibleConditions: ['Cardiac Rehab Safe', 'Hypertension Safe', 'Low Back Pain Safe'],
    status: 'Active',
    caloriesBurned: 160,
    equipmentNeeded: 'Recumbent Bike',
    description: 'Reclined low-impact cycling offering full lumbar back support, preserving hip and knee cartilage during aerobic training.',
    instructions: 'Adjust seat distance so knee retains a slight 10-degree flex at full pedal extension. Maintain steady cadences.',
    createdAt: '2026-03-02'
  },
  {
    id: 'ex-106',
    name: 'Resistance Band Scapular Row',
    category: 'Strength Training',
    difficulty: 'Intermediate',
    duration: '15 mins',
    targetBodyArea: 'Upper Body',
    healthGoal: 'Muscle Strength',
    compatibleConditions: ['Post-Op Approved', 'Osteoporosis Safe'],
    status: 'Active',
    caloriesBurned: 95,
    equipmentNeeded: 'Loop Resistance Band',
    description: 'Targeted scapular retraction exercise strengthening rhomboids and upper back musculature for postural correction.',
    instructions: 'Anchor band securely at chest height. Pull handles back toward ribcage, squeezing shoulder blades tightly together.',
    createdAt: '2026-03-18'
  },
  {
    id: 'ex-107',
    name: 'Single-Leg Balance & Proprioception',
    category: 'Balance & Stability',
    difficulty: 'Intermediate',
    duration: '15 mins',
    targetBodyArea: 'Lower Body',
    healthGoal: 'Mobility & Joint Health',
    compatibleConditions: ['Osteoporosis Safe', 'Arthritis Gentle', 'Obesity Friendly'],
    status: 'Active',
    caloriesBurned: 60,
    equipmentNeeded: 'None (Wall Support)',
    description: 'Proprioceptive balance routines strengthening ankle stabilizer tendons, deep core stabilizers, and fall prevention pathways.',
    instructions: 'Stand near a wall for safety. Lift one foot 2 inches off the ground, holding steady for 30 seconds per leg.',
    createdAt: '2026-03-25'
  },
  {
    id: 'ex-108',
    name: 'Hydrotherapeutic Water Aerobics',
    category: 'Low Impact',
    difficulty: 'Beginner',
    duration: '45 mins',
    targetBodyArea: 'Full Body',
    healthGoal: 'General Fitness',
    compatibleConditions: ['Arthritis Gentle', 'Low Back Pain Safe', 'Post-Op Approved', 'Obesity Friendly'],
    status: 'Active',
    caloriesBurned: 220,
    equipmentNeeded: 'Pool Access',
    description: 'Water buoyancy cushions up to 90% of body weight, providing gentle hydraulic resistance for painless multi-joint conditioning.',
    instructions: 'Perform underwater jogging, arm sweeps, and lateral leg lifts in waist to chest-deep water.',
    createdAt: '2026-04-05'
  },
  {
    id: 'ex-109',
    name: 'Metabolic Treadmill Interval Walk',
    category: 'HIIT',
    difficulty: 'Advanced',
    duration: '25 mins',
    targetBodyArea: 'Full Body',
    healthGoal: 'Weight Loss',
    compatibleConditions: ['Diabetes Friendly', 'Heart Healthy'],
    status: 'Active',
    caloriesBurned: 210,
    equipmentNeeded: 'Treadmill',
    description: 'Alternating high-incline walking intervals with flat recovery periods to accelerate calorie expenditure and insulin sensitivity.',
    instructions: 'Warm up for 5 mins. Alternate 2 mins at 6% incline with 1 min flat walk. Cool down for 5 mins.',
    createdAt: '2026-04-12'
  },
  {
    id: 'ex-110',
    name: 'Clinical Core & Pelvic Floor Pilates',
    category: 'Flexibility & Mobility',
    difficulty: 'Intermediate',
    duration: '20 mins',
    targetBodyArea: 'Core & Abs',
    healthGoal: 'General Fitness',
    compatibleConditions: ['Low Back Pain Safe', 'Post-Op Approved'],
    status: 'Inactive',
    caloriesBurned: 110,
    equipmentNeeded: 'Yoga Mat',
    description: 'Controlled deep core isometric squeezes, pelvic tilts, and bridge lifts stabilizing the lumbar pelvic region.',
    instructions: 'Lie on back with knees bent. Contract transverse abdominis while exhaling slowly, lifting pelvis into line.',
    createdAt: '2026-04-20'
  }
];

export const CATEGORY_OPTIONS = [
  'All',
  'Cardio',
  'Strength Training',
  'Flexibility & Mobility',
  'Low Impact',
  'Balance & Stability',
  'HIIT',
  'Rehab & Recovery'
];

export const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const GOAL_OPTIONS = [
  'All',
  'Weight Loss',
  'Heart Health',
  'Muscle Strength',
  'Mobility & Joint Health',
  'General Fitness'
];

export const STATUS_OPTIONS = ['All', 'Active', 'Inactive'];

export const CONDITION_TAGS_PRESETS = [
  'Hypertension Safe',
  'Diabetes Friendly',
  'Heart Healthy',
  'Low Back Pain Safe',
  'Arthritis Gentle',
  'Post-Op Approved',
  'Cardiac Rehab Safe',
  'Osteoporosis Safe',
  'Obesity Friendly'
];

export default function AdminExerciseManagement() {
  const [exercises, setExercises] = useState<ManagedExercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            ...item,
            compatibleConditions: Array.isArray(item.compatibleConditions) ? item.compatibleConditions : ['General Fitness Safe']
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse managed exercises from storage', e);
    }
    return INITIAL_EXERCISES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'duration' | 'calories'>('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedExercise, setSelectedExercise] = useState<ManagedExercise | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [customTagInput, setCustomTagInput] = useState('');

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    difficulty: ExerciseDifficulty;
    duration: string;
    targetBodyArea: string;
    healthGoal: string;
    compatibleConditions: string[];
    status: ExerciseStatus;
    caloriesBurned: string;
    equipmentNeeded: string;
    description: string;
    instructions: string;
  }>({
    name: '',
    category: 'Cardio',
    difficulty: 'Beginner',
    duration: '30 mins',
    targetBodyArea: 'Full Body',
    healthGoal: 'Heart Health',
    compatibleConditions: ['Hypertension Safe', 'Heart Healthy'],
    status: 'Active',
    caloriesBurned: '150',
    equipmentNeeded: 'None (Bodyweight)',
    description: '',
    instructions: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    } catch (e) {
      console.error('Failed to persist managed exercises', e);
    }
  }, [exercises]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const kpis = useMemo(() => {
    const total = exercises.length;
    const active = exercises.filter((e) => e.status === 'Active').length;
    const inactive = exercises.filter((e) => e.status === 'Inactive').length;
    const categoriesCount = new Set(exercises.map((e) => e.category)).size;
    const goalsCount = new Set(exercises.map((e) => e.healthGoal)).size;

    return { total, active, inactive, categoriesCount, goalsCount };
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises
      .filter((ex) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          ex.name.toLowerCase().includes(q) ||
          ex.targetBodyArea.toLowerCase().includes(q) ||
          ex.healthGoal.toLowerCase().includes(q) ||
          ex.category.toLowerCase().includes(q) ||
          (ex.description && ex.description.toLowerCase().includes(q)) ||
          (ex.equipmentNeeded && ex.equipmentNeeded.toLowerCase().includes(q)) ||
          ex.compatibleConditions.some((c) => c.toLowerCase().includes(q));

        const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;
        const matchesGoal = selectedGoal === 'All' || ex.healthGoal === selectedGoal;
        const matchesStatus = selectedStatus === 'All' || ex.status === selectedStatus;

        return matchesQuery && matchesCategory && matchesDifficulty && matchesGoal && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
        if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'duration') {
          const numA = parseInt(a.duration, 10) || 0;
          const numB = parseInt(b.duration, 10) || 0;
          return numB - numA;
        }
        if (sortBy === 'calories') {
          const calA = a.caloriesBurned || 0;
          const calB = b.caloriesBurned || 0;
          return calB - calA;
        }
        return 0;
      });
  }, [exercises, searchQuery, selectedCategory, selectedDifficulty, selectedGoal, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage) || 1;
  const paginatedExercises = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExercises.slice(start, start + itemsPerPage);
  }, [filteredExercises, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedGoal, selectedStatus, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategory !== 'All' ||
      selectedDifficulty !== 'All' ||
      selectedGoal !== 'All' ||
      selectedStatus !== 'All' ||
      sortBy !== 'newest'
    );
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedGoal, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedGoal('All');
    setSelectedStatus('All');
    setSortBy('newest');
    showToast('Filters reset to defaults', 'info');
  };

  const handleOpenView = (exercise: ManagedExercise) => {
    setSelectedExercise(exercise);
    setIsViewModalOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Cardio',
      difficulty: 'Beginner',
      duration: '30 mins',
      targetBodyArea: 'Full Body',
      healthGoal: 'Heart Health',
      compatibleConditions: ['Hypertension Safe', 'Heart Healthy'],
      status: 'Active',
      caloriesBurned: '150',
      equipmentNeeded: 'None (Bodyweight)',
      description: '',
      instructions: ''
    });
    setCustomTagInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exercise: ManagedExercise) => {
    setSelectedExercise(exercise);
    setFormData({
      name: exercise.name,
      category: exercise.category,
      difficulty: exercise.difficulty,
      duration: exercise.duration,
      targetBodyArea: exercise.targetBodyArea,
      healthGoal: exercise.healthGoal,
      compatibleConditions: [...exercise.compatibleConditions],
      status: exercise.status,
      caloriesBurned: exercise.caloriesBurned ? exercise.caloriesBurned.toString() : '150',
      equipmentNeeded: exercise.equipmentNeeded || 'None (Bodyweight)',
      description: exercise.description || '',
      instructions: exercise.instructions || ''
    });
    setCustomTagInput('');
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (exercise: ManagedExercise) => {
    setSelectedExercise(exercise);
    setIsDeleteModalOpen(true);
  };

  const handleDuplicate = (exercise: ManagedExercise) => {
    const duplicated: ManagedExercise = {
      ...exercise,
      id: `ex-${Date.now().toString().slice(-4)}`,
      name: `${exercise.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setExercises((prev) => [duplicated, ...prev]);
    showToast(`Duplicated exercise routine "${exercise.name}"`);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast(`Copied Protocol ID "${id}" to clipboard`, 'info');
  };

  const handleToggleConditionTag = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.compatibleConditions.includes(tag);
      return {
        ...prev,
        compatibleConditions: exists
          ? prev.compatibleConditions.filter((t) => t !== tag)
          : [...prev.compatibleConditions, tag]
      };
    });
  };

  const handleAddCustomConditionTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const tag = customTagInput.trim();
    if (!tag) return;

    if (!formData.compatibleConditions.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        compatibleConditions: [...prev.compatibleConditions, tag]
      }));
    }
    setCustomTagInput('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newExercise: ManagedExercise = {
      id: `ex-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      duration: formData.duration.trim() || '20 mins',
      targetBodyArea: formData.targetBodyArea.trim() || 'Full Body',
      healthGoal: formData.healthGoal,
      compatibleConditions: formData.compatibleConditions.length > 0 ? formData.compatibleConditions : ['General Fitness Safe'],
      status: formData.status,
      caloriesBurned: parseInt(formData.caloriesBurned, 10) || 120,
      equipmentNeeded: formData.equipmentNeeded.trim() || 'None',
      description: formData.description.trim(),
      instructions: formData.instructions.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setExercises((prev) => [newExercise, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Added exercise "${newExercise.name}" to protocol catalog`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !formData.name.trim()) return;

    const updated: ManagedExercise = {
      ...selectedExercise,
      name: formData.name.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      duration: formData.duration.trim() || '20 mins',
      targetBodyArea: formData.targetBodyArea.trim() || 'Full Body',
      healthGoal: formData.healthGoal,
      compatibleConditions: formData.compatibleConditions,
      status: formData.status,
      caloriesBurned: parseInt(formData.caloriesBurned, 10) || 120,
      equipmentNeeded: formData.equipmentNeeded.trim() || 'None',
      description: formData.description.trim(),
      instructions: formData.instructions.trim()
    };

    setExercises((prev) => prev.map((item) => (item.id === selectedExercise.id ? updated : item)));
    setIsEditModalOpen(false);
    showToast(`Updated exercise entry "${updated.name}"`);
  };

  const handleConfirmDelete = () => {
    if (!selectedExercise) return;
    setExercises((prev) => prev.filter((item) => item.id !== selectedExercise.id));
    setIsDeleteModalOpen(false);
    showToast(`Removed "${selectedExercise.name}" from protocol catalog`, 'info');
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Category',
      'Difficulty',
      'Duration',
      'Target Area',
      'Goal',
      'Calories Burned',
      'Equipment',
      'Conditions',
      'Status',
      'Created At'
    ];
    const rows = exercises.map((e) => [
      e.id,
      `"${e.name.replace(/"/g, '""')}"`,
      e.category,
      e.difficulty,
      e.duration,
      `"${e.targetBodyArea}"`,
      `"${e.healthGoal}"`,
      e.caloriesBurned || 0,
      `"${e.equipmentNeeded || 'None'}"`,
      `"${e.compatibleConditions.join('; ')}"`,
      e.status,
      e.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `exercise_protocols_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported exercise protocols catalog to CSV');
  };

  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case 'Cardio':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            <HeartPulse className="w-3 h-3 text-rose-500 shrink-0" />
            Cardio
          </span>
        );
      case 'Strength Training':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
            <Dumbbell className="w-3 h-3 text-indigo-500 shrink-0" />
            Strength Training
          </span>
        );
      case 'Flexibility & Mobility':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50">
            <Activity className="w-3 h-3 text-teal-500 shrink-0" />
            Flexibility & Mobility
          </span>
        );
      case 'Low Impact':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/50">
            <Zap className="w-3 h-3 text-sky-500 shrink-0" />
            Low Impact
          </span>
        );
      case 'Balance & Stability':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
            <Target className="w-3 h-3 text-emerald-500 shrink-0" />
            Balance & Stability
          </span>
        );
      case 'HIIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <Flame className="w-3 h-3 text-amber-500 shrink-0" />
            HIIT
          </span>
        );
      case 'Rehab & Recovery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
            <ShieldCheck className="w-3 h-3 text-purple-500 shrink-0" />
            Rehab & Recovery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Layers className="w-3 h-3 text-slate-500 shrink-0" />
            {category}
          </span>
        );
    }
  };

  const renderDifficultyBadge = (difficulty: ExerciseDifficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Beginner
          </span>
        );
      case 'Intermediate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Intermediate
          </span>
        );
      case 'Advanced':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Advanced
          </span>
        );
    }
  };

  const renderStatusBadge = (status: ExerciseStatus) => {
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
    <div className="flex flex-col gap-8 text-left animate-fade-in" id="admin-exercise-management-root">
      {/* Toast Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-extrabold ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-indigo-500/30'
                : 'bg-amber-900 text-white border-amber-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Header Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/30 shrink-0 shadow-2xs mt-0.5">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                System Administration
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">• Exercise Protocols</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              Exercise Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Configure exercise routines, physical intensity classifications, and clinical conditions compatibility.
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
            id="export-exercise-csv-btn"
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="rounded-xl font-extrabold text-xs h-11 shadow-2xs"
            id="add-new-exercise-btn"
          >
            Add New Exercise
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="exercise-kpis-grid">
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">
                Total Exercises
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.total}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Registered workout catalog</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
              <Dumbbell className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Protocols
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
              <span className="text-3xs uppercase font-black tracking-wider text-purple-600 dark:text-purple-400">
                Category Domains
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.categoriesCount}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Fitness categories</span>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-900/40">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-3xs uppercase font-black tracking-wider text-teal-600 dark:text-teal-400">
                Target Health Goals
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.goalsCount}</span>
              <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">Health goal alignment</span>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-100 dark:border-teal-900/40">
              <Target className="w-6 h-6" />
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
                placeholder="Search by exercise name, target area, goal, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-11 rounded-xl text-xs sm:text-sm"
                id="exercise-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="exercise-category-filter"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="exercise-difficulty-filter"
              >
                {DIFFICULTY_OPTIONS.map((diff) => (
                  <option key={diff} value={diff}>
                    Difficulty: {diff}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="exercise-goal-filter"
              >
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal} value={goal}>
                    Goal: {goal}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold"
                id="exercise-status-filter"
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
                id="exercise-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="duration">Longest Duration</option>
                <option value="calories">Highest Calories</option>
              </Select>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Showing <strong className="text-slate-900 dark:text-white font-extrabold">{filteredExercises.length}</strong> of {exercises.length} protocols
            </span>
          </div>

          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
              <span className="text-3xs font-black uppercase text-slate-400 tracking-wider">Active Filters:</span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                  Search: "{searchQuery}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900" onClick={() => setSearchQuery('')} />
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60">
                  Category: {selectedCategory}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-purple-900" onClick={() => setSelectedCategory('All')} />
                </span>
              )}

              {selectedDifficulty !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60">
                  Difficulty: {selectedDifficulty}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-amber-900" onClick={() => setSelectedDifficulty('All')} />
                </span>
              )}

              {selectedGoal !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60">
                  Goal: {selectedGoal}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-teal-900" onClick={() => setSelectedGoal('All')} />
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
                id="reset-all-exercise-filters-btn"
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
      ) : filteredExercises.length === 0 ? (
        <EmptyState
          title="No Exercise Protocols Found"
          description="No routines match your active search or filter criteria. Try resetting filters or creating a new protocol."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
          icon={<Dumbbell className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-black uppercase text-3xs tracking-wider">
                  <th className="py-4 px-5">Exercise Routine</th>
                  <th className="py-4 px-4">Category & Difficulty</th>
                  <th className="py-4 px-4">Duration & Cal</th>
                  <th className="py-4 px-4">Target Area & Goal</th>
                  <th className="py-4 px-4">Compatible Conditions</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedExercises.map((ex) => (
                  <tr
                    key={ex.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenView(ex)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[210px]">
                            {ex.name}
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyId(ex.id);
                            }}
                            className="text-3xs text-slate-400 dark:text-slate-500 font-bold hover:text-indigo-600 transition-colors truncate max-w-[210px] cursor-pointer"
                            title="Click to copy ID"
                          >
                            ID: {ex.id} • Req: {ex.equipmentNeeded || 'None'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {renderCategoryBadge(ex.category)}
                        {renderDifficultyBadge(ex.difficulty)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {ex.duration}
                        </span>
                        <span className="text-3xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 shrink-0" />
                          ~{ex.caloriesBurned || 120} kcal
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[150px]">
                          {ex.targetBodyArea}
                        </span>
                        <span className="text-3xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">
                          {ex.healthGoal}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {ex.compatibleConditions.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50"
                          >
                            <HeartPulse className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            {tag}
                          </span>
                        ))}
                        {ex.compatibleConditions.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-md text-3xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            +{ex.compatibleConditions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">{renderStatusBadge(ex.status)}</td>

                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenView(ex)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg"
                          title="View Protocol Specifications"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(ex)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                          title="Edit Exercise Protocol"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Copy className="w-3.5 h-3.5" />}
                          onClick={() => handleDuplicate(ex)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg"
                          title="Duplicate Protocol"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDelete(ex)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          title="Delete Exercise Protocol"
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
            {paginatedExercises.map((ex) => (
              <Card
                key={ex.id}
                className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl flex flex-col justify-between"
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 flex items-center justify-center font-extrabold text-sm shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                          {ex.name}
                        </h4>
                        <span className="text-3xs text-slate-400 dark:text-slate-500 font-bold">
                          {ex.targetBodyArea} • {ex.healthGoal}
                        </span>
                      </div>
                    </div>
                    {renderStatusBadge(ex.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {renderCategoryBadge(ex.category)}
                    {renderDifficultyBadge(ex.difficulty)}
                    <span className="text-3xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" /> {ex.duration}
                    </span>
                    <span className="text-3xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                      <Flame className="w-3 h-3" /> ~{ex.caloriesBurned || 120} kcal
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {ex.compatibleConditions.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-3xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50"
                      >
                        <HeartPulse className="w-2.5 h-2.5 text-emerald-600" />
                        {tag}
                      </span>
                    ))}
                    {ex.compatibleConditions.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-3xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        +{ex.compatibleConditions.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                    <span className="text-3xs font-bold text-slate-400">Created: {ex.createdAt}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenView(ex)}
                        className="h-8 px-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(ex)}
                        className="h-8 px-2 text-xs font-extrabold"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(ex)}
                        className="h-8 px-2 text-xs font-extrabold text-slate-600"
                      >
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDelete(ex)}
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
                          ? 'bg-indigo-600 text-white shadow-2xs'
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

      {/* MODAL 1: VIEW EXERCISE DETAILS */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Exercise Protocol Specifications"
        size="lg"
        id="modal-view-exercise"
      >
        {selectedExercise && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-2xs">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{selectedExercise.name}</h3>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  {selectedExercise.category} • {selectedExercise.targetBodyArea}
                </span>
                <div className="flex items-center gap-2 mt-2.5">
                  {renderCategoryBadge(selectedExercise.category)}
                  {renderDifficultyBadge(selectedExercise.difficulty)}
                  {renderStatusBadge(selectedExercise.status)}
                </div>
              </div>
            </div>

            {selectedExercise.description && (
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                  Clinical Overview & Objectives
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedExercise.description}
                </p>
              </div>
            )}

            {selectedExercise.instructions && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40">
                <span className="text-3xs uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-wider block mb-1">
                  Movement Execution Guidance
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedExercise.instructions}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Duration</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> {selectedExercise.duration}
                </span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Est. Calories Burned</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-amber-500/20" /> ~{selectedExercise.caloriesBurned || 120} kcal
                </span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Equipment Needed</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{selectedExercise.equipmentNeeded || 'None'}</span>
              </div>
            </div>

            <div>
              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-2.5">
                Clinical & Medical Condition Compatibility
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.compatibleConditions.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {tag}
                  </span>
                ))}
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
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedExercise);
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

      {/* MODAL 2: ADD / EDIT EXERCISE */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create New Exercise Protocol' : 'Edit Exercise Protocol'}
        size="lg"
        id="modal-add-edit-exercise"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Exercise Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Low-Impact Brisk Walking"
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {CATEGORY_OPTIONS.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as ExerciseDifficulty })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Beginner">Beginner (Gentle / Low Intensity)</option>
                <option value="Intermediate">Intermediate (Moderate Resistance)</option>
                <option value="Advanced">Advanced (High Intensity / Metabolic)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Body Area
              </label>
              <Input
                type="text"
                value={formData.targetBodyArea}
                onChange={(e) => setFormData({ ...formData, targetBodyArea: e.target.value })}
                placeholder="e.g. Full Body, Lower Body, Core & Abs"
                className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              />
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
                Duration
              </label>
              <Input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30 mins"
                className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Calories Burned (Est.)
              </label>
              <Input
                type="text"
                value={formData.caloriesBurned}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                placeholder="150"
                className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Availability Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ExerciseStatus })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Equipment Needed
            </label>
            <Input
              type="text"
              value={formData.equipmentNeeded}
              onChange={(e) => setFormData({ ...formData, equipmentNeeded: e.target.value })}
              placeholder="e.g. None (Bodyweight), Resistance Band, Dumbbells"
              className="h-11 rounded-xl text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Clinical & Medical Condition Compatibility
            </label>
            <div className="flex flex-col gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-wrap gap-2">
                {CONDITION_TAGS_PRESETS.map((tag) => {
                  const isSelected = formData.compatibleConditions.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleConditionTag(tag)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Adding Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <Input
                  type="text"
                  placeholder="Type custom condition tag..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomConditionTag}
                  className="h-9 rounded-xl text-xs font-medium"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomConditionTag}
                  className="h-9 rounded-xl font-extrabold text-xs shrink-0"
                >
                  Add Tag
                </Button>
              </div>

              {/* Selected non-preset tags display */}
              {formData.compatibleConditions.some((t) => !CONDITION_TAGS_PRESETS.includes(t)) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Custom Tags:</span>
                  {formData.compatibleConditions
                    .filter((t) => !CONDITION_TAGS_PRESETS.includes(t))
                    .map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60"
                      >
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-emerald-900"
                          onClick={() => handleToggleConditionTag(tag)}
                        />
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Clinical Summary
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of physiological targets, movement benefits, or safety notes..."
              className="rounded-xl text-xs sm:text-sm font-medium p-3"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Execution Instructions (Optional)
            </label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Step-by-step cueing instructions or breath pacing..."
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
              {isAddModalOpen ? 'Create Protocol' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: DELETE EXERCISE CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Protocol Deletion"
        size="md"
        id="modal-delete-exercise"
      >
        {selectedExercise && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                  Confirm Exercise Protocol Removal
                </span>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  Are you sure you want to delete <strong className="font-black text-rose-950 dark:text-rose-100">"{selectedExercise.name}"</strong>? This will remove the routine from active patient recommendation engines.
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
                Delete Routine
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
