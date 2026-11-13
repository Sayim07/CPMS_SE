import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui/Button";
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
  GraduationCap,
  Building2,
  ShieldCheck,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("STUDENT");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ROLES: Array<{
    role: Role;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      role: "STUDENT",
      label: "Student",
      sublabel: "Roll / Email",
      icon: <GraduationCap className="w-4 h-4" />,
      color: "bg-[#FFE600]",
    },
    {
      role: "COMPANY",
      label: "Recruiter",
      sublabel: "Corporate HR",
      icon: <Building2 className="w-4 h-4" />,
      color: "bg-[#7DD3FC]",
    },
    {
      role: "TPO",
      label: "TPO Officer",
      sublabel: "Placement Cell",
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "bg-[#86EFAC]",
    },
    {
      role: "ADMIN",
      label: "Admin",
      sublabel: "Governance",
      icon: <Sliders className="w-4 h-4" />,
      color: "bg-[#FF70A6]",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered email address or roll number.");
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    // Call real Auth engine validating Email + Password + matching Selected Role
    const res = await login(trimmedEmail, trimmedPassword, selectedRole);

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

    // Credentials, password and selected role verified: navigate to respective portal
    navigate(`/${selectedRole.toLowerCase()}`);
  };

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
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-8 border-2 border-black dark:border-white rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div>
              <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wider">
                Sign In to Account
              </h2>
              <p className="text-[11px] font-mono text-black/60 dark:text-white/60">
                Enter your credentials and select your authorized role
              </p>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]">
              SECURE
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
                  placeholder={
                    selectedRole === "STUDENT"
                      ? "Enter college email or roll number"
                      : selectedRole === "COMPANY"
                      ? "Enter corporate recruiter email"
                      : selectedRole === "TPO"
                      ? "tpo@college.edu"
                      : "admin@college.edu"
                  }
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
                  {selectedRole === "ADMIN" ? "(Master: sayim007s)" : ""}
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

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      className={`p-2.5 rounded-neo border-2 border-black dark:border-white text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? `${r.color} text-black font-black shadow-[3px_3px_0px_0px_#000] translate-x-[1px] translate-y-[1px]`
                          : "bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-[#FAF7EE] dark:hover:bg-zinc-700 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded border border-black bg-white text-black shrink-0">
                          {r.icon}
                        </div>
                        <div className="truncate">
                          <p className="font-black text-xs leading-tight">{r.label}</p>
                          <p className="text-[10px] opacity-75 font-mono truncate">{r.sublabel}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-black shrink-0 ml-1 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLocked || isLoading}
              className="w-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoading ? "Authenticating..." : `Sign In as ${selectedRole}`}
            </Button>
          </form>

          {/* Registration Helper Links - Only Student Self-Registration is Public */}
          <div className="pt-4 border-t-2 border-black dark:border-white space-y-2">
            <p className="text-[11px] font-mono text-center text-black/70 dark:text-white/70">
              New Student Admission / Enrollment?
            </p>
            <div>
              <Link
                to="/register/student"
                className="w-full p-2.5 rounded-neo bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] text-center font-black transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>+ Register as Student →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
