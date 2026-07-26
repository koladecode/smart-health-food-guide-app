import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  Heart,
  HelpCircle,
  Menu,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Quote,
  UserCheck,
  X
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

export default function LandingPage() {
  const { navigateTo } = useNavigation();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Biometric Profile Analyzer",
      description: "Tailor suggestions by inputting physical biometrics, daily metabolic activity level, and targets."
    },
    {
      icon: <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Condition & Allergy Guard",
      description: "Smart filters keep meals completely safe, avoiding allergens and conflicting chronic food groups."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Clinical Safe Pairing",
      description: "Identify how certain nutrient compounds interact with medications and lifestyle choices."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Evidence-Based Guidance",
      description: "Access easy-to-read educational cards explaining exactly *why* certain food groups are recommended."
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Build Your Bio-Profile",
      description: "Specify physical markers like age, weight, health conditions, or chronic habits securely."
    },
    {
      num: "02",
      title: "Define Preferences",
      description: "Flag food allergies, specific dietary restrictions, or current prescription medications."
    },
    {
      num: "03",
      title: "Generate Real-Time Guides",
      description: "Instantly view list cards of foods to eat, warnings of foods to avoid, and custom lifestyle tips."
    },
    {
      num: "04",
      title: "Log & Track Progress",
      description: "Reference your personalized health metrics and tweak your profile filters as your biometrics change."
    }
  ];

  const advantages = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Scientific Integrity",
      desc: "Our recommendations compile established nutritional research, clinical guidelines, and educational science."
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: "100% Privacy Focused",
      desc: "Your medical profiles, height, weight, and lifestyle entries are kept securely inside the browser context."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: "Startup-Speed UX",
      desc: "Experience zero lag when creating, updating, and viewing tailored meals or workout suggestions."
    }
  ];

  const testimonials = [
    {
      quote: "This guide completely changed how I plan meals. My diabetes and tree-nut allergies make eating stressful, but this app handles food filters beautifully.",
      author: "David K.",
      role: "User with Type-2 Diabetes"
    },
    {
      quote: "I love the emphasis on education. It doesn't just say 'eat kale'; it tells me how kale's vitamins synergize with my high-intensity workout routine.",
      author: "Sarah L.",
      role: "Fitness Enthusiast"
    },
    {
      quote: "The medication-pairing warning radar is a game-changer. Finally, a health tool that thinks about lifestyle-treatment interactions in simple terms.",
      author: "Dr. Marcus G.",
      role: "Public Health Consultant"
    }
  ];

  const faqs = [
    {
      q: "Is this platform a replacement for professional medical advice?",
      a: "Absolutely not. Smart Health & Food Guide is solely an educational tool designed to promote nutritional awareness. You must consult your primary physician or a clinical dietitian before starting any restrictive dietary regimen."
    },
    {
      q: "How secure is my health and biometric profile?",
      a: "Extremely secure. Your profile is synchronized with the authenticated backend and stored securely in your user account using industry-standard protocols. We never share or sell personal biological records."
    },
    {
      q: "Does it support custom diets like Keto, Vegan, or FODMAP?",
      a: "Yes. The underlying profile selector is built to support dietary preferences including Vegan, Vegetarian, Keto, Low-FODMAP, and specific allergy toggles like dairy, gluten, and tree-nuts."
    },
    {
      q: "Can I input current prescription medications?",
      a: "Yes. Future iterations of the biometric questionnaire allow optional medication logging to cross-reference educational guidelines regarding potential food-drug timing conflicts."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="landing-page-root">
      
      {/* 1. Header / Navigation Bar */}
      <nav id="navbar" className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')} id="navbar-logo">
              <div className="p-2 bg-emerald-600 rounded-xl text-white">
                <Heart className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-lg md:text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Smart Health Guide
              </span>
            </div>

            {/* Desktop Nav links */}
            <div className="hidden md:flex items-center gap-8" id="navbar-desktop-links">
              <a href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How It Works</a>
              <a href="#why-choose-us" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Why Us</a>
              <a href="#testimonials" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Stories</a>
              <a href="#faq" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</a>
            </div>

            {/* Desktop CTA actions */}
            <div className="hidden md:flex items-center gap-4" id="navbar-desktop-actions">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button variant="primary" size="sm" onClick={() => navigateTo('dashboard')} id="navbar-dashboard-btn">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigateTo('login')} id="navbar-login-btn">
                    Log In
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => navigateTo('register')} id="navbar-register-btn">
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-3" id="navbar-mobile-actions">
              <ThemeToggle />
              <button
                id="navbar-mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 flex flex-col gap-4 shadow-inner" id="navbar-mobile-dropdown">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
            >
              How It Works
            </a>
            <a
              href="#why-choose-us"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
            >
              Why Us
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
            >
              Stories
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
            >
              FAQ
            </a>
            <hr className="border-slate-100 dark:border-slate-800" />
            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated ? (
                <Button variant="primary" size="md" className="w-full" onClick={() => { navigateTo('dashboard'); setMobileMenuOpen(false); }} id="navbar-mobile-dashboard">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="md" className="w-full" onClick={() => { navigateTo('login'); setMobileMenuOpen(false); }} id="navbar-mobile-login">
                    Log In
                  </Button>
                  <Button variant="primary" size="md" className="w-full" onClick={() => { navigateTo('register'); setMobileMenuOpen(false); }} id="navbar-mobile-register">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <header className="relative py-12 sm:py-16 md:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-transparent dark:from-emerald-950/15 dark:via-transparent dark:to-transparent" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 xl:gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 flex flex-col items-start text-left" id="hero-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-6 border border-emerald-500/20 dark:border-emerald-400/20 backdrop-blur-xs" id="hero-badge">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Next-Gen Personal Wellness Science</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.125] sm:leading-[1.125] mb-6" id="hero-headline">
                Your Health Profile. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Personalized Nutrition & Guide.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed font-normal" id="hero-subtitle">
                Make healthier lifestyle choices with structured educational feedback custom-built around your age, biometrics, food allergies, and health goals.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full sm:w-auto mb-6" id="hero-actions">
                {isAuthenticated ? (
                  <Button variant="primary" size="lg" className="shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 px-7 font-bold text-base transition-all duration-200" onClick={() => navigateTo('dashboard')} id="hero-cta-dashboard">
                    Go to Your Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button variant="primary" size="lg" className="shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 px-7 font-bold text-base transition-all duration-200" onClick={() => navigateTo('register')} id="hero-cta-register">
                      Create Free Profile <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button variant="outline" size="lg" className="px-7 font-bold text-base border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60" onClick={() => navigateTo('login')} id="hero-cta-login">
                      Access Dashboard
                    </Button>
                  </>
                )}
              </div>

              {/* Small alert disclaimer */}
              <Alert variant="disclaimer" className="w-full max-w-2xl mt-2 bg-white/60 dark:bg-slate-900/50 border-emerald-500/20 backdrop-blur-xs text-xs leading-relaxed" id="hero-medical-warning">
                Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
              </Alert>
            </div>

            {/* Hero Vector Graphic */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full" id="hero-right">
              <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square rounded-[2.5rem] bg-gradient-to-tr from-emerald-100/80 via-emerald-50/50 to-teal-50/80 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 p-8 flex items-center justify-center border border-white/80 dark:border-slate-800/80 shadow-xl shadow-emerald-500/10 dark:shadow-none transition-all duration-300">
                {/* Floating metrics badge 1 */}
                <div className="absolute top-5 left-4 sm:top-6 sm:left-6 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-transform hover:scale-105 duration-200" id="hero-floating-badge-1">
                  <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-500 dark:text-rose-400">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Hydration target</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">2.8L / Daily</p>
                  </div>
                </div>

                {/* Floating metrics badge 2 */}
                <div className="absolute bottom-8 right-3 sm:bottom-10 sm:right-4 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-transform hover:scale-105 duration-200" id="hero-floating-badge-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Active goal</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Lower Sodium</p>
                  </div>
                </div>

                {/* Main graphic */}
                <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 dark:shadow-emerald-500/20 ring-8 ring-emerald-500/10">
                  <Activity className="w-20 h-20 sm:w-24 sm:h-24 stroke-[1.75]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16" id="features-header">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 block">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Science-backed Health Framework
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Our framework analyzes key biometric variables and translates clinical research into intuitive, daily food and exercise guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" id="features-grid">
            {features.map((feat, idx) => (
              <Card key={idx} hoverable className="h-full flex flex-col justify-between rounded-3xl border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-md hover:border-emerald-200/60 dark:hover:border-emerald-900/40 transition-all duration-300" id={`feature-card-${idx}`}>
                <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full gap-5">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                      {feat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{feat.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16" id="how-it-works-header">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 block">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Simple 4-Step Methodology
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Start receiving educational nutrition guidance and biometric alerts in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative" id="how-it-works-grid">
            {steps.map((step, idx) => (
              <div key={idx} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-md hover:border-emerald-200/60 dark:hover:border-emerald-900/40 transition-all duration-300 ease-out flex flex-col justify-between h-full group relative z-10" id={`step-item-${idx}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600/30 dark:text-emerald-400/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 select-none">
                      {step.num}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-100/60 dark:border-emerald-900/40">
                      0{idx + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us / Trust & Credibility Section */}
      <section id="why-choose-us" className="py-16 sm:py-20 md:py-28 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-12 items-center">
            
            <div className="lg:col-span-5 flex flex-col items-start text-left" id="why-us-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 block">
                Our Core Principles
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15] mb-4 sm:mb-6">
                Structured with absolute user care and precision.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-normal">
                Smart Health Guide is built by a unified team of designers and medical enthusiasts who believe healthcare knowledge should be universally readable.
              </p>
              <Button variant="secondary" className="px-6 py-3 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" onClick={() => navigateTo('register')} id="why-us-learn-more">
                Join Free Today
              </Button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-stretch" id="why-us-right">
              {advantages.map((adv, idx) => (
                <div key={idx} className="p-6 sm:p-7 rounded-3xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-200/80 dark:hover:border-emerald-900/50 shadow-2xs hover:shadow-md transition-all duration-300 ease-out flex flex-col justify-between h-full group" id={`adv-item-${idx}`}>
                  <div className="flex flex-col gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 group-hover:scale-105 transition-transform duration-200">
                      {adv.icon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{adv.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">{adv.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16" id="testimonials-header">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 block">
              User Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Real Impact & Stories
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              See how our educational resources empower everyday lifestyle tracking and informed food choices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch" id="testimonials-grid">
            {testimonials.map((test, idx) => (
              <Card key={idx} className="h-full flex flex-col justify-between rounded-3xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-2xs hover:shadow-md hover:border-emerald-200/60 dark:hover:border-emerald-900/40 transition-all duration-300 ease-out group" id={`testimonial-card-${idx}`}>
                <CardContent className="p-6 sm:p-7 md:p-8 flex flex-col justify-between h-full gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400 dark:text-amber-300">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500/40 transition-colors duration-200" />
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      "{test.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {test.author[0]}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">{test.author}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{test.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16" id="faq-header">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 block">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Clear, transparent answers about our health guidance scope and personalized nutrition features.
            </p>
          </div>

          <div className="space-y-3.5 sm:space-y-4" id="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border transition-all duration-300 ease-out rounded-2xl sm:rounded-3xl overflow-hidden ${
                    isOpen
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/15 shadow-2xs'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-200 dark:hover:border-slate-750'
                  }`}
                  id={`faq-item-${idx}`}
                >
                  <button
                    id={`faq-btn-${idx}`}
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full flex justify-between items-center gap-4 px-6 sm:px-7 py-5 text-left font-bold text-slate-900 dark:text-white text-base md:text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl sm:rounded-3xl cursor-pointer"
                  >
                    <span className="pr-2 tracking-tight">{faq.q}</span>
                    <div className={`p-1.5 rounded-xl transition-all duration-200 shrink-0 ${isOpen ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 sm:px-7 pb-6 pt-1 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-emerald-100/40 dark:border-emerald-900/20" id={`faq-answer-${idx}`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Call To Action Section */}
      <section className="py-16 sm:py-20 md:py-28 bg-white dark:bg-slate-900 overflow-hidden" id="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center text-white shadow-xl shadow-emerald-600/15 overflow-hidden" id="cta-banner">
            
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
              <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-xs">
                100% Free Signup
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
                Empower Your Health Profile Today
              </h2>
              <p className="text-base sm:text-lg text-emerald-50/90 leading-relaxed font-normal mb-2 max-w-xl">
                Unlock daily biometrics calculation feedback and personalized educational food guidance instantly. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 w-full justify-center" id="cta-actions">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-slate-50 w-full sm:w-auto font-bold px-7 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
                  onClick={() => navigateTo('register')}
                  id="cta-register-button"
                >
                  Create Free Account <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto font-bold px-7 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  onClick={() => navigateTo('login')}
                  id="cta-login-button"
                >
                  Sign In to Dashboard
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Footer with MANDATORY Disclaimer */}
      <footer className="bg-slate-950 text-slate-400 py-16 sm:py-20 border-t border-slate-800/80" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
            
            {/* Footer Branding */}
            <div className="lg:col-span-5 flex flex-col items-start gap-4" id="footer-branding">
              <div className="flex items-center gap-2.5" id="footer-logo">
                <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xs">
                  <Heart className="w-5 h-5 fill-current/20" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Smart Health Guide
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
                Dedicated to improving global food literacy and dietary confidence through accessible biometrics dashboards.
              </p>
            </div>

            {/* Links Block 1 */}
            <div className="lg:col-span-3 flex flex-col gap-3" id="footer-links-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Company</h4>
              <a href="#" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs w-fit">About Our Team</a>
              <a href="#" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs w-fit">Clinical Advisory</a>
              <a href="#" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs w-fit">Open Source Base</a>
            </div>

            {/* Links Block 2 */}
            <div className="lg:col-span-4 flex flex-col gap-3" id="footer-links-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Contact & Support</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Have general suggestions or research feedback?</p>
              <a href="mailto:support@smarthealthguide.org" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs w-fit">support@smarthealthguide.org</a>
            </div>

          </div>

          {/* Divider */}
          <hr className="border-slate-800/80 my-10 sm:my-12" />

          {/* MANDATORY disclaimer container */}
          <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-800/80 mb-10" id="footer-disclaimer-wrapper">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-extrabold text-emerald-400 uppercase tracking-wider mr-2.5 bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-md text-[10px] border border-emerald-900/60 inline-flex items-center gap-1 shrink-0">
                Medical Disclaimer
              </span>
              Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-400" id="footer-bottom-bar">
            <span className="font-medium">© 2026 Smart Health & Food Guide. All rights reserved.</span>
            <div className="flex flex-wrap gap-6">
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs">Terms of Use</a>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xs">Cookie Preference</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
