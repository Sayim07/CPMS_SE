import { Router, Request, Response } from "express";
import {
  getPlacementSummary,
  getUnplacedStudents,
  generatePlacementCsv,
  generateUnplacedCsv,
  generatePlacementPdf,
} from "../services/reports";

export const reportsRouter = Router();

// GET /api/v1/reports/placement-summary?batch_year=2026
reportsRouter.get("/placement-summary", async (req: Request, res: Response) => {
  const batchYear = req.query.batch_year
    ? parseInt(req.query.batch_year as string, 10)
    : new Date().getFullYear();

  if (isNaN(batchYear)) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid batch_year query parameter." },
    });
  }

  const summary = await getPlacementSummary(batchYear);
  res.status(200).json({ data: summary });
});

// GET /api/v1/reports/export?batch_year=2026&format=csv|pdf
reportsRouter.get("/export", async (req: Request, res: Response) => {
  const batchYear = req.query.batch_year
    ? parseInt(req.query.batch_year as string, 10)
    : new Date().getFullYear();
  const format = (req.query.format as string) || "csv";

  if (isNaN(batchYear)) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid batch_year parameter." },
    });
  }

  if (format === "csv") {
    const csvContent = await generatePlacementCsv(batchYear);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="cpms-placement-${batchYear}.csv"`
    );
    return res.status(200).send(csvContent);
  } else if (format === "pdf") {
    const summary = await getPlacementSummary(batchYear);
    const pdfStream = generatePlacementPdf(summary);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="cpms-placement-${batchYear}.pdf"`
    );
    return pdfStream.pipe(res);
  } else {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Format must be 'csv' or 'pdf'." },
    });
  }
});

// GET /api/v1/reports/unplaced?batch_year=2026&format=json|csv
reportsRouter.get("/unplaced", async (req: Request, res: Response) => {
  const batchYear = req.query.batch_year
    ? parseInt(req.query.batch_year as string, 10)
    : new Date().getFullYear();
  const format = (req.query.format as string) || "json";

  if (isNaN(batchYear)) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Invalid batch_year parameter." },
    });
  }

  if (format === "csv") {
    const csvContent = await generateUnplacedCsv(batchYear);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="cpms-unplaced-${batchYear}.csv"`
    );
    return res.status(200).send(csvContent);
  }

  const unplacedList = await getUnplacedStudents(batchYear);
  res.status(200).json({ data: unplacedList });
});
