import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className = '', variant = 'text', ...props }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-slate-200/80 dark:bg-slate-800/60';
  
  let shapeClass = 'rounded-md';
  if (variant === 'circle') {
    shapeClass = 'rounded-full';
  } else if (variant === 'rect') {
    shapeClass = 'rounded-2xl';
  }

  return (
    <div
      className={`${baseClass} ${shapeClass} ${className}`}
      {...props}
    />
  );
}

// Pre-assembled layout skeletons for reducing layout shifts
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row relative overflow-hidden" id="dashboard-skeleton">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen p-6 justify-between shrink-0">
        <div className="flex flex-col gap-6">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" className="w-8 h-8" />
            <Skeleton variant="text" className="w-28 h-6" />
          </div>
          {/* User profile card */}
          <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
            <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
            <div className="flex flex-col gap-1.5 w-full">
              <Skeleton variant="text" className="w-3/4 h-3.5" />
              <Skeleton variant="text" className="w-1/2 h-2.5" />
            </div>
          </div>
          {/* Menu items */}
          <div className="flex flex-col gap-3 mt-4">
            <Skeleton variant="rect" className="w-full h-11" />
            <Skeleton variant="rect" className="w-full h-11" />
            <Skeleton variant="rect" className="w-full h-11" />
            <Skeleton variant="rect" className="w-full h-11" />
          </div>
        </div>
        {/* Footer info */}
        <div className="flex flex-col gap-2">
          <Skeleton variant="rect" className="w-full h-11" />
          <Skeleton variant="text" className="w-1/2 h-3 mx-auto" />
        </div>
      </aside>

      {/* Main Content Skeleton Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 sticky top-0 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <Skeleton variant="circle" className="w-10 h-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton variant="text" className="w-32 h-5 md:w-48 md:h-6" />
            <Skeleton variant="text" className="w-20 h-3 md:w-32 md:h-3.5" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-9 h-9" />
          </div>
        </header>

        {/* Dynamic Inner Dashboard Page Blocks */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          {/* Welcome Alert banner */}
          <Skeleton variant="rect" className="w-full h-24" />

          {/* Quick Metrics stats grid (3 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton variant="circle" className="w-10 h-10" />
                <Skeleton variant="rect" className="w-12 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton variant="text" className="w-1/2 h-3.5" />
                <Skeleton variant="text" className="w-3/4 h-6" />
              </div>
              <Skeleton variant="rect" className="w-full h-2" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Skeleton variant="circle" className="w-10 h-10" />
                <Skeleton variant="rect" className="w-12 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton variant="text" className="w-1/2 h-3.5" />
                <Skeleton variant="text" className="w-3/4 h-6" />
              </div>
              <Skeleton variant="rect" className="w-full h-2" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <Skeleton variant="circle" className="w-10 h-10" />
                <Skeleton variant="rect" className="w-12 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Skeleton variant="text" className="w-1/2 h-3.5" />
                <Skeleton variant="text" className="w-3/4 h-6" />
              </div>
              <Skeleton variant="rect" className="w-full h-2" />
            </div>
          </div>

          {/* Two-Column split panel skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Main Dashboard Segment (e.g., nutrition plan or activities) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-1/3">
                    <Skeleton variant="text" className="w-full h-5" />
                    <Skeleton variant="text" className="w-2/3 h-3" />
                  </div>
                  <Skeleton variant="rect" className="w-20 h-9" />
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <Skeleton variant="rect" className="w-full h-16" />
                  <Skeleton variant="rect" className="w-full h-16" />
                  <Skeleton variant="rect" className="w-full h-16" />
                </div>
              </div>
            </div>

            {/* Right Side Panel Segment (e.g. Health Score / Profile details) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex flex-col gap-5">
                <Skeleton variant="text" className="w-1/2 h-5" />
                <div className="flex justify-center py-4">
                  <Skeleton variant="circle" className="w-32 h-32" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton variant="text" className="w-full h-4" />
                  <Skeleton variant="text" className="w-4/5 h-4" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col" id="recs-skeleton">
      {/* Header bar */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="text" className="w-36 h-6" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-8 h-8" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header Hero Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" className="w-12 h-12" />
            <div className="flex flex-col gap-1.5 w-1/3">
              <Skeleton variant="text" className="w-full h-6" />
              <Skeleton variant="text" className="w-2/3 h-3.5" />
            </div>
          </div>
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-5/6 h-4" />
        </div>

        {/* Profile Stats Mini Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
              <Skeleton variant="text" className="w-1/2 h-3" />
              <Skeleton variant="text" className="w-3/4 h-5" />
            </div>
          ))}
        </div>

        {/* Recommendation Cards Stack */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="circle" className="w-8 h-8" />
              <Skeleton variant="text" className="w-48 h-5" />
            </div>
            <Skeleton variant="rect" className="w-full h-20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <Skeleton variant="rect" className="w-full h-12" />
              <Skeleton variant="rect" className="w-full h-12" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Skeleton variant="circle" className="w-8 h-8" />
              <Skeleton variant="text" className="w-48 h-5" />
            </div>
            <Skeleton variant="rect" className="w-full h-24" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function ProfileFormSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col" id="profile-form-skeleton">
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="text" className="w-32 h-5" />
        </div>
        <Skeleton variant="circle" className="w-8 h-8" />
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6 shadow-md">
          {/* Form Header */}
          <div className="flex flex-col items-center gap-3 text-center mb-2">
            <Skeleton variant="circle" className="w-12 h-12" />
            <Skeleton variant="text" className="w-48 h-6" />
            <Skeleton variant="text" className="w-64 h-3.5" />
          </div>

          {/* Progress Indicator Dots */}
          <div className="flex justify-center gap-2 mb-4">
            <Skeleton variant="circle" className="w-3 h-3" />
            <Skeleton variant="circle" className="w-3 h-3" />
            <Skeleton variant="circle" className="w-3 h-3" />
            <Skeleton variant="circle" className="w-3 h-3" />
          </div>

          {/* Form Inputs Skeleton */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" className="w-24 h-4" />
              <Skeleton variant="rect" className="w-full h-12" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" className="w-20 h-4" />
              <Skeleton variant="rect" className="w-full h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" className="w-16 h-4" />
                <Skeleton variant="rect" className="w-full h-12" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" className="w-16 h-4" />
                <Skeleton variant="rect" className="w-full h-12" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4 mt-4">
            <Skeleton variant="rect" className="w-28 h-12" />
            <Skeleton variant="rect" className="w-32 h-12" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function ProfileSummarySkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col" id="profile-summary-skeleton">
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="text" className="w-36 h-6" />
        </div>
        <Skeleton variant="circle" className="w-8 h-8" />
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-16 h-16" />
            <div className="flex flex-col gap-1.5">
              <Skeleton variant="text" className="w-36 h-5" />
              <Skeleton variant="text" className="w-28 h-3.5" />
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Skeleton variant="rect" className="w-24 h-10" />
            <Skeleton variant="rect" className="w-28 h-10" />
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
            <Skeleton variant="text" className="w-1/2 h-5" />
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/40 pb-2.5">
                  <Skeleton variant="text" className="w-24 h-4" />
                  <Skeleton variant="text" className="w-16 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
            <Skeleton variant="text" className="w-1/2 h-5" />
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/40 pb-2.5">
                  <Skeleton variant="text" className="w-24 h-4" />
                  <Skeleton variant="text" className="w-16 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
