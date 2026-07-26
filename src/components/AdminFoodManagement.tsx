import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
  Download,
  Sparkles,
  UtensilsCrossed,
  Globe,
  HeartPulse,
  Tag,
  Flame,
  X,
  Layers,
  Check,
  ShieldCheck
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import Modal from './Modal';
import { Input, Select, Textarea } from './Input';
import Alert from './Alert';
import EmptyState from './EmptyState';
import { Skeleton } from './Skeleton';

export type FoodStatus = 'Active' | 'Inactive';

export interface ManagedFood {
  id: string;
  name: string;
  category: string;
  mealType: string;
  dietType: string;
  country: string;
  medicalCompatibility: string[];
  status: FoodStatus;
  calories?: number;
  prepTime?: string;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = 'smart_health_guide_managed_foods';

const INITIAL_FOODS: ManagedFood[] = [
  {
    id: 'food-101',
    name: 'Jollof Fonio with Steamed Red Snapper',
    category: 'Grains',
    mealType: 'Lunch',
    dietType: 'Low Glycemic',
    country: 'West African',
    medicalCompatibility: ['Diabetes Friendly', 'Heart Healthy', 'Low Sodium'],
    status: 'Active',
    calories: 380,
    prepTime: '25 mins',
    description: 'An ancient gluten-free West African grain cooked with fresh tomato purée, herbs, and mild chili, paired with lean grilled red snapper.',
    createdAt: '2026-01-10'
  },
  {
    id: 'food-102',
    name: 'Avocado, Spinach & Berry Smoothie',
    category: 'Fruits & Greens',
    mealType: 'Breakfast',
    dietType: 'Vegan',
    country: 'Global',
    medicalCompatibility: ['Hypertension Safe', 'Heart Healthy', 'Celiac Safe'],
    status: 'Active',
    calories: 260,
    prepTime: '10 mins',
    description: 'Nutrient-rich smoothie with healthy monounsaturated fats, antioxidants, and fiber without added sugars.',
    createdAt: '2026-01-18'
  },
  {
    id: 'food-103',
    name: 'Mediterranean Chickpea & Olive Salad',
    category: 'Legumes',
    mealType: 'Lunch',
    dietType: 'Mediterranean',
    country: 'Mediterranean',
    medicalCompatibility: ['Hypertension Safe', 'Diabetes Friendly', 'Heart Healthy'],
    status: 'Active',
    calories: 310,
    prepTime: '15 mins',
    description: 'Protein-packed legumes tossed with extra virgin olive oil, cucumber, cherry tomatoes, and fresh herbs.',
    createdAt: '2026-02-01'
  },
  {
    id: 'food-104',
    name: 'Herbed Salmon with Steamed Broccoli',
    category: 'Proteins',
    mealType: 'Dinner',
    dietType: 'Keto',
    country: 'Global',
    medicalCompatibility: ['Heart Healthy', 'Diabetes Friendly', 'Celiac Safe'],
    status: 'Active',
    calories: 420,
    prepTime: '20 mins',
    description: 'Omega-3 rich wild salmon fillet baked with lemon zests, dill, and served alongside garlic steamed broccoli.',
    createdAt: '2026-02-12'
  },
  {
    id: 'food-105',
    name: 'Egusi Vegetable Soup with Oat Fufu',
    category: 'Soups & Stews',
    mealType: 'Dinner',
    dietType: 'Balanced',
    country: 'West African',
    medicalCompatibility: ['Diabetes Friendly', 'Low Glycemic'],
    status: 'Active',
    calories: 450,
    prepTime: '40 mins',
    description: 'Traditional ground melon seed soup rich in spinach and lean turkey, served with high-fiber whole grain oat swallow.',
    createdAt: '2026-03-05'
  },
  {
    id: 'food-106',
    name: 'Greek Yogurt Parfait with Walnuts & Chia',
    category: 'Dairy & Alternatives',
    mealType: 'Breakfast',
    dietType: 'Vegetarian',
    country: 'Mediterranean',
    medicalCompatibility: ['Celiac Safe', 'Diabetes Friendly'],
    status: 'Active',
    calories: 290,
    prepTime: '5 mins',
    description: 'Unsweetened probiotic Greek yogurt layered with omega-3 rich walnuts, chia seeds, and fresh blueberries.',
    createdAt: '2026-03-20'
  },
  {
    id: 'food-107',
    name: 'Crispy Sesame Tofu & Bok Choy Stir-Fry',
    category: 'Proteins',
    mealType: 'Dinner',
    dietType: 'Vegan',
    country: 'East Asian',
    medicalCompatibility: ['Low Glycemic', 'Heart Healthy', 'Low Sodium'],
    status: 'Active',
    calories: 330,
    prepTime: '20 mins',
    description: 'Pan-seared organic tofu cubes sautéed with fresh baby bok choy and ginger in low-sodium tamari.',
    createdAt: '2026-04-02'
  },
  {
    id: 'food-108',
    name: 'Quinoa & Black Bean Burrito Bowl',
    category: 'Grains',
    mealType: 'Lunch',
    dietType: 'Vegan',
    country: 'Latin American',
    medicalCompatibility: ['Celiac Safe', 'Hypertension Safe', 'Diabetes Friendly'],
    status: 'Active',
    calories: 390,
    prepTime: '15 mins',
    description: 'Fluffy Peruvian quinoa combined with seasoned black beans, sweet corn, cilantro, and fresh avocado salsa.',
    createdAt: '2026-04-18'
  },
  {
    id: 'food-109',
    name: 'Roasted Cinnamon Sweet Potato Medallions',
    category: 'Vegetables',
    mealType: 'Snack',
    dietType: 'Vegan',
    country: 'Global',
    medicalCompatibility: ['Heart Healthy', 'Low Sodium'],
    status: 'Inactive',
    calories: 180,
    prepTime: '30 mins',
    description: 'Oven-roasted sweet potato slices dusted with Ceylon cinnamon and a touch of extra virgin olive oil.',
    createdAt: '2026-05-01'
  },
  {
    id: 'food-110',
    name: 'Moroccan Spiced Lentil & Tomato Stew',
    category: 'Legumes',
    mealType: 'Dinner',
    dietType: 'Vegan',
    country: 'Middle Eastern',
    medicalCompatibility: ['Diabetes Friendly', 'Hypertension Safe', 'Low Glycemic'],
    status: 'Active',
    calories: 340,
    prepTime: '35 mins',
    description: 'Simmered brown lentils infused with cumin, coriander, turmeric, and diced tomatoes served warm.',
    createdAt: '2026-05-15'
  }
];

const CATEGORY_OPTIONS = [
  'All',
  'Grains',
  'Legumes',
  'Vegetables',
  'Fruits & Greens',
  'Proteins',
  'Dairy & Alternatives',
  'Soups & Stews'
];

const MEAL_TYPE_OPTIONS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIET_TYPE_OPTIONS = ['All', 'Vegan', 'Vegetarian', 'Keto', 'Low Glycemic', 'Mediterranean', 'Balanced'];
const MEDICAL_TAGS_PRESETS = [
  'Diabetes Friendly',
  'Hypertension Safe',
  'Heart Healthy',
  'Low Sodium',
  'Celiac Safe',
  'Low Glycemic',
  'Kidney Friendly'
];

export default function AdminFoodManagement() {
  const [foods, setFoods] = useState<ManagedFood[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved admin foods:', e);
    }
    return INITIAL_FOODS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [mealTypeFilter, setMealTypeFilter] = useState('All');
  const [dietTypeFilter, setDietTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'category'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [selectedFood, setSelectedFood] = useState<ManagedFood | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains',
    mealType: 'Lunch',
    dietType: 'Balanced',
    country: 'West African',
    status: 'Active' as FoodStatus,
    calories: '350',
    prepTime: '20 mins',
    description: '',
    medicalCompatibility: [] as string[]
  });

  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Simulate initial fast load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever foods array changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
    } catch (e) {
      console.error('Failed to save admin foods:', e);
    }
  }, [foods]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 3500);
  };

  // Filtered & Sorted Foods
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.dietType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.medicalCompatibility.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'All' || food.category === categoryFilter;
      const matchesMealType = mealTypeFilter === 'All' || food.mealType === mealTypeFilter;
      const matchesDietType = dietTypeFilter === 'All' || food.dietType === dietTypeFilter;
      const matchesStatus = statusFilter === 'All' || food.status === statusFilter;

      return matchesSearch && matchesCategory && matchesMealType && matchesDietType && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
    });
  }, [foods, searchQuery, categoryFilter, mealTypeFilter, dietTypeFilter, statusFilter, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, mealTypeFilter, dietTypeFilter, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage) || 1;
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFoods.slice(start, start + itemsPerPage);
  }, [filteredFoods, currentPage, itemsPerPage]);

  // Key Statistics
  const stats = useMemo(() => {
    const total = foods.length;
    const active = foods.filter((f) => f.status === 'Active').length;
    const inactive = foods.filter((f) => f.status === 'Inactive').length;
    const categoriesCount = new Set(foods.map((f) => f.category)).size;
    return { total, active, inactive, categoriesCount };
  }, [foods]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setMealTypeFilter('All');
    setDietTypeFilter('All');
    setStatusFilter('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // View Modal
  const handleOpenView = (food: ManagedFood) => {
    setSelectedFood(food);
    setIsViewModalOpen(true);
  };

  // Add Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Grains',
      mealType: 'Lunch',
      dietType: 'Balanced',
      country: 'West African',
      status: 'Active',
      calories: '350',
      prepTime: '20 mins',
      description: '',
      medicalCompatibility: ['Diabetes Friendly', 'Heart Healthy']
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newId = `food-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];

    const newFood: ManagedFood = {
      id: newId,
      name: formData.name.trim(),
      category: formData.category,
      mealType: formData.mealType,
      dietType: formData.dietType,
      country: formData.country.trim() || 'Global',
      medicalCompatibility: formData.medicalCompatibility.length > 0 ? formData.medicalCompatibility : ['General Health'],
      status: formData.status,
      calories: parseInt(formData.calories, 10) || 300,
      prepTime: formData.prepTime.trim() || '15 mins',
      description: formData.description.trim() || 'Nutritious balanced food item suitable for healthy meal plans.',
      createdAt: today
    };

    setFoods((prev) => [newFood, ...prev]);
    setIsAddModalOpen(false);
    showToast(`"${formData.name}" added successfully to food directory.`);
  };

  // Edit Modal
  const handleOpenEdit = (food: ManagedFood) => {
    setSelectedFood(food);
    setFormData({
      name: food.name,
      category: food.category,
      mealType: food.mealType,
      dietType: food.dietType,
      country: food.country,
      status: food.status,
      calories: food.calories ? String(food.calories) : '300',
      prepTime: food.prepTime || '20 mins',
      description: food.description || '',
      medicalCompatibility: [...food.medicalCompatibility]
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood || !formData.name.trim()) return;

    setFoods((prev) =>
      prev.map((f) =>
        f.id === selectedFood.id
          ? {
              ...f,
              name: formData.name.trim(),
              category: formData.category,
              mealType: formData.mealType,
              dietType: formData.dietType,
              country: formData.country.trim() || f.country,
              status: formData.status,
              calories: parseInt(formData.calories, 10) || f.calories,
              prepTime: formData.prepTime.trim() || f.prepTime,
              description: formData.description.trim() || f.description,
              medicalCompatibility: formData.medicalCompatibility
            }
          : f
      )
    );

    setIsEditModalOpen(false);
    showToast(`Food entry "${formData.name}" updated successfully.`);
  };

  // Delete Modal
  const handleOpenDelete = (food: ManagedFood) => {
    setSelectedFood(food);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedFood) return;
    setFoods((prev) => prev.filter((f) => f.id !== selectedFood.id));
    setIsDeleteModalOpen(false);
    showToast(`Food item "${selectedFood.name}" removed from database directory.`, 'info');
  };

  // Quick Toggle Status
  const handleToggleStatus = (food: ManagedFood) => {
    const newStatus: FoodStatus = food.status === 'Active' ? 'Inactive' : 'Active';
    setFoods((prev) =>
      prev.map((f) => (f.id === food.id ? { ...f, status: newStatus } : f))
    );
    showToast(`"${food.name}" status set to ${newStatus}.`, newStatus === 'Active' ? 'success' : 'info');
  };

  // Toggle Medical Tag in Form
  const handleToggleMedicalTag = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.medicalCompatibility.includes(tag);
      return {
        ...prev,
        medicalCompatibility: exists
          ? prev.medicalCompatibility.filter((t) => t !== tag)
          : [...prev.medicalCompatibility, tag]
      };
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Food ID', 'Food Name', 'Category', 'Meal Type', 'Diet Type', 'Country/Region', 'Medical Compatibility', 'Status', 'Calories', 'Created Date'];
    const rows = filteredFoods.map((f) => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      f.mealType,
      f.dietType,
      `"${f.country}"`,
      `"${f.medicalCompatibility.join('; ')}"`,
      f.status,
      f.calories || '',
      f.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_food_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Food directory exported successfully as CSV.', 'info');
  };

  // Status Badge Renderer
  const renderStatusBadge = (status: FoodStatus) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20">
        <XCircle className="w-3 h-3 text-slate-400" />
        Inactive
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto text-left" id="admin-food-management-root">
      
      {/* Toast Alert floating notice */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <Alert
            variant={toastNotification.type === 'error' ? 'error' : toastNotification.type === 'info' ? 'info' : 'success'}
            title={toastNotification.type === 'error' ? 'System Action' : toastNotification.type === 'info' ? 'Notice' : 'Success'}
            className="shadow-xl rounded-2xl border backdrop-blur-md"
          >
            {toastNotification.message}
          </Alert>
        </div>
      )}

      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/80 dark:border-slate-800/80 pb-6" id="admin-food-header">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-purple-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-3xs font-extrabold uppercase tracking-wider border border-emerald-500/20">
                System Administration
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">Nutritional Catalog</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Admin Food Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Directory of approved food items, regional recipes, meal categories, and medical dietary compatibility guidelines.
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
            id="admin-food-export-csv-btn"
          >
            Export Directory
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="h-11 px-4 font-extrabold rounded-xl shadow-2xs"
            id="admin-add-food-btn"
          >
            Add New Food
          </Button>
        </div>
      </div>

      {/* Quick KPI Metrics Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-food-stats-summary">
        
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Total Foods</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</span>
              <span className="text-3xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Catalog Synchronized
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Active Items</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</span>
              <span className="text-3xs text-slate-400 font-medium mt-1.5">
                {Math.round((stats.active / (stats.total || 1)) * 100)}% available in planner
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
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Food Categories</span>
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.categoriesCount}</span>
              <span className="text-3xs text-purple-600/80 dark:text-purple-400/80 font-medium mt-1.5">Diverse food groups</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
            <div className="flex flex-col">
              <span className="text-3xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">Inactive Items</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.inactive}</span>
              <span className="text-3xs text-slate-400 font-medium mt-1.5">Hidden from recommendations</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Controls Bar: Search, Filters, Sorting */}
      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden" id="admin-food-filters-bar">
        <CardContent className="p-4 md:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input (4 cols) */}
            <div className="lg:col-span-4 relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food name, region, diet, tag..."
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="h-11 text-xs sm:text-sm rounded-xl"
                id="admin-search-food-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                  aria-label="Clear food search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter by Category (2 cols) */}
            <div className="lg:col-span-2">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-category-filter-select"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </Select>
            </div>

            {/* Filter by Meal Type (2 cols) */}
            <div className="lg:col-span-2">
              <Select
                value={mealTypeFilter}
                onChange={(e) => setMealTypeFilter(e.target.value)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-mealtype-filter-select"
              >
                {MEAL_TYPE_OPTIONS.map((meal) => (
                  <option key={meal} value={meal}>{meal === 'All' ? 'All Meal Types' : meal}</option>
                ))}
              </Select>
            </div>

            {/* Filter by Status (2 cols) */}
            <div className="lg:col-span-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-food-status-filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>

            {/* Sort Dropdown (2 cols) */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 text-xs sm:text-sm font-semibold rounded-xl"
                id="admin-food-sort-by-select"
              >
                <option value="newest">Newest Added</option>
                <option value="oldest">Oldest Added</option>
                <option value="name">Name (A-Z)</option>
                <option value="category">By Category</option>
              </Select>

              {(searchQuery || categoryFilter !== 'All' || mealTypeFilter !== 'All' || dietTypeFilter !== 'All' || statusFilter !== 'All') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  title="Reset Search Filters"
                  className="h-11 w-11 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 rounded-xl transition-all"
                  id="admin-reset-food-filters-btn"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>

          </div>

          {/* Active Filter Badges Summary */}
          {(searchQuery || categoryFilter !== 'All' || mealTypeFilter !== 'All' || dietTypeFilter !== 'All' || statusFilter !== 'All') && (
            <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800/80 text-2xs" id="active-food-filters-pills">
              <span className="font-extrabold uppercase text-slate-400 tracking-wider text-3xs">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200/60 dark:border-slate-700/60">
                  Query: "{searchQuery}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {categoryFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50">
                  Category: {categoryFilter}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setCategoryFilter('All')} />
                </span>
              )}
              {mealTypeFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/50">
                  Meal: {mealTypeFilter}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => setMealTypeFilter('All')} />
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200/50">
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

      {/* Main Content Area: Foods Table or Cards */}
      {isLoading ? (
        <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <Skeleton variant="rect" className="w-full h-12" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
          <Skeleton variant="rect" className="w-full h-16" />
        </div>
      ) : paginatedFoods.length === 0 ? (
        <EmptyState
          title="No Foods Match Your Search Criteria"
          description={
            searchQuery || categoryFilter !== 'All' || mealTypeFilter !== 'All' || statusFilter !== 'All'
              ? 'Try adjusting your search terms, clearing category filters, or resetting filter selections.'
              : 'There are currently no food items registered in the admin directory.'
          }
          icon={<UtensilsCrossed className="w-10 h-10 text-slate-400" />}
          actionLabel={searchQuery || categoryFilter !== 'All' || mealTypeFilter !== 'All' || statusFilter !== 'All' ? 'Reset All Filters' : 'Add First Food Item'}
          onAction={searchQuery || categoryFilter !== 'All' || mealTypeFilter !== 'All' || statusFilter !== 'All' ? handleResetFilters : handleOpenAdd}
          id="admin-empty-food-state"
        />
      ) : (
        <div className="flex flex-col gap-4" id="admin-food-table-container">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 text-3xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-4 px-6">Food Name & Details</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Meal Type</th>
                  <th className="py-4 px-4">Diet Type</th>
                  <th className="py-4 px-4">Country / Region</th>
                  <th className="py-4 px-4">Medical Compatibility</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {paginatedFoods.map((food) => (
                  <tr
                    key={food.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
                    id={`food-row-${food.id}`}
                  >
                    {/* Name & Calories Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold text-xs shrink-0">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {food.name}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate flex items-center gap-2 mt-0.5">
                            {food.calories && (
                              <span className="flex items-center gap-1 text-2xs font-bold text-amber-600 dark:text-amber-400">
                                <Flame className="w-3 h-3" />
                                {food.calories} kcal
                              </span>
                            )}
                            {food.prepTime && <span>• {food.prepTime}</span>}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
                        {food.category}
                      </span>
                    </td>

                    {/* Meal Type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50">
                        {food.mealType}
                      </span>
                    </td>

                    {/* Diet Type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                        {food.dietType}
                      </span>
                    </td>

                    {/* Country / Region */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {food.country}
                      </div>
                    </td>

                    {/* Medical Compatibility */}
                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {food.medicalCompatibility.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 truncate max-w-[130px]"
                          >
                            {tag}
                          </span>
                        ))}
                        {food.medicalCompatibility.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-full text-3xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            +{food.medicalCompatibility.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {renderStatusBadge(food.status)}
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(food)}
                          className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                          title="View Food Details"
                          aria-label={`View ${food.name}`}
                          id={`btn-view-food-${food.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(food)}
                          className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
                          title="Edit Food Details"
                          aria-label={`Edit ${food.name}`}
                          id={`btn-edit-food-${food.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(food)}
                          className={`p-2 rounded-xl transition-all ${
                            food.status === 'Active'
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                          title={food.status === 'Active' ? 'Set Inactive' : 'Set Active'}
                          aria-label={`Toggle status for ${food.name}`}
                          id={`btn-status-food-${food.id}`}
                        >
                          {food.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenDelete(food)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                          title="Delete Food Item"
                          aria-label={`Delete ${food.name}`}
                          id={`btn-delete-food-${food.id}`}
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

          {/* MOBILE / TABLET CARDS VIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden" id="admin-food-mobile-cards">
            {paginatedFoods.map((food) => (
              <Card
                key={food.id}
                className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs rounded-2xl flex flex-col justify-between"
                id={`food-card-${food.id}`}
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold text-xs shrink-0">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">
                          {food.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate flex items-center gap-2">
                          <Globe className="w-3 h-3 text-emerald-600" /> {food.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg text-2xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {food.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-2xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                      {food.mealType}
                    </span>
                    {renderStatusBadge(food.status)}
                  </div>

                  <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-2xs">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span className="font-bold">Diet Type:</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-200">{food.dietType}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span className="font-bold">Medical Safe:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[160px]">
                        {food.medicalCompatibility.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenView(food)} icon={<Eye className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(food)} icon={<Edit3 className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(food)} className="text-rose-600 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls Footer */}
          {totalPages <= 1 ? (
            <div className="flex items-center justify-between gap-4 p-4 md:px-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400" id="admin-food-pagination-footer-single">
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{filteredFoods.length}</strong> food item{filteredFoods.length === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-2xs uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                All items are displayed.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:px-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs" id="admin-food-pagination-footer">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredFoods.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
                  <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredFoods.length)}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{filteredFoods.length}</strong> items
                </span>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-2xs uppercase tracking-wider font-extrabold text-slate-400">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    id="admin-food-page-size-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5" id="admin-food-pagination-buttons">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                  id="food-pagination-prev-btn"
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
                  id="food-pagination-next-btn"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW FOOD DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Nutritional & Medical Food Profile"
        size="lg"
        id="modal-view-food"
      >
        {selectedFood && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-lg shrink-0 shadow-2xs">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{selectedFood.name}</h3>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {selectedFood.country} • {selectedFood.category}
                </span>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50">
                    {selectedFood.mealType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                    {selectedFood.dietType}
                  </span>
                  {renderStatusBadge(selectedFood.status)}
                </div>
              </div>
            </div>

            {selectedFood.description && (
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Description & Preparation Summary</span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedFood.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Estimated Calories</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-amber-500/20" /> {selectedFood.calories || 300} kcal
                </span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Preparation Time</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{selectedFood.prepTime || '20 mins'}</span>
              </div>
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col gap-1.5">
                <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Catalog Entry Date</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{selectedFood.createdAt}</span>
              </div>
            </div>

            <div>
              <span className="text-3xs uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-2.5">
                Medical & Clinical Dietary Compatibility
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedFood.medicalCompatibility.map((tag, idx) => (
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
                onClick={() => { setIsViewModalOpen(false); handleOpenEdit(selectedFood); }}
                icon={<Edit3 className="w-4 h-4" />}
                className="h-11 px-5 rounded-xl font-extrabold shadow-2xs"
              >
                Edit Food Entry
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD / EDIT FOOD MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? 'Add New Food Item' : 'Edit Food Profile'}
        size="lg"
        id="modal-add-edit-food"
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="flex flex-col gap-5 text-left">
          
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Food Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jollof Fonio with Grilled Fish"
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
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Meal Type
              </label>
              <Select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {MEAL_TYPE_OPTIONS.filter((m) => m !== 'All').map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Diet Classification
              </label>
              <Select
                value={formData.dietType}
                onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {DIET_TYPE_OPTIONS.filter((d) => d !== 'All').map((diet) => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Country / Regional Origin <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. West African, Mediterranean"
                className="h-11 rounded-xl text-xs sm:text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Calories (kcal)
              </label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="350"
                className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Prep Time
              </label>
              <Input
                type="text"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                placeholder="20 mins"
                className="h-11 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                Availability Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FoodStatus })}
                className="h-11 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
              Medical & Clinical Compatibility Badges
            </label>
            <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {MEDICAL_TAGS_PRESETS.map((tag) => {
                const isSelected = formData.medicalCompatibility.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleMedicalTag(tag)}
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
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Food Description & Preparation Guidance
            </label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of nutritional benefits, ingredients, or preparation details..."
              className="rounded-xl text-xs sm:text-sm font-medium p-3"
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-1 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
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
              {isAddModalOpen ? 'Create Food Item' : 'Save Changes'}
            </Button>
          </div>

        </form>
      </Modal>

      {/* DELETE FOOD CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Food Entry"
        size="sm"
        id="modal-delete-food"
      >
        {selectedFood && (
          <div className="flex flex-col gap-5 text-left">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 rounded-2xl flex items-start gap-3">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                  Confirm Food Removal
                </span>
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  Are you sure you want to delete <strong className="font-black text-rose-950 dark:text-rose-100">"{selectedFood.name}"</strong>? This will purge the item from the system catalog.
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
                Delete Item
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
