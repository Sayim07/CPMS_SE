import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createAuditLog } from "../services/audit";

export const adminRouter = Router();

const updateSettingsSchema = z.object({
  single_offer_ctc_threshold_lpa: z.coerce.number().positive(),
});

// GET /api/v1/admin/settings
adminRouter.get("/settings", async (req: Request, res: Response) => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "single_offer_ctc_threshold_lpa" },
  });

  res.status(200).json({
    data: {
      single_offer_ctc_threshold_lpa: setting ? Number(setting.value) : 8.0,
    },
  });
});

// PUT /api/v1/admin/settings
adminRouter.put("/settings", async (req: Request, res: Response) => {
  const parseResult = updateSettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid threshold value.",
        details: parseResult.error.errors,
      },
    });
  }

  const newValue = String(parseResult.data.single_offer_ctc_threshold_lpa);
  const previous = await prisma.systemSetting.findUnique({
    where: { key: "single_offer_ctc_threshold_lpa" },
  });

  const updated = await prisma.systemSetting.upsert({
    where: { key: "single_offer_ctc_threshold_lpa" },
    update: {
      value: newValue,
      updated_by: req.user!.id,
    },
    create: {
      key: "single_offer_ctc_threshold_lpa",
      value: newValue,
      updated_by: req.user!.id,
    },
  });

  await createAuditLog({
    actorUserId: req.user!.id,
    action: "SETTINGS_CHANGED",
    entityType: "setting",
    metadata: {
      key: "single_offer_ctc_threshold_lpa",
      old_value: previous?.value,
      new_value: newValue,
    },
  });

  res.status(200).json({
    data: {
      single_offer_ctc_threshold_lpa: Number(updated.value),
    },
  });
});

// GET /api/v1/admin/audit-logs
adminRouter.get("/audit-logs", async (req: Request, res: Response) => {
  const { action, entity_type } = req.query;
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = Math.min(parseInt(req.query.page_size as string, 10) || 20, 100);

  const whereClause: any = {};
  if (action && typeof action === "string") whereClause.action = action;
  if (entity_type && typeof entity_type === "string") whereClause.entity_type = entity_type;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where: whereClause }),
    prisma.auditLog.findMany({
      where: whereClause,
      include: { actor: { select: { email: true, full_name: true } } },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.status(200).json({
    data: logs,
    meta: {
      page,
      page_size: pageSize,
      total,
    },
  });
});
