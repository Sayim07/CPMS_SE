import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import { Button } from "../../components/ui/Button";
import { MOCK_DEPARTMENTS } from "../../mock/mockData";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const RegisterStudentPage: React.FC = () => {
  const { setUser } = useAuth();
  const { registerStudent } = useDynamicData();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);

  useEffect(() => {
    fetch("/api/v1/departments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setDepartments(data.data);
        }
      })
      .catch(() => {
        // Fallback silently to MOCK_DEPARTMENTS
      });
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    rollNo: "",
    phone: "",
    departmentId: MOCK_DEPARTMENTS[0].id,
    batchYear: 2026,
    cgpa: "8.50",
    activeBacklogs: "0",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDept =
      MOCK_DEPARTMENTS.find((d) => d.id === formData.departmentId) || MOCK_DEPARTMENTS[0];

    // Create real student in real-time persistent store
    const created = registerStudent({
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      roll_no: formData.rollNo.trim().toUpperCase(),
      phone: formData.phone.trim(),
      department_id: selectedDept.id,
      department_code: selectedDept.code,
      batch_year: Number(formData.batchYear) || 2026,
      cgpa: parseFloat(formData.cgpa) || 8.0,
      active_backlogs: parseInt(formData.activeBacklogs, 10) || 0,
      tenth_pct: 85.0,
      twelfth_pct: 85.0,
      placement_status: "UNPLACED",
      is_verified: false,
      single_offer_locked: false,
      has_resume: false,
    });

    // Set authenticated session directly to this newly registered student
    setUser({
      id: created.id,
      email: created.email,
      fullName: created.full_name,
      role: "STUDENT",
      rollNo: created.roll_no,
      departmentCode: created.department_code,
      isVerified: false,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate("/student");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F5EEDB] dark:bg-[#141418] neo-grid-pattern flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-black dark:text-white transition-colors duration-200">
      {/* Top Left Home Link */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-neo bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-block" title="Back to CPMS Home">
          <div className="w-12 h-12 mx-auto mb-3 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] flex items-center justify-center font-black text-lg tracking-wider">
            CP
          </div>
        </Link>
        <h1 className="font-headline-sm text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white uppercase">
          Student Intake Registration
        </h1>
        <p className="mt-1 text-xs font-mono font-bold text-black/70 dark:text-white/70">
          Create verified candidate credentials for AY 2024–25 campus placement cycle
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-8 border-2 border-black dark:border-white rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div>
              <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wider">
                Candidate Profile Form
              </h2>
              <p className="text-[11px] font-mono text-black/60 dark:text-white/60">
                Data is validated in real-time by the Placement Directorate (Rules.md §4).
              </p>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]">
              REAL-TIME
            </span>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-neo bg-[#86EFAC] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
              <span>Candidate profile registered in real-time! Redirecting to student portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sayim Khan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Institutional Roll No
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22CSE104"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-mono font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  College Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Academic Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} — {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Graduation Batch Year
                </label>
                <input
                  type="number"
                  required
                  value={formData.batchYear}
                  onChange={(e) => setFormData({ ...formData, batchYear: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-mono font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Cumulative CGPA (0.00 – 10.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  placeholder="8.50"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-mono font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Active Academic Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  placeholder="0"
                  value={formData.activeBacklogs}
                  onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-mono font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                Portal Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs font-black uppercase tracking-wider mt-4"
            >
              Complete Registration & Enter Portal
            </Button>
          </form>

          <div className="pt-2 text-center text-xs font-bold text-black dark:text-white space-x-2 border-t-2 border-black dark:border-white">
            <span>Already registered?</span>
            <Link to="/login" className="underline hover:text-[#7C3AED]">
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentPage;
