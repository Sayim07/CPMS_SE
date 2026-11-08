import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const departmentsRouter = Router();

// GET /departments [Public] - Active departments catalog for registration forms (Schema.md §5.9)
departmentsRouter.get("/departments", async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { is_active: true },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: "asc" },
    });

    res.status(200).json({
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve department catalog.",
      },
    });
  }
});

