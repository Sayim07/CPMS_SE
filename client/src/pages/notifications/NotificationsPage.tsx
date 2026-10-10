import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { MOCK_NOTIFICATIONS, type NotificationItem } from "../../mock/mockData";
import {
  Bell,
  CheckCheck,
  Calendar,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const handleMarkSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const filteredNotifications =
    activeTab === "UNREAD" ? notifications.filter((n) => !n.read_at) : notifications;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "ROUND_SCHEDULED":
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case "JOB_PENDING":
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case "VERIFICATION_RESET":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time campus placement updates, interview calls, and verification notices
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "ALL"
              ? "text-indigo-600 border-b-2 border-indigo-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("UNREAD")}
          className={`pb-2.5 transition-colors relative ${
            activeTab === "UNREAD"
              ? "text-indigo-600 border-b-2 border-indigo-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Unread Alerts ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No notifications in this filter.
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read_at;
            return (
              <div
                key={notif.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  isUnread ? "bg-indigo-50/20" : "bg-white hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-slate-100 shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <p
                      className={`text-xs ${
                        isUnread ? "text-slate-900 font-semibold" : "text-slate-700"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                      {isUnread && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-sans font-semibold text-[10px]">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkSingleAsRead(notif.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-700 underline"
                    >
                      Mark read
                    </button>
                  )}
                  <Link to={notif.link_path}>
                    <Button variant="ghost" size="sm">
                      Open <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
