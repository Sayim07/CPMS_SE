import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export async function createAuditLog(params: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const createPromise = prisma.auditLog.create({
      data: {
        actor_user_id: params.actorUserId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        metadata: (params.metadata || {}) as any,
      },
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 500));
    await Promise.race([createPromise, timeoutPromise]);
  } catch (err) {
    logger.warn({ err, params }, "Audit log record could not be written to database");
  }
}
