import { ApplicationStage, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { stringify } from "csv-stringify/sync";
import PDFDocument from "pdfkit";

export interface PlacementSummaryData {
  batch_year: number;
  eligible_students: number;
  placed_students: number;
  placement_rate_pct: number;
  average_ctc_lpa: number;
  by_department: Array<{
    department_code: string;
    eligible: number;
    placed: number;
    placement_rate_pct: number;
  }>;
  top_companies: Array<{
    company_name: string;
    selections: number;
  }>;
}

export interface UnplacedStudentData {
  id: string;
  roll_no: string;
  full_name: string;
  department_code: string;
  cgpa: number;
  active_backlogs: number;
  email: string;
  phone: string;
}

/**
 * Calculates placement summary metrics conforming to Schema.md §1 & §5.8
 */
export async function getPlacementSummary(batchYear: number): Promise<PlacementSummaryData> {
  // 1. Load all verified, non-deleted students of the batch
  const students = await prisma.student.findMany({
    where: {
      batch_year: batchYear,
      is_verified: true,
      deleted_at: null,
    },
    include: {
      department: true,
      applications: {
        where: { stage: ApplicationStage.SELECTED, deleted_at: null },
        include: {
          job: {
            include: { company: true },
          },
        },
      },
    },
  });

  const eligible_students = students.length;
  if (eligible_students === 0) {
    return {
      batch_year: batchYear,
      eligible_students: 0,
      placed_students: 0,
      placement_rate_pct: 0,
      average_ctc_lpa: 0,
      by_department: [],
      top_companies: [],
    };
  }

  // Filter placed students and find their highest CTC offer
  const placedStudentsList = students.filter((s) => s.applications.length > 0);
  const placed_students = placedStudentsList.length;
  const placement_rate_pct = Number(
    ((placed_students / eligible_students) * 100).toFixed(2)
  );

  let totalHighestCtc = 0;
  const companySelectionsMap: Record<string, number> = {};

  for (const s of placedStudentsList) {
    let highestCtc = 0;
    for (const app of s.applications) {
      const ctc = Number(app.job.ctc_lpa);
      if (ctc > highestCtc) highestCtc = ctc;

      const compName = app.job.company.company_name;
      companySelectionsMap[compName] = (companySelectionsMap[compName] || 0) + 1;
    }
    totalHighestCtc += highestCtc;
  }

  const average_ctc_lpa =
    placed_students > 0 ? Number((totalHighestCtc / placed_students).toFixed(2)) : 0;

  // Breakdown by department
  const deptMap: Record<string, { eligible: number; placed: number }> = {};
  for (const s of students) {
    const code = s.department.code;
    if (!deptMap[code]) deptMap[code] = { eligible: 0, placed: 0 };
    deptMap[code].eligible += 1;
    if (s.applications.length > 0) {
      deptMap[code].placed += 1;
    }
  }

  const by_department = Object.entries(deptMap).map(([code, counts]) => ({
    department_code: code,
    eligible: counts.eligible,
    placed: counts.placed,
    placement_rate_pct:
      counts.eligible > 0
        ? Number(((counts.placed / counts.eligible) * 100).toFixed(2))
        : 0,
  }));

  // Top companies sorted by selections descending
  const top_companies = Object.entries(companySelectionsMap)
    .map(([company_name, selections]) => ({ company_name, selections }))
    .sort((a, b) => b.selections - a.selections)
    .slice(0, 10);

  return {
    batch_year: batchYear,
    eligible_students,
    placed_students,
    placement_rate_pct,
    average_ctc_lpa,
    by_department,
    top_companies,
  };
}

/**
 * Returns all verified eligible students who are still UNPLACED (REQ-18)
 */
export async function getUnplacedStudents(batchYear: number): Promise<UnplacedStudentData[]> {
  const students = await prisma.student.findMany({
    where: {
      batch_year: batchYear,
      is_verified: true,
      deleted_at: null,
      applications: {
        none: {
          stage: ApplicationStage.SELECTED,
        },
      },
    },
    include: {
      user: true,
      department: true,
    },
    orderBy: [{ department: { code: "asc" } }, { cgpa: "desc" }],
  });

  return students.map((s) => ({
    id: s.id,
    roll_no: s.roll_no,
    full_name: s.user.full_name,
    department_code: s.department.code,
    cgpa: Number(s.cgpa),
    active_backlogs: s.active_backlogs,
    email: s.user.email,
    phone: s.phone,
  }));
}

/**
 * Generates CSV string for placement records
 */
export async function generatePlacementCsv(batchYear: number): Promise<string> {
  const students = await prisma.student.findMany({
    where: { batch_year: batchYear, is_verified: true, deleted_at: null },
    include: {
      user: true,
      department: true,
      applications: {
        where: { stage: ApplicationStage.SELECTED },
        include: { job: { include: { company: true } } },
      },
    },
    orderBy: { roll_no: "asc" },
  });

  const records = students.map((s) => {
    const selectedApp = s.applications[0];
    return {
      "Roll Number": s.roll_no,
      "Full Name": s.user.full_name,
      Department: s.department.code,
      CGPA: Number(s.cgpa),
      Status: selectedApp ? "PLACED" : "UNPLACED",
      Company: selectedApp ? selectedApp.job.company.company_name : "N/A",
      "CTC (LPA)": selectedApp ? Number(selectedApp.job.ctc_lpa) : 0,
    };
  });

  return stringify(records, { header: true });
}

/**
 * Generates CSV string for unplaced student records
 */
export async function generateUnplacedCsv(batchYear: number): Promise<string> {
  const unplaced = await getUnplacedStudents(batchYear);
  const records = unplaced.map((s) => ({
    "Roll Number": s.roll_no,
    "Full Name": s.full_name,
    Department: s.department_code,
    CGPA: s.cgpa,
    Backlogs: s.active_backlogs,
    Email: s.email,
    Phone: s.phone,
  }));

  return stringify(records, { header: true });
}

/**
 * Streams formatted PDF report using PDFKit
 */
export function generatePlacementPdf(summary: PlacementSummaryData): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(20).text("College Placement Management System", { align: "center" });
  doc.fontSize(14).text(`Institutional Placement Report — Batch ${summary.batch_year}`, {
    align: "center",
  });
  doc.moveDown(2);

  // Executive KPI Summary
  doc.fontSize(12).text(`Total Verified Candidates: ${summary.eligible_students}`);
  doc.text(`Successfully Placed: ${summary.placed_students}`);
  doc.text(`Institutional Placement Rate: ${summary.placement_rate_pct}%`);
  doc.text(`Average CTC Package: ${summary.average_ctc_lpa} LPA`);
  doc.moveDown(2);

  // Department Table
  doc.fontSize(14).text("Department Breakdown", { underline: true });
  doc.fontSize(10);
  doc.moveDown(0.5);

  summary.by_department.forEach((d) => {
    doc.text(
      `${d.department_code}: ${d.placed} / ${d.eligible} Placed (${d.placement_rate_pct}%)`
    );
  });
  doc.moveDown(2);

  // Top Hiring Partners
  doc.fontSize(14).text("Top Hiring Partners", { underline: true });
  doc.fontSize(10);
  doc.moveDown(0.5);

  if (summary.top_companies.length === 0) {
    doc.text("No corporate placement selections recorded yet.");
  } else {
    summary.top_companies.forEach((c, idx) => {
      doc.text(`${idx + 1}. ${c.company_name} — ${c.selections} Offers`);
    });
  }

  doc.end();
  return doc;
}
