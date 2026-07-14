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
      title: "Scientific Integrity",
      desc: "Our recommendations compile established nutritional research, clinical guidelines, and educational science."
    },
    {
      title: "100% Privacy Focused",
      desc: "Your medical profiles, height, weight, and lifestyle entries are kept securely inside the browser context."
    },
    {
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
      <header className="relative py-16 md:py-28 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-transparent dark:from-emerald-950/10 dark:via-transparent dark:to-transparent" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 flex flex-col items-start text-left" id="hero-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-6 border border-emerald-100 dark:border-emerald-900/40" id="hero-badge">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Next-Gen Personal Wellness Science</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-6" id="hero-headline">
                Your Health Profile. <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Personalized Nutrition & Guide.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed" id="hero-subtitle">
                Make healthier lifestyle choices with structured educational feedback custom-built around your age, biometrics, food allergies, and health goals.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-6" id="hero-actions">
                {isAuthenticated ? (
                  <Button variant="primary" size="lg" className="shadow-lg shadow-emerald-500/15" onClick={() => navigateTo('dashboard')} id="hero-cta-dashboard">
                    Go to Your Dashboard <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                ) : (
                  <>
                    <Button variant="primary" size="lg" className="shadow-lg shadow-emerald-500/15" onClick={() => navigateTo('register')} id="hero-cta-register">
                      Create Free Profile <ArrowRight className="w-5 h-5 ml-1" />
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => navigateTo('login')} id="hero-cta-login">
                      Access Dashboard
                    </Button>
                  </>
                )}
              </div>

              {/* Small alert disclaimer */}
              <Alert variant="disclaimer" className="w-full max-w-2xl mt-4 bg-white/50 dark:bg-slate-900/40 border-emerald-500/20" id="hero-medical-warning">
                Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
              </Alert>
            </div>

            {/* Hero Vector Graphic */}
            <div className="lg:col-span-5 flex justify-center" id="hero-right">
              <div className="relative w-full max-w-[420px] aspect-square rounded-[2.5rem] bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-950/20 dark:to-slate-900 p-8 flex items-center justify-center border border-white dark:border-slate-800 shadow-2xl shadow-emerald-200/40 dark:shadow-none animate-bounce-slow">
                {/* Floating metrics badge 1 */}
                <div className="absolute top-6 left-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-md border border-slate-50 dark:border-slate-700/60 flex items-center gap-2" id="hero-floating-badge-1">
                  <div className="p-1.5 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-500">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-2xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Hydration target</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">2.8L / Daily</p>
                  </div>
                </div>

                {/* Floating metrics badge 2 */}
                <div className="absolute bottom-10 right-4 bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-md border border-slate-50 dark:border-slate-700/60 flex items-center gap-2" id="hero-floating-badge-2">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Active goal</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Lower Sodium</p>
                  </div>
                </div>

                {/* Main graphic */}
                <div className="w-56 h-56 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
                  <Activity className="w-24 h-24 stroke-[1.5]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. Features Section */}
      <section id="features" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" id="features-header">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Science-backed Health Framework
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Our framework is built to analyze key biometric variables and translate public research into intuitive, daily food and exercise alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="features-grid">
            {features.map((feat, idx) => (
              <Card key={idx} hoverable className="h-full flex flex-col justify-between" id={`feature-card-${idx}`}>
                <CardContent className="flex flex-col gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl w-fit">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" id="how-it-works-header">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Simple 4-Step Methodology
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Start receiving educational nutrition lists in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative" id="how-it-works-grid">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-start gap-4 relative z-10" id={`step-item-${idx}`}>
                <div className="text-4xl sm:text-5xl font-black text-emerald-600/15 dark:text-emerald-500/10 mb-1 select-none">
                  {step.num}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 flex flex-col items-start" id="why-us-left">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">Our Core Principles</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight mb-4">
                Structured with absolute user care and precision.
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Smart Health Guide is built by a unified team of designers and medical enthusiasts who believe healthcare knowledge should be universally readable.
              </p>
              <Button variant="secondary" onClick={() => navigateTo('register')} id="why-us-learn-more">
                Join Free Today
              </Button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6" id="why-us-right">
              {advantages.map((adv, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col gap-3" id={`adv-item-${idx}`}>
                  <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-600 dark:text-emerald-400 w-fit">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{adv.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{adv.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 6. Testimonials Section (Placeholder) */}
      <section id="testimonials" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" id="testimonials-header">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Real Impact & Stories
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              See how our educational resources empower everyday lifestyle tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="testimonials-grid">
            {testimonials.map((test, idx) => (
              <Card key={idx} className="flex flex-col justify-between" id={`testimonial-card-${idx}`}>
                <CardContent className="flex flex-col gap-6 p-6 md:p-8">
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 italic leading-relaxed">
                    "{test.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      {test.author[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{test.author}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{test.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16" id="faq-header">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Clear, transparent answers about our health guidance scope.
            </p>
          </div>

          <div className="space-y-4" id="faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/10"
                  id={`faq-item-${idx}`}
                >
                  <button
                    id={`faq-btn-${idx}`}
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-slate-900 dark:text-white text-base md:text-lg hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/40" id={`faq-answer-${idx}`}>
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
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900 overflow-hidden" id="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 md:p-16 text-center text-white shadow-xl shadow-emerald-600/10 overflow-hidden" id="cta-banner">
            
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
              <span className="bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                100% Free Signup
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Empower Your Lifestyle Guide Today
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-emerald-50/90 leading-relaxed mb-4">
                Unlock daily biometrics calculation feedback and specialized educational ingredient radars instantly. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-slate-50 w-full sm:w-auto font-bold"
                  onClick={() => navigateTo('register')}
                  id="cta-register-button"
                >
                  Create Your Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                  onClick={() => navigateTo('login')}
                  id="cta-login-button"
                >
                  Sign In
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Footer with MANDATORY Disclaimer */}
      <footer className="bg-slate-900 text-slate-400 py-12 md:py-20 border-t border-slate-800" id="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
            
            {/* Footer Branding */}
            <div className="lg:col-span-5 flex flex-col items-start gap-4" id="footer-branding">
              <div className="flex items-center gap-2" id="footer-logo">
                <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Smart Health Guide
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Dedicated to improving global food literacy and dietary confidence through accessible biometrics dashboards.
              </p>
            </div>

            {/* Links Block 1 */}
            <div className="lg:col-span-3 flex flex-col gap-3" id="footer-links-1">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Company</h4>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">About Our Team</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Clinical Advisory</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Open Source Base</a>
            </div>

            {/* Links Block 2 */}
            <div className="lg:col-span-4 flex flex-col gap-3" id="footer-links-2">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1">Contact & Support</h4>
              <p className="text-sm">Have general suggestions or research feedback?</p>
              <span className="text-white font-semibold text-sm hover:underline cursor-pointer">support@smarthealthguide.org</span>
            </div>

          </div>

          {/* Divider */}
          <hr className="border-slate-800 my-8" />

          {/* MANDATORY disclaimer container */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 mb-8" id="footer-disclaimer-wrapper">
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              <span className="font-extrabold text-white uppercase tracking-wider mr-2 bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-3xs border border-emerald-900">
                Medical Disclaimer
              </span>
              Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500" id="footer-bottom-bar">
            <span>© 2026 Smart Health & Food Guide. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-300">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300">Terms of Use</a>
              <a href="#" className="hover:text-slate-300">Cookie Preference</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
