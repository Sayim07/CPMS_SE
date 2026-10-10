import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Lock, Mail, AlertCircle, ShieldAlert } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("asha.roy@college.edu");
  const [password, setPassword] = useState("Passw0rd!x");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    // Simulate incorrect password on test password mismatch
    if (password !== "Passw0rd!x") {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setIsLocked(true);
        setErrorMessage("Account temporarily locked for 15 minutes due to 5 consecutive failed login attempts (REQ-2).");
      } else {
        setErrorMessage(`Invalid email or password. Attempt ${nextFailed} of 5 before lockout.`);
      }
      return;
    }

    // Role-based redirection per AppFlow.md §2.1
    if (email.includes("college.edu") && !email.includes("tpo") && !email.includes("admin")) {
      setRole("STUDENT");
      navigate("/student");
    } else if (email.includes("acme") || email.includes("company")) {
      setRole("COMPANY");
      navigate("/company");
    } else if (email.includes("tpo")) {
      setRole("TPO");
      navigate("/tpo");
    } else if (email.includes("admin")) {
      setRole("ADMIN");
      navigate("/admin");
    } else {
      setRole("STUDENT");
      navigate("/student");
    }
  };

  const quickSwitch = (role: Role, testEmail: string) => {
    setRole(role);
    setEmail(testEmail);
    setPassword("Passw0rd!x");
    navigate(`/${role.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header per Design.md §0 */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          College Placement Management System (CPMS)
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          "Verified placements, fewer mistakes."
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your institutional credentials</p>
          </div>

          {/* Account Lockout Banner (REQ-2 / HTTP 423) */}
          {isLocked && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Account Locked (HTTP 423)</p>
                <p className="text-red-700 mt-0.5">{errorMessage}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLocked(false);
                    setFailedAttempts(0);
                    setErrorMessage(null);
                  }}
                  className="mt-2 text-xs h-6 bg-white border-red-200 text-red-700 hover:bg-red-50"
                >
                  Reset Lockout Simulator
                </Button>
              </div>
            </div>
          )}

          {errorMessage && !isLocked && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: Passw0rd!x</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  disabled={isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLocked}
              className="w-full text-xs font-semibold"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Role Jumper */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick Prototype Role Access:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickSwitch("STUDENT", "asha.roy@college.edu")}
                className="p-2 rounded border border-slate-200 hover:bg-slate-50 text-left"
              >
                <p className="font-semibold text-slate-800">Student</p>
                <p className="text-[10px] text-slate-400">Asha Roy (CSE)</p>
              </button>
              <button
                type="button"
                onClick={() => quickSwitch("COMPANY", "hr@acmecorp.com")}
                className="p-2 rounded border border-slate-200 hover:bg-slate-50 text-left"
              >
                <p className="font-semibold text-slate-800">Company</p>
                <p className="text-[10px] text-slate-400">Acme Technologies</p>
              </button>
              <button
                type="button"
                onClick={() => quickSwitch("TPO", "tpo@college.edu")}
                className="p-2 rounded border border-slate-200 hover:bg-slate-50 text-left"
              >
                <p className="font-semibold text-slate-800">TPO</p>
                <p className="text-[10px] text-slate-400">Dr. Arvind Sharma</p>
              </button>
              <button
                type="button"
                onClick={() => quickSwitch("ADMIN", "admin@college.edu")}
                className="p-2 rounded border border-slate-200 hover:bg-slate-50 text-left"
              >
                <p className="font-semibold text-slate-800">Admin</p>
                <p className="text-[10px] text-slate-400">System Admin</p>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="pt-2 text-center text-xs text-slate-500 space-x-4">
            <Link to="/register/student" className="text-indigo-600 hover:underline">
              Student Register
            </Link>
            <span>·</span>
            <Link to="/register/company" className="text-indigo-600 hover:underline">
              Recruiter Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
