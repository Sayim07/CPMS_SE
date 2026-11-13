import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  Lock,
  FileCheck,
  GraduationCap,
  Sliders,
  ChevronRight,
  Briefcase,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { students, jobs, applications, companies } = useDynamicData();

  // Dynamic Telemetry Computed Strictly from Real-Time Store
  const totalStudents = students.length;
  const placedStudents = students.filter((s) => s.placement_status === "PLACED").length;
  const placementRate =
    totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : "0.0";

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE");
  const validCtcs = activeJobs.map((j) => (typeof j.ctc_lpa === "number" ? j.ctc_lpa : 0));
  const highestCtc = validCtcs.length > 0 ? Math.max(...validCtcs, 0).toFixed(1) : "0.0";
  const avgCtc =
    validCtcs.length > 0
      ? (validCtcs.reduce((a, b) => a + b, 0) / validCtcs.length).toFixed(1)
      : "0.0";

  const activeRecruiters = companies.filter((c) => c.status === "APPROVED").length;
  const totalOffers = applications.filter((a) => a.stage === "SELECTED").length;

  return (
    <div className="min-h-screen bg-[#F5EEDB] dark:bg-[#141418] text-black dark:text-white flex flex-col font-sans neo-grid-pattern transition-colors duration-200">
      {/* 1. Neoflux-style Top Announcement Bar */}
      <div className="bg-black text-[#FFE600] font-mono font-bold text-xs py-2 px-4 border-b-2 border-black flex items-center justify-center gap-2 text-center select-none">
        <span className="w-2 h-2 rounded-full bg-[#FFE600] inline-block animate-ping"></span>
        <span>
          AY 2024–25 REAL-TIME COHORT: {totalStudents} REGISTERED CANDIDATES • {activeJobs.length} ACTIVE DRIVES
        </span>
        <Link to="/login" className="underline cursor-pointer ml-1 font-black">
          ENTER PORTAL →
        </Link>
      </div>

      {/* 2. Neoflux-style Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#F5EEDB] dark:bg-zinc-900 border-b-2 border-black dark:border-white shadow-[0px_4px_0px_0px_#000] dark:shadow-[0px_4px_0px_0px_#fff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] flex items-center justify-center font-black text-base tracking-wider">
              CP
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-lg font-black text-black dark:text-white tracking-tight">
                  CPMS
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-neo bg-[#A388EE] text-black font-black border border-black dark:border-white">
                  AY 2024–25
                </span>
              </div>
              <span className="text-[11px] font-bold text-black/70 dark:text-white/70 hidden sm:inline font-mono">
                Placement Operating System
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-black dark:text-white font-mono">
            <a href="#metrics" className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors">
              // Telemetry
            </a>
            <a href="#architecture" className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors">
              // Policy
            </a>
            <a href="#portals" className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors">
              // Portals
            </a>
            <a href="#drives" className="hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors">
              // Live Drives
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-black" />
              ) : (
                <Sun className="w-4 h-4 text-black" />
              )}
            </button>

            {/* Login & Action Button */}
            <Link
              to="/login"
              className="px-4 py-2 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white hover:bg-yellow-50 text-xs font-black uppercase tracking-wider transition-all"
            >
              Login
            </Link>
            <Link
              to="/register/student"
              className="flex items-center gap-1.5 px-4 py-2 rounded-neo bg-[#FF70A6] text-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] text-xs font-black uppercase tracking-wider transition-all"
            >
              <span>Student Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Neoflux Split-Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Sticker Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#FF70A6] inline-block"></span>
                <span>Real-Time Deterministic Verification</span>
              </div>

              {/* Massive Retro Headline */}
              <h1 className="font-headline-lg text-4xl sm:text-6xl font-black text-black dark:text-white tracking-tight leading-[1.08]">
                Understand your cohort. <br />
                <span className="bg-[#FFE600] text-black px-3 py-0.5 border-2 border-black shadow-[4px_4px_0px_0px_#000] inline-block my-1 rotate-[0.5deg]">
                  Grow
                </span>{" "}
                their careers.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base font-medium text-black/80 dark:text-white/80 max-w-xl leading-relaxed">
                Deterministic placement operating system that answers the questions that matter:
                who is eligible, what credentials were audited, and whether corporate offers comply with single-offer policies.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black text-xs sm:text-sm uppercase tracking-wider transition-all"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register/student"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-neo bg-[#FF70A6] text-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none font-black text-xs sm:text-sm uppercase tracking-wider transition-all"
                >
                  <span>Student Registration</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-neo bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none font-black text-xs sm:text-sm uppercase tracking-wider transition-all"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>

            {/* Right Column: Live Browser Window Mockup */}
            <div className="lg:col-span-5 relative">
              {/* Floating Sticker */}
              <div className="absolute -top-4 -left-3 z-20 px-3 py-1 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] font-black text-xs font-mono rotate-[-3deg] select-none">
                ★ {placementRate}% Placed Cohort
              </div>

              {/* The Window Container */}
              <div className="relative bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden">
                {/* Window Top Titlebar */}
                <div className="h-10 px-3 bg-white dark:bg-zinc-800 border-b-2 border-black dark:border-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FF70A6] border border-black inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-black inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-[#86EFAC] border border-black inline-block"></span>
                  </div>

                  <div className="px-3 py-0.5 rounded-neo bg-[#F5EEDB] dark:bg-zinc-900 border border-black dark:border-white font-mono text-[10px] text-black dark:text-white font-bold truncate max-w-[200px]">
                    app.cpms.edu/overview
                  </div>

                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-neo bg-black text-[#86EFAC] font-mono text-[9px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#86EFAC] animate-pulse"></span>
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Window Body: 3 Stat Tiles */}
                <div className="p-4 space-y-4 bg-white dark:bg-zinc-900">
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Stat 1 */}
                    <div className="p-2.5 rounded-neo border-2 border-black dark:border-white bg-[#F5EEDB]/50 dark:bg-zinc-800/60">
                      <span className="font-mono text-[10px] uppercase font-bold text-black/60 dark:text-white/60 block">
                        CANDIDATES
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-base font-black">{totalStudents}</span>
                        <span className="font-mono text-[9px] font-black text-black bg-[#FFE600] px-1 rounded border border-black">
                          REAL
                        </span>
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-2.5 rounded-neo border-2 border-black dark:border-white bg-[#F5EEDB]/50 dark:bg-zinc-800/60">
                      <span className="font-mono text-[10px] uppercase font-bold text-black/60 dark:text-white/60 block">
                        PLACED
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-base font-black">{placedStudents}</span>
                        <span className="font-mono text-[9px] font-black text-black bg-[#86EFAC] px-1 rounded border border-black">
                          {placementRate}%
                        </span>
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-2.5 rounded-neo border-2 border-black dark:border-white bg-[#F5EEDB]/50 dark:bg-zinc-800/60">
                      <span className="font-mono text-[10px] uppercase font-bold text-black/60 dark:text-white/60 block">
                        TOP OFFER
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="font-mono text-base font-black">₹{highestCtc}L</span>
                        <span className="font-mono text-[9px] font-black text-black bg-[#FF70A6] px-1 rounded border border-black">
                          CTC
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Window Chart Graph Area */}
                  <div className="p-3.5 rounded-neo border-2 border-black dark:border-white bg-[#F5EEDB]/30 dark:bg-zinc-800/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>OFFERS EXTENDED BY STAGE</span>
                      <span className="text-[10px] text-black/60 dark:text-white/60">LIVE PIPELINE</span>
                    </div>

                    {/* Dynamic Graphic Pipeline */}
                    <div className="relative pt-2 pb-1">
                      <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
                        <div className="p-2 rounded border border-black bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000]">
                          <span className="text-zinc-500 block text-[9px]">Applied</span>
                          <span className="font-black text-xs">{applications.length}</span>
                        </div>
                        <div className="p-2 rounded border border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]">
                          <span className="text-black/70 block text-[9px]">Shortlist</span>
                          <span className="font-black text-xs">
                            {applications.filter((a) => a.stage !== "APPLIED" && a.stage !== "REJECTED").length}
                          </span>
                        </div>
                        <div className="p-2 rounded border border-black bg-[#7DD3FC] text-black shadow-[2px_2px_0px_0px_#000]">
                          <span className="text-black/70 block text-[9px]">Tech OA</span>
                          <span className="font-black text-xs">
                            {applications.filter((a) => a.stage === "IN_INTERVIEW" || a.stage === "SELECTED").length}
                          </span>
                        </div>
                        <div className="p-2 rounded border border-black bg-[#A388EE] text-black shadow-[2px_2px_0px_0px_#000]">
                          <span className="text-black/70 block text-[9px]">HR Meet</span>
                          <span className="font-black text-xs">
                            {applications.filter((a) => a.stage === "IN_INTERVIEW").length}
                          </span>
                        </div>
                        <div className="p-2 rounded border border-black bg-[#86EFAC] text-black shadow-[2px_2px_0px_0px_#000]">
                          <span className="text-black/70 block text-[9px]">Selected</span>
                          <span className="font-black text-xs">{totalOffers}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-[9px] font-mono font-bold text-black/50 dark:text-white/50 pt-1">
                      <span>TOTAL APPLICATIONS: {applications.length}</span>
                      <span>ACTIVE DRIVES: {activeJobs.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Neobrutalist Ticker Banner */}
      <div className="bg-[#FFE600] text-black border-b-2 border-black py-2.5 overflow-hidden select-none">
        <div className="flex items-center justify-around gap-6 font-mono font-black text-xs uppercase tracking-widest whitespace-nowrap">
          <span>★ {placementRate}% Cohort Placed</span>
          <span>•</span>
          <span>₹{highestCtc} LPA Highest Active Offer</span>
          <span>•</span>
          <span>Single Offer Policy Enforced</span>
          <span>•</span>
          <span>Cryptographic TPO Verification</span>
          <span>•</span>
          <span>{activeRecruiters} Corporate Partners Approved</span>
          <span>•</span>
          <span>NAAC Grade A++ Autonomous</span>
        </div>
      </div>

      {/* 5. Real-Time Telemetry Proof Strip */}
      <section id="metrics" className="py-14 bg-surface border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-black">
                // Live Telemetry
              </span>
              <h2 className="font-headline-sm text-2xl font-black text-black dark:text-white uppercase">
                AY 2024–25 Placement Telemetry
              </h2>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-neo bg-[#86EFAC] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              VERIFIED LIVE DATA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-neo border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-bold">
                Cohort Placement Index
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-black text-black dark:text-white">{placementRate}%</span>
                  <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Live
                  </span>
                </div>
                <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1">
                  {placedStudents} placed of {totalStudents} candidates
                </p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-neo border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-bold">
                Highest Active CTC
              </span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-black text-black dark:text-white">₹{highestCtc}</span>
                  <span className="font-mono text-sm font-black text-[#7C3AED] dark:text-[#A78BFA]">LPA</span>
                </div>
                <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1">
                  Active Verified Recruitment Drives
                </p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-neo border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-bold">
                Average Active CTC
              </span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-black text-black dark:text-white">₹{avgCtc}</span>
                  <span className="font-mono text-sm font-black text-[#7C3AED] dark:text-[#A78BFA]">LPA</span>
                </div>
                <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1">
                  Across all verified drives
                </p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-neo border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-bold">
                Active Corporate Partners
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-black text-black dark:text-white">{activeRecruiters}</span>
                  <span className="font-mono text-xs text-black/60 dark:text-white/60 font-bold">Approved</span>
                </div>
                <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1">
                  {companies.length} total registered companies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Core Policy Architecture Cards */}
      <section id="architecture" className="py-16 bg-surface border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-black">
              // Engineering Architecture
            </span>
            <h2 className="font-headline-lg text-3xl sm:text-4xl font-black text-black dark:text-white uppercase tracking-tight">
              Rigid Rules. Zero Manual Bypasses.
            </h2>
            <p className="text-sm font-medium text-black/70 dark:text-white/70">
              Every stage of recruitment is codified into rigid deterministic validation checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFE600] text-black p-5 rounded-neo border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <div className="w-10 h-10 rounded-neo bg-black text-white flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-headline-sm text-base font-black uppercase">
                Deterministic Eligibility
              </h3>
              <p className="text-xs font-medium leading-relaxed text-black/80">
                Live CGPA cutoffs, active backlogs, secondary schooling marks, and eligible branches evaluated to the exact millisecond.
              </p>
            </div>

            <div className="bg-[#7DD3FC] text-black p-5 rounded-neo border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <div className="w-10 h-10 rounded-neo bg-black text-white flex items-center justify-center font-black">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-headline-sm text-base font-black uppercase">
                Single-Offer Governance
              </h3>
              <p className="text-xs font-medium leading-relaxed text-black/80">
                Automated locking prevents candidates from hoarding standard offers while permitting Dream Tier opportunities above cutoff.
              </p>
            </div>

            <div className="bg-[#86EFAC] text-black p-5 rounded-neo border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <div className="w-10 h-10 rounded-neo bg-black text-white flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-headline-sm text-base font-black uppercase">
                Contact Data Masking
              </h3>
              <p className="text-xs font-medium leading-relaxed text-black/80">
                Student email and phone numbers remain cryptographically masked from corporate recruiters until advancement beyond applied stage.
              </p>
            </div>

            <div className="bg-[#FF70A6] text-black p-5 rounded-neo border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-3">
              <div className="w-10 h-10 rounded-neo bg-black text-white flex items-center justify-center font-black">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-headline-sm text-base font-black uppercase">
                Audit Trail Integrity
              </h3>
              <p className="text-xs font-medium leading-relaxed text-black/80">
                Immutable audit ledger tracks every status change, credential verification, and offer extension with actor signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Institutional Role Portals */}
      <section id="portals" className="py-16 bg-[#F5EEDB] dark:bg-zinc-900 border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-black">
              // Access Portals
            </span>
            <h2 className="font-headline-lg text-3xl font-black text-black dark:text-white uppercase">
              Role-Specific Operations Desks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-neo border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-neo bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg uppercase text-black dark:text-white">
                  Student Portal
                </h3>
                <p className="text-xs text-black/70 dark:text-white/70">
                  Real-time eligibility checking, drive applications, interview schedules, and offer acceptance.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <span>Student Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Recruiter */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-neo border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-neo bg-[#7DD3FC] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg uppercase text-black dark:text-white">
                  Corporate Portal
                </h3>
                <p className="text-xs text-black/70 dark:text-white/70">
                  Recruiter drive authoring, 5-stage candidate Kanban pipelines, interview scheduling, and selection.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-neo bg-[#7DD3FC] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <span>Recruiter Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* TPO */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-neo border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-neo bg-[#86EFAC] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg uppercase text-black dark:text-white">
                  TPO Officer
                </h3>
                <p className="text-xs text-black/70 dark:text-white/70">
                  Verification of student credentials, company approvals, drive publications, and placement stats.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-neo bg-[#86EFAC] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <span>TPO Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Admin */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-neo border-2 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-neo bg-[#FF70A6] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg uppercase text-black dark:text-white">
                  Administrator
                </h3>
                <p className="text-xs text-black/70 dark:text-white/70">
                  Single offer dream CTC thresholds, academic department controls, and immutable security audit log trail.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-neo bg-[#FF70A6] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <span>Admin Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Live Campus Drives Section - Strictly Real Time */}
      <section id="drives" className="py-16 bg-surface border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-black/60 dark:text-white/60 font-black">
                // Live Campus Recruitment
              </span>
              <h2 className="font-headline-sm text-2xl sm:text-3xl font-black text-black dark:text-white uppercase">
                Active Job Recruitment Drives
              </h2>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black uppercase tracking-wider"
            >
              <span>Sign in to view all {activeJobs.length} active drives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-8 sm:p-12 rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl uppercase tracking-tight text-black dark:text-white">
                No Active Drives Published Yet
              </h3>
              <p className="text-xs sm:text-sm font-medium text-black/70 dark:text-white/70 max-w-md mx-auto">
                Verified campus drives will appear here in real-time as soon as registered recruiters submit drives and TPO approves them.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-neo bg-[#7DD3FC] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Recruiter Sign In
                </Link>
                <Link
                  to="/register/student"
                  className="px-4 py-2.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Register as Student
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-neo border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-black bg-[#FFE600] px-2.5 py-1 rounded-neo border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                      ₹{job.ctc_lpa.toFixed(2)} LPA
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-neo bg-[#86EFAC] text-black font-black border border-black">
                      ACTIVE
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-black dark:text-white uppercase">
                      {job.company_name}
                    </h4>
                    <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-1">
                      {job.title}
                    </p>
                  </div>
                  <div className="pt-3 border-t-2 border-black dark:border-white flex items-center justify-between text-[11px] font-mono font-bold text-black dark:text-white">
                    <span>Min CGPA: {job.min_cgpa.toFixed(1)}</span>
                    <span className="bg-[#FFE600] text-black px-1.5 py-0.5 rounded border border-black">
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 9. Neobrutalist Institutional Footer */}
      <footer className="mt-auto bg-white dark:bg-zinc-900 border-t-2 border-black dark:border-white py-12 text-black dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-black dark:border-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-neo bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                  CP
                </div>
                <span className="font-black text-base uppercase tracking-tight">
                  CPMS • College Placement Operating System
                </span>
              </div>
              <p className="text-xs font-medium text-black/70 dark:text-white/70">
                Autonomous Institute of Technology & Science • Training & Placement Cell
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider font-mono">
              <Link to="/login" className="hover:underline">
                Sign In
              </Link>
              <Link to="/register/student" className="hover:underline">
                Student Intake
              </Link>
              <Link to="/login" className="hover:underline">
                Portal Access
              </Link>
              <a href="#architecture" className="hover:underline">
                Rules & Governance
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#86EFAC] inline-block border border-black"></span>
              <span>Deterministic Real-Time Sync Active ({totalStudents} Students · {activeJobs.length} Drives)</span>
            </div>
            <div>
              CPMS Brutal v3.0 • Neoflux Design Spec
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
