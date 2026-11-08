import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";

export const notificationsRouter = Router();

// GET /notifications [Any Authenticated User]
notificationsRouter.get("/notifications", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const unreadOnly = req.query.unread_only === "true" || req.query.unread_only === "1";

    const whereClause: any = { user_id: userId };
    if (unreadOnly) {
      whereClause.read_at = null;
    }

    const [notifications, totalUnread] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { user_id: userId, read_at: null },
      }),
    ]);

    res.status(200).json({
      data: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        link_path: n.link_path,
        read_at: n.read_at ? n.read_at.toISOString() : null,
        created_at: n.created_at.toISOString(),
      })),
      meta: {
        unread_count: totalUnread,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve notifications.",
      },
    });
  }
});

// Mark single notification as read: Supports both PATCH and POST conforming to Schema.md §5.7
const markSingleRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Notification not found.",
        },
      });
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to modify this notification.",
        },
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read_at: new Date() },
    });

    res.status(200).json({
      data: {
        id: updated.id,
        read_at: updated.read_at?.toISOString(),
        message: "Notification marked as read.",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update notification.",
      },
    });
  }
};

notificationsRouter.patch("/notifications/:id/read", authenticate, markSingleRead);
notificationsRouter.post("/notifications/:id/read", authenticate, markSingleRead);

// Mark all notifications as read: Supports both PATCH and POST conforming to Schema.md §5.7
const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await prisma.notification.updateMany({
      where: {
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });

    res.status(200).json({
      data: {
        updated_count: result.count,
        message: "All notifications marked as read.",
      },
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to mark all notifications as read.",
      },
    });
  }
};

notificationsRouter.patch("/notifications/read-all", authenticate, markAllRead);
notificationsRouter.post("/notifications/read-all", authenticate, markAllRead);

