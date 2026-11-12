import React from "react";
import { Link } from "react-router-dom";
import { useDynamicData } from "../../hooks/useDynamicData";
import {
  Clock,
  ArrowRight,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

export const StudentDashboardPage: React.FC = () => {
  const { currentStudent, students, jobs, applications } = useDynamicData();

  const activeDrives = (jobs || []).filter((j) => j?.status === "ACTIVE");
  const myApplications = (applications || []).filter((a) => a?.student_id === currentStudent?.id);
  const myOffers = myApplications.filter((a) => a?.stage === "SELECTED");

  // Dynamic real-time calculations
  const totalStudents = students ? students.length : 0;
  const placedStudents = (students || []).filter((s) => s?.placement_status === "PLACED").length;
  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : "0.0";
  const validCtcs = (jobs || []).map((j) => (typeof j?.ctc_lpa === "number" ? j.ctc_lpa : 0));
  const highestCtc = validCtcs.length > 0 ? Math.max(...validCtcs, 0).toFixed(1) : "0.0";
  const avgCtc = validCtcs.length > 0
    ? (validCtcs.reduce((acc, ctc) => acc + ctc, 0) / validCtcs.length).toFixed(1)
    : "0.0";
  const uniqueCompanies = new Set((jobs || []).map((j) => j?.company_name || "Company")).size;

  return (
    <div className="flex flex-col w-full space-y-5 text-black dark:text-white">
      {/* Top Telemetry & Control Header - Neobrutalism Style */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 sm:p-5 rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-[#86EFAC] border border-black animate-pulse"></span>
            <h1 className="font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight">
              Institutional Placement Overview
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]">
              LIVE DATA
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-neo bg-[#7DD3FC] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]">
              STUDENT: {currentStudent?.roll_no || "PORTAL"}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-1">
            Real-time cohort telemetry, active recruitment drives, and student placement pipeline validation.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-neo bg-[#F5EEDB] dark:bg-zinc-800 text-black dark:text-white text-xs border-2 border-black dark:border-white font-mono font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            <Clock className="w-3.5 h-3.5" />
            <span>SEASON 2026</span>
          </div>

          <Link
            to="/student/jobs"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-neo bg-[#FFE600] text-black border-2 border-black text-xs font-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Browse Drives ({activeDrives.length})</span>
          </Link>
        </div>
      </div>

      {/* Registration or Verification Notice */}
      {!currentStudent ? (
        <div className="bg-[#FFE600] border-2 border-black p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-black">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">
                No Student Profile Linked
              </h4>
              <p className="text-xs font-medium text-black/90">
                You are currently browsing without a student profile. Register your student intake profile to apply for campus drives.
              </p>
            </div>
          </div>
          <Link
            to="/register/student"
            className="px-3.5 py-1.5 rounded-neo bg-black text-[#FFE600] border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 shrink-0 inline-block text-center"
          >
            Register Student Profile →
          </Link>
        </div>
      ) : !currentStudent.is_verified ? (
        <div className="bg-[#FFE600] border-2 border-black p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] flex items-start justify-between text-black">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide">
                Awaiting TPO Verification
              </h4>
              <p className="text-xs font-medium text-black/90 mt-0.5">
                Your academic credentials ({currentStudent.roll_no}) have not yet been approved by the Placement Officer. You can review corporate job drives, but application submissions will be locked until verification is granted.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="px-3 py-1.5 rounded-neo bg-white text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 shrink-0"
          >
            Check Profile
          </Link>
        </div>
      ) : null}

      {/* 4-Column KPI Stats Strip - Dynamic Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Cohort Placement */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold">
              Total Cohort
            </span>
            <span className="font-mono text-[11px] text-black font-black bg-[#86EFAC] border border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#000]">
              {placementRate}% Placed
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-black dark:text-white">{totalStudents}</span>
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">Candidates</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300">
              <span>
                Placed: <strong className="text-black dark:text-white">{placedStudents}</strong>
              </span>
              <span className="font-bold text-black dark:text-white">Active</span>
            </div>
            <div className="w-full bg-[#F5EEDB] dark:bg-zinc-800 border border-black dark:border-white h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#86EFAC] h-full transition-all duration-500"
                style={{ width: `${Math.min(parseFloat(placementRate), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stat 2: Highest Package */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold">
              Highest CTC Package
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#FFE600] text-black border border-black font-black shadow-[1px_1px_0px_0px_#000]">
              VERIFIED
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-black dark:text-white">₹{highestCtc}</span>
              <span className="font-mono text-xs font-black text-black dark:text-white">LPA</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300">
              <span className="truncate">Top Offer Tier</span>
              <span className="font-bold">Active Drives</span>
            </div>
            <div className="w-full bg-[#F5EEDB] dark:bg-zinc-800 border border-black dark:border-white h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#FFE600] h-full" style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>

        {/* Stat 3: Average CTC */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold">
              Average CTC Package
            </span>
            <span className="font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
              Across Drives
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-black dark:text-white">₹{avgCtc}</span>
              <span className="font-mono text-xs font-black text-black dark:text-white">LPA</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300">
              <span>My Applications: <strong className="text-black dark:text-white">{myApplications.length}</strong></span>
              <span className="font-bold text-[#86EFAC]">{myOffers.length} Offers</span>
            </div>
            <div className="w-full bg-[#F5EEDB] dark:bg-zinc-800 border border-black dark:border-white h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#7DD3FC] h-full" style={{ width: "70%" }}></div>
            </div>
          </div>
        </div>

        {/* Stat 4: Active Recruiters */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-bold">
              Active Recruiters
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#A388EE] text-black border border-black font-black shadow-[1px_1px_0px_0px_#000]">
              PARTNERS
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-black dark:text-white">{uniqueCompanies}</span>
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">Companies</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              <span>{activeDrives.length} Open Drives</span>
              <span className="font-bold text-black dark:text-white">Live</span>
            </div>
            <div className="w-full bg-[#F5EEDB] dark:bg-zinc-800 border border-black dark:border-white h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#A388EE] h-full" style={{ width: "85%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Drives Table Queue - Dynamic Real-Time */}
      <div className="bg-white dark:bg-zinc-900 rounded-neo border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] flex flex-col overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-white">
          <div>
            <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wide">
              Featured Placement Drives & Action Queue
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              High-priority active placement opportunities open for your cohort ({activeDrives.length} active).
            </p>
          </div>
          <Link
            to="/student/jobs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <span>View All Drives</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-[#F5EEDB] dark:bg-zinc-800 text-black dark:text-white font-mono text-[11px] uppercase tracking-wider border-b-2 border-black dark:border-white">
                <th className="py-2.5 px-4 font-black">Company Partner</th>
                <th className="py-2.5 px-3 font-black">Target Branches</th>
                <th className="py-2.5 px-3 font-black text-right">Package CTC</th>
                <th className="py-2.5 px-3 font-black">Cutoff Criteria</th>
                <th className="py-2.5 px-3 font-black">Status / Deadline</th>
                <th className="py-2.5 px-4 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 dark:divide-white/10 text-xs">
              {activeDrives.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 font-mono italic">
                    No active campus recruitment drives found.
                  </td>
                </tr>
              ) : (
                activeDrives.slice(0, 6).map((job) => {
                  const companyName = job.company_name || "Corporate Partner";
                  const deptCodes = job.department_codes || ["CSE", "IT"];
                  const isApplied = myApplications.some((a) => a.job_id === job.id);

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-[#FAF7EE] dark:hover:bg-zinc-800/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-neo border border-black bg-[#FFE600] text-black flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-[1px_1px_0px_0px_#000]">
                            {companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-black dark:text-white truncate">
                              {companyName}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                              {job.title}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {deptCodes.map((d) => (
                            <span
                              key={d}
                              className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-black bg-white dark:bg-zinc-800 text-black dark:text-white font-bold"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono text-xs font-black bg-[#FFE600] text-black border border-black px-1.5 py-0.5 rounded">
                          ₹{job.ctc_lpa.toFixed(1)} LPA
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="font-bold text-black dark:text-white">
                            Min CGPA: {job.min_cgpa.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            Backlogs ≤ {job.max_backlogs}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {new Date(job.application_deadline).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isApplied ? (
                          <span className="font-mono text-[10px] font-black px-2.5 py-1 rounded-neo bg-[#86EFAC] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                            APPLIED
                          </span>
                        ) : (
                          <Link
                            to="/student/jobs"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-neo bg-[#7DD3FC] text-black border border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 active:shadow-none transition-all"
                          >
                            <span>Apply</span>
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
