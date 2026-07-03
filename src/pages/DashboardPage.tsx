import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Input, Select, Textarea } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';

type ActiveTab = 'overview' | 'nutrition' | 'fitness' | 'medications';

export default function DashboardPage() {
  const { navigateTo } = useNavigation();
  const { profile } = useHealthProfile();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New workout modal state inputs
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('30');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  // Allergen warning interaction states
  const [selectedAllergen, setSelectedAllergen] = useState('none');
  const [hasAllergyAlert, setHasAllergyAlert] = useState(false);

  const userBio = {
    name: profile ? profile.fullName : (user?.email?.split('@')[0] || "Jane Doe"),
    age: profile ? `${profile.age} yrs` : "28",
    weight: profile ? `${profile.weight} kg` : "68 kg",
    height: profile ? `${profile.height} cm` : "172 cm",
    goal: profile ? profile.healthGoal : "Blood Glucose Regulation",
    activity: profile ? profile.activityLevel : "Moderately Active"
  };

  const menuItems = [
    { id: 'overview', label: 'Health Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition & Meals', icon: <Apple className="w-5 h-5" /> },
    { id: 'fitness', label: 'Fitness & Motion', icon: <Activity className="w-5 h-5" /> },
    { id: 'medications', label: 'Medications Safe Guard', icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWorkout(true);
    setTimeout(() => {
      setIsSavingWorkout(false);
      setIsModalOpen(false);
      // Reset
      setWorkoutName('');
      setWorkoutDuration('30');
      setWorkoutNotes('');
      alert('Mock Workout Session Saved Successfully to Profile!');
    }, 1200);
  };

  const getAllergenWarningContent = () => {
    switch (selectedAllergen) {
      case 'peanuts':
        return {
          title: "Critical Allergen Alert: Peanuts Detected",
          text: "Avoid all nut butter, peanut flour, and verify packaging labels for 'manufactured in a facility with nuts' disclosures.",
          variant: 'error' as const
        };
      case 'gluten':
        return {
          title: "Dietary Exclusion Alert: Gluten Detected",
          text: "Exclude barley, rye, spelt, and standard wheat flours. Safe alternatives include quinoa, brown rice, and buckwheat.",
          variant: 'warning' as const
        };
      case 'dairy':
        return {
          title: "Intolerance Notice: Lactose & Whey",
          text: "Replace animal cream, cheese, and milk. Opt for calcium-fortified almond, oat, or soy derivatives.",
          variant: 'info' as const
        };
      default:
        return null;
    }
  };

  const allergenInfo = getAllergenWarningContent();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col md:flex-row" id="dashboard-root">
      
      {/* Sidebar - Left Drawer */}
      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 p-6" id="sidebar-top-section">
          {/* Sidebar Brand Logo */}
          <div className="flex items-center justify-between" id="sidebar-header">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Smart Health Guide
              </span>
            </div>
            <button
              id="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User quick profile snippet */}
          <div 
            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200" 
            id="sidebar-profile-card"
            onClick={() => navigateTo(profile ? 'profile-summary' : 'profile-form')}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-extrabold text-sm">
              {profile ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JD'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{userBio.name}</h4>
              <p className="text-2xs text-slate-400 dark:text-slate-500 font-medium truncate">{userBio.goal}</p>
            </div>
          </div>

          {/* Menu Items links */}
          <nav className="flex flex-col gap-1.5" id="sidebar-navigation">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4" id="sidebar-bottom-section">
          <ThemeToggle />
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/15 rounded-xl font-semibold text-sm transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen" id="dashboard-main">
        
        {/* Top bar header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between md:justify-end gap-4" id="dashboard-header">
          <button
            id="dashboard-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity" 
            id="header-user-status"
            onClick={() => navigateTo(profile ? 'profile-summary' : 'profile-form')}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Active Account</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{userBio.name}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl" id="header-bell-badge">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Core Dashboard Body Panel */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6" id="dashboard-body">
          
          {/* MANDATORY Medical Disclaimer Alert Container */}
          <Alert variant="disclaimer" title="Educational Nutrition Disclaimer" id="dashboard-disclaimer-alert">
            Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
          </Alert>

          {/* TAB 1: Health Overview Panel */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6" id="tab-overview-content">
              
              {/* Health Profile Completion Callout */}
              {!profile ? (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="dashboard-profile-setup-cta">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white">Complete Your Health Profile</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Define your biological parameters and chronic alerts to unlock customized meal blueprints and safe ingredient radars.</p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigateTo('profile-form')} id="setup-profile-cta-btn" className="bg-amber-600 hover:bg-amber-700 font-bold whitespace-nowrap">
                    Complete Profile
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="dashboard-profile-active-cta">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white font-extrabold">Health Profile Fully Active</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Your biological indexes and micro-nutrients are synchronized. Access custom recommendations or revise your entries.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigateTo('profile-summary')} id="active-profile-summary-btn" className="font-bold whitespace-nowrap">
                      View Summary
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateTo('recommendations')} id="active-profile-recs-btn" className="font-bold whitespace-nowrap">
                      Recommendations
                    </Button>
                  </div>
                </div>
              )}

              {/* Top Banner Widget */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-600/10" id="overview-welcome-banner">
                <div className="flex flex-col gap-2 max-w-xl text-left">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                    Interactive Preview Foundation
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Hello, {userBio.name}!
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed">
                    Welcome to the foundational workspace. Explore the simulated panels of the Smart Health Guide and try out the allergen warning radar below.
                  </p>
                </div>
                <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-slate-50 whitespace-nowrap font-bold" onClick={() => setIsModalOpen(true)} id="overview-add-workout-btn">
                  Log Exercise
                </Button>
              </div>

              {/* Bio Grid Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="overview-bio-grid">
                
                <Card id="bio-card-weight">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Body Mass</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userBio.weight}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> Stable Trend
                    </span>
                  </CardContent>
                </Card>

                <Card id="bio-card-height">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Physical Stature</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userBio.height}</span>
                    <span className="text-xs text-slate-400 mt-1">Normal limits</span>
                  </CardContent>
                </Card>

                <Card id="bio-card-activity">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Metabolic Activity</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">{userBio.activity}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Normal range
                    </span>
                  </CardContent>
                </Card>

                <Card id="bio-card-goal">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Onboarding Goal</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">{userBio.goal}</span>
                    <span className="text-xs text-slate-400 mt-1">Educational focus</span>
                  </CardContent>
                </Card>

              </div>

              {/* Middle Section - Allergen Warning Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-mid-row">
                
                <Card className="lg:col-span-7 flex flex-col justify-between" id="allergen-simulator-card">
                  <CardHeader>
                    <CardTitle>Interactive Food Allergen Warning Radar</CardTitle>
                    <CardDescription>Select an allergen biological flag below to preview the instant alert guidelines framework in action.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    
                    <Select
                      label="Select Profile Allergen Flag"
                      id="allergen-selector"
                      value={selectedAllergen}
                      onChange={(e) => setSelectedAllergen(e.target.value)}
                      options={[
                        { value: 'none', label: 'None (Default Balanced Dietary)' },
                        { value: 'peanuts', label: 'Peanuts Allergy (Severe Anaphylactic Warning)' },
                        { value: 'gluten', label: 'Gluten Intolerance (Celiac Safe)' },
                        { value: 'dairy', label: 'Dairy Intolerance (Lactose Free)' },
                      ]}
                    />

                    {allergenInfo && (
                      <Alert variant={allergenInfo.variant} title={allergenInfo.title} id="simulator-output-alert">
                        {allergenInfo.text}
                      </Alert>
                    )}

                    {!allergenInfo && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2" id="simulator-empty-notif">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>No allergy profile alerts currently triggered. Defaulting to general nutrition listings.</span>
                      </div>
                    )}

                  </CardContent>
                </Card>

                <Card className="lg:col-span-5 flex flex-col justify-between" id="educational-links-card">
                  <CardHeader>
                    <CardTitle>Scientific Resources</CardTitle>
                    <CardDescription>Trusted educational organizations and dietary research data portals.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    
                    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all" id="edu-link-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">World Health Organization</h4>
                          <p className="text-xs text-slate-400">Public diet & lifestyle reviews</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all" id="edu-link-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Harvard Nutrition Source</h4>
                          <p className="text-xs text-slate-400">Comprehensive ingredient research</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* TAB 2: Nutrition & Meals */}
          {activeTab === 'nutrition' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tab-nutrition-content">
              
              <Card id="nutrition-safe-foods">
                <CardHeader className="bg-emerald-50/20 dark:bg-emerald-950/5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <CardTitle>Highly Recommended Food Groups</CardTitle>
                  </div>
                  <CardDescription>Foods scientifically indicated to support blood glucose and energy stabilization.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Spinach & Leafy Greens</h4>
                      <p className="text-xs text-slate-400 mt-1">Rich in magnesium, vitamins, and minerals that promote fiber synthesis and insulin regulation.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Avocados & Omega-3 Fats</h4>
                      <p className="text-xs text-slate-400 mt-1">Healthy fats that slow digestive rate and minimize blood sugar spikes following meals.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Organic Wild-Caught Salmon</h4>
                      <p className="text-xs text-slate-400 mt-1">Premium amino acid matrix to support physical muscular health and lean metabolism.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card id="nutrition-avoid-foods">
                <CardHeader className="bg-rose-50/20 dark:bg-rose-950/5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <CardTitle>Food Groups to Avoid</CardTitle>
                  </div>
                  <CardDescription>Foods that may pose high glycemic loads or conflicting allergen impacts.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Refined Syrups & Soda</h4>
                      <p className="text-xs text-slate-400 mt-1">High fructose corn syrup causes immediate pancreatic fatigue and insulin resistance.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Processed Canned Soup</h4>
                      <p className="text-xs text-slate-400 mt-1">Contains massive chemical sodium concentrations that strain blood pressure homeostasis.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">White Flour Bagels</h4>
                      <p className="text-xs text-slate-400 mt-1">Devoid of biological wheat germ fiber, resulting in rapid starch digestion and glucose surges.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* TAB 3: Fitness & Motion */}
          {activeTab === 'fitness' && (
            <div className="flex flex-col gap-6 animate-fade-in" id="tab-fitness-content">
              {/* Highlight our EmptyState component beautifully */}
              <EmptyState
                title="No Custom Workout Logs Recorded"
                description="Your activity log is currently clear. Record a physical workout session using our modal form to build your metrics tracker."
                actionLabel="Record Active Session"
                onAction={() => setIsModalOpen(true)}
                id="fitness-empty-state"
              />
            </div>
          )}

          {/* TAB 4: Medication Alert */}
          {activeTab === 'medications' && (
            <div className="flex flex-col gap-6" id="tab-medications-content">
              <EmptyState
                title="Prescription Timing Safety Radar"
                description="Medication-to-food chemical reaction analysis is currently locked. This feature is slated for the secondary deployment release."
                actionLabel="Review Onboarding Goal"
                onAction={() => setActiveTab('overview')}
                id="medications-empty-state"
              />
            </div>
          )}

        </div>
      </main>

      {/* Reusable Form inside custom Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Fitness Activity Session"
        id="add-workout-modal"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)} id="modal-cancel-btn">
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateWorkout} isLoading={isSavingWorkout} id="modal-save-btn">
              Save Activity
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateWorkout} className="flex flex-col gap-4 text-left" id="modal-workout-form">
          <Input
            label="Workout Exercise Type"
            id="modal-workout-name"
            placeholder="e.g. Cardiovascular Jogging, Yoga, Weight Lifting"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />

          <Select
            label="Planned Session Duration"
            id="modal-workout-duration"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            options={[
              { value: '15', label: '15 Minutes (Short/Active)' },
              { value: '30', label: '30 Minutes (Recommended Daily)' },
              { value: '45', label: '45 Minutes (Strength Intensity)' },
              { value: '60', label: '60 Minutes (High Metabolism)' },
            ]}
          />

          <Textarea
            label="Physical Wellness Feeling & Notes (Optional)"
            id="modal-workout-notes"
            placeholder="Record hydration level, target heart rate, or pain warnings."
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
          />
        </form>
      </Modal>

    </div>
  );
}
