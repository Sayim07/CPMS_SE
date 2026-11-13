import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDynamicData } from "../../hooks/useDynamicData";
import { Button } from "../../components/ui/Button";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const RegisterCompanyPage: React.FC = () => {
  const { setUser } = useAuth();
  const { registerCompany } = useDynamicData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    gstTaxId: "",
    contactPerson: "",
    email: "",
    contactPhone: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create real company in real-time persistent store
    const created = registerCompany({
      name: formData.companyName.trim(),
      website: formData.website.trim(),
      gst_tax_id: formData.gstTaxId.trim().toUpperCase(),
      contact_person: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.contactPhone.trim(),
    });

    // Set authenticated session directly to this newly registered company
    setUser({
      id: created.id,
      email: created.email || formData.email.trim(),
      fullName: created.contact_person || created.company_name,
      role: "COMPANY",
      companyName: created.company_name,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate("/company");
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
          Corporate Recruiter Intake
        </h1>
        <p className="mt-1 text-xs font-mono font-bold text-black/70 dark:text-white/70">
          Register organizational partner to post drives and recruit from accredited cohorts
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 sm:px-8 border-2 border-black dark:border-white rounded-neo shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
            <div>
              <h2 className="text-base font-black text-black dark:text-white uppercase tracking-wider">
                Recruiter Registration Form
              </h2>
              <p className="text-[11px] font-mono text-black/60 dark:text-white/60">
                Requires TPO corporate verification before posting drives (AppFlow.md §1).
              </p>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-neo bg-[#FFE600] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]">
              REAL-TIME
            </span>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-neo bg-[#86EFAC] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
              <span>Company submitted in real-time! Redirecting to corporate dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google India / Atlassian"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  GST / Tax ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstTaxId}
                  onChange={(e) => setFormData({ ...formData, gstTaxId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-mono font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Recruiter / HR Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
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
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Corporate Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="hr@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-neo text-black dark:text-white font-medium shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                  Password
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
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs font-black uppercase tracking-wider mt-4"
            >
              Submit Corporate Intake & Enter Dashboard
            </Button>
          </form>

          <div className="pt-2 text-center text-xs font-bold text-black dark:text-white space-x-2 border-t-2 border-black dark:border-white">
            <span>Already registered?</span>
            <Link to="/login" className="underline hover:text-[#7C3AED]">
              Sign In to Recruiter Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompanyPage;
