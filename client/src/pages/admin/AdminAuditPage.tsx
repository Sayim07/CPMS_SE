import React, { useState } from "react";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { MOCK_AUDIT_LOGS, type AuditLog } from "../../mock/mockData";
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Terminal,
} from "lucide-react";

export const AdminAuditPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address.includes(searchQuery);

    const matchesRole = roleFilter === "ALL" || log.actor_role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string): "eligible" | "mismatch" | "warning" | "neutral" => {
    switch (role) {
      case "ADMIN":
        return "mismatch";
      case "TPO":
        return "eligible";
      case "COMPANY":
        return "warning";
      default:
        return "neutral";
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: "created_at",
      header: "Timestamp",
      render: (log) => (
        <span className="font-mono text-[11px] text-slate-600">
          {new Date(log.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actor_email",
      header: "Actor",
      render: (log) => (
        <div>
          <span className="font-mono text-xs text-slate-800 font-semibold">{log.actor_email}</span>
          <p className="text-[10px] text-slate-400 font-mono">IP: {log.ip_address}</p>
        </div>
      ),
    },
    {
      key: "actor_role",
      header: "Role",
      render: (log) => (
        <Badge variant={getRoleBadgeVariant(log.actor_role)} size="sm">
          {log.actor_role}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Action Code",
      render: (log) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {log.action}
        </span>
      ),
    },
    {
      key: "entity_type",
      header: "Target Entity",
      render: (log) => (
        <div className="text-xs">
          <span className="font-medium text-slate-700">{log.entity_type}</span>
          <span className="text-[11px] text-slate-400 font-mono block">{log.entity_id}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Audit Payload",
      render: (log) => (
        <button
          onClick={() => setSelectedLog(log)}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          View JSON
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Immutable System Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographically stamped append-only event log · Governed by Rules.md §5
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            Audit Records: <span className="font-bold text-slate-800">{logs.length}</span>
          </span>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Tamper-Resistant Logging Enabled: All database mutations, verifications, and policy updates are permanently logged.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Retention: 7 Years</span>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Actor Email, Action, Entity ID, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">All Roles</option>
              <option value="TPO">TPO Officers</option>
              <option value="ADMIN">System Admins</option>
              <option value="COMPANY">Recruiters</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        keyExtractor={(l) => l.id}
        page={1}
        pageSize={10}
        total={filteredLogs.length}
      />

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload: ${selectedLog.action}`}
          maxWidth="md"
        >
          <div className="space-y-3">
            <div className="text-xs text-slate-500 space-y-1">
              <p>
                <strong>Event ID:</strong> <span className="font-mono">{selectedLog.id}</span>
              </p>
              <p>
                <strong>Timestamp:</strong> <span className="font-mono">{selectedLog.created_at}</span>
              </p>
              <p>
                <strong>Actor:</strong> {selectedLog.actor_email} ({selectedLog.actor_role})
              </p>
              <p>
                <strong>Client IP:</strong> <span className="font-mono">{selectedLog.ip_address}</span>
              </p>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Raw JSON Payload:
              </label>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-md text-xs font-mono overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
