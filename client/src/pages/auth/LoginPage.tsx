import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../../context/AuthContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui/Button";
import { Lock, Mail, AlertCircle, Loader2, Sun, Moon, ArrowLeft } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, setRole, isLoading } = useAuth();
  const { students, companies } = useDynamicData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setErrorMessage(null);

    // Call real Auth engine
    const res = await login(email, password);

    if (res.locked) {
      setIsLocked(true);
      setErrorMessage(
        res.message ||
          "Account temporarily locked for 15 minutes due to 5 consecutive failed login attempts (REQ-2)."
      );
      return;
    }

    if (!res.success) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      setErrorMessage(res.message || `Invalid credentials. Attempt ${nextFailed} of 5.`);
      return;
    }

    // Role-based redirection per AppFlow.md §2.1
    const target = email.toLowerCase().trim();
    if (target.includes("tpo")) {
      navigate("/tpo");
    } else if (target.includes("admin")) {
      navigate("/admin");
    } else if (companies.some((c) => c.email && c.email.toLowerCase() === target)) {
      navigate("/company");
    } else {
      navigate("/student");
    }
  };

  const quickSwitch = (role: Role, testEmail?: string) => {
    setRole(role);
    if (testEmail) {
      setEmail(testEmail);
      setPassword("Passw0rd!x");
    }
    navigate(`/${role.toLowerCase()}`);
  };

  const firstStudent = students.length > 0 ? students[0] : null;
  const firstCompany = companies.length > 0 ? companies[0] : null;

  return (
    <div className="min-h-screen bg-[#F5EEDB] dark:bg-[#141418] neo-grid-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black dark:text-white transition-colors duration-200">
      {/* Top Bar Navigation */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-neo bg-[#FFE600] border-2 border-black dark:border-white text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 text-black" />
          ) : (
            <Sun className="w-4 h-4 text-black" />
          )}
        </button>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block" title="Back to CPMS Home">
          <div className="w-12 h-12 mx-auto mb-3 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center justify-center font-black text-lg tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
            CP
          </div>
        </Link>
        <h1 className="font-headline-sm text-2xl font-black tracking-tight text-black dark:text-white uppercase">
          College Placement Portal
        </h1>
        <p className="mt-1 text-xs font-mono font-bold text-black/70 dark:text-white/70">
          Deterministic Role-Based Identity & Session Governance
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-8 border-2 border-black dark:border-white rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div>
              <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wider">
                Sign In to Account
              </h2>
              <p className="text-[11px] font-mono text-black/60 dark:text-white/60">
                Institutional single sign-on & corporate recruiter credentials
              </p>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]">
              REAL-TIME
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-neo bg-[#FF70A6] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-black shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                Email Address or Roll Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-black dark:text-white absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter email or institutional ID"
                  value={email}
                  disabled={isLocked || isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Password
                </label>
                <span className="text-[10px] text-black/60 dark:text-white/60 font-mono font-bold">
                  (Default: Passw0rd!x)
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-black dark:text-white absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  disabled={isLocked || isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLocked || isLoading}
              className="w-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoading ? "Authenticating..." : "Sign In to Portal"}
            </Button>
          </form>

          {/* Quick Demo Role Jumper */}
          <div className="pt-4 border-t-2 border-black dark:border-white">
            <p className="text-[11px] font-mono font-black uppercase tracking-wider text-black/60 dark:text-white/60 mb-2">
              // Quick 1-Click Role Access:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {firstStudent ? (
                <button
                  type="button"
                  onClick={() => quickSwitch("STUDENT", firstStudent.email)}
                  className="p-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-[#FFE600] hover:text-black text-left transition-all"
                >
                  <p className="font-black text-black dark:text-white">Student</p>
                  <p className="text-[10px] text-black/70 dark:text-white/70 font-mono truncate">
                    {firstStudent.full_name} ({firstStudent.roll_no})
                  </p>
                </button>
              ) : (
                <Link
                  to="/register/student"
                  className="p-2 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-left transition-all block"
                >
                  <p className="font-black">Student</p>
                  <p className="text-[10px] font-mono font-bold">+ Register First →</p>
                </Link>
              )}

              {firstCompany ? (
                <button
                  type="button"
                  onClick={() => quickSwitch("COMPANY", firstCompany.email)}
                  className="p-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-[#7DD3FC] hover:text-black text-left transition-all"
                >
                  <p className="font-black text-black dark:text-white">Company</p>
                  <p className="text-[10px] text-black/70 dark:text-white/70 font-mono truncate">
                    {firstCompany.company_name}
                  </p>
                </button>
              ) : (
                <Link
                  to="/register/company"
                  className="p-2 rounded-neo bg-[#7DD3FC] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-left transition-all block"
                >
                  <p className="font-black">Company</p>
                  <p className="text-[10px] font-mono font-bold">+ Register First →</p>
                </Link>
              )}

              <button
                type="button"
                onClick={() => quickSwitch("TPO", "tpo@college.edu")}
                className="p-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-[#86EFAC] hover:text-black text-left transition-all"
              >
                <p className="font-black text-black dark:text-white">TPO Officer</p>
                <p className="text-[10px] text-black/70 dark:text-white/70 font-mono">Dr. Sharma</p>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch("ADMIN", "admin@college.edu")}
                className="p-2 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-[#FF70A6] hover:text-black text-left transition-all"
              >
                <p className="font-black text-black dark:text-white">Admin</p>
                <p className="text-[10px] text-black/70 dark:text-white/70 font-mono">System Admin</p>
              </button>
            </div>
          </div>

          {/* Registration Links */}
          <div className="pt-2 text-center text-xs font-bold text-black dark:text-white space-x-4 border-t-2 border-black dark:border-white">
            <Link to="/register/student" className="underline hover:text-[#7C3AED]">
              Student Register
            </Link>
            <span>·</span>
            <Link to="/register/company" className="underline hover:text-[#7C3AED]">
              Recruiter Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
