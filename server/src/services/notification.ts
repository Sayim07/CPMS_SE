import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export async function notifyTPOs(params: {
  type: string;
  message: string;
  linkPath?: string;
}) {
  try {
    const tpos = await prisma.user.findMany({
      where: { role: Role.TPO, is_active: true },
      select: { id: true },
    });

    if (tpos.length === 0) return;

    await prisma.notification.createMany({
      data: tpos.map((tpo) => ({
        user_id: tpo.id,
        type: params.type,
        message: params.message,
        link_path: params.linkPath,
      })),
    });
  } catch (err) {
    logger.warn({ err, params }, "TPO notifications could not be written to database");
  }
}

export async function notifyUser(params: {
  userId: string;
  type: string;
  message: string;
  linkPath?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        user_id: params.userId,
        type: params.type,
        message: params.message,
        link_path: params.linkPath,
      },
    });
  } catch (err) {
    logger.warn({ err, params }, "User notification could not be written to database");
  }
}

