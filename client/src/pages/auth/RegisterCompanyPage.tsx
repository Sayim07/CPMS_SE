import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export const RegisterCompanyPage: React.FC = () => {
  const { setRole } = useAuth();
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
    setSubmitted(true);
    setTimeout(() => {
      setRole("COMPANY");
      navigate("/company");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          College Placement Management System (CPMS)
        </h1>
        <p className="mt-1 text-xs text-slate-500">Corporate Recruiter Intake & Drive Management</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Register Corporate Partner</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registration requires TPO verification before posting recruitment drives (AppFlow.md §1).
            </p>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Company submitted for TPO approval! Redirecting to recruiter dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Technologies Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  required
                  placeholder="https://company.example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">GST / Tax Identification ID</label>
                <input
                  type="text"
                  required
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstTaxId}
                  onChange={(e) => setFormData({ ...formData, gstTaxId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Recruiter / HR Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravi Menon"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="9000000000"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="hr@acme.example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full font-semibold mt-4">
              Submit Recruiter Registration
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
