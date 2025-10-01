import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAppointments, useScheduleAssignments } from "@/hooks/api";
import { useTechnicians } from "@/hooks/api";
import { useSkillGroups } from "@/hooks/api";
import { useLanguage } from "@/contexts/language-context";
import type { AppointmentStatus } from "@/types";

export const Plantafel: React.FC = () => {
  const { appointments, updateAppointment } = useAppointments();
  const { technicians } = useTechnicians();
  const { assignments, createAssignment, deleteAssignment } =
    useScheduleAssignments();
  const { data: skillGroups } = useSkillGroups();
  const { t } = useLanguage();
  const [group, setGroup] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [inboxQuery, setInboxQuery] = useState("");
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const mapServiceToGroup = (service?: string) => {
      const s = (service || "").toLowerCase();
      if (s.includes("brake") || s.includes("suspension")) return "mechanical";
      if (s.includes("timing")) return "engine";
      if (s.includes("glass") || s.includes("body")) return "body";
      if (s.includes("tire") || s.includes("tyre")) return "tires";
      if (s.includes("inspection")) return "safety";
      return "diagnostics";
    };

    return appointments.filter(a => {
      const groupOk = group === "all" || mapServiceToGroup(a.title) === group;
      const catOk =
        category === "all" ||
        a.title.toLowerCase().includes(category.toLowerCase());
      return groupOk && catOk;
    });
  }, [appointments, group, category]);

  const statuses = [
    "waiting",
    "assigned",
    "in_progress",
    "paused",
    "completed",
  ];

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop =
    (status: AppointmentStatus) =>
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (id) await updateAppointment(id, { status });
    };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const computeTimesForAppointment = (appointmentId: string) => {
    const appt = appointments.find(a => a.id === appointmentId);
    const now = new Date();
    // Default: start in 15 minutes rounded to next quarter hour
    const start = new Date(now);
    const minutes = start.getMinutes();
    const remainder = minutes % 15 === 0 ? 0 : 15 - (minutes % 15);
    start.setMinutes(minutes + remainder, 0, 0);
    // Duration: aw_estimate * 6 minutes; fallback 60 minutes
    const aw = appt?.aw_estimate ?? 10;
    const durationMinutes = Math.max(aw * 6, 15);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + durationMinutes);
    return { start, end };
  };

  // Build quick lookup: technician_id -> Set(appointment_id)
  const assignedAppointmentIdsByTechnician = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of assignments) {
      const techId = a.technician_id;
      const appId = a.appointment_id;
      if (!techId || !appId) continue;
      if (!map.has(techId)) map.set(techId, new Set<string>());
      map.get(techId)!.add(appId);
    }
    return map;
  }, [assignments]);

  const minutesFromAw = (aw?: number) => (aw && aw > 0 ? aw * 6 : 60);
  const formatSlaBadge = (iso?: string | null) => {
    if (!iso) return null;
    const now = new Date();
    const due = new Date(iso);
    const ms = due.getTime() - now.getTime();
    const minutes = Math.round(ms / 60000);
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    const text = `${hours}h ${mins}m`;
    const late = minutes < 0;
    return { text, late } as const;
  };
  const priorityClass = (p?: string | null) => {
    switch ((p || "normal").toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Planning Board
          </h2>
          <p className="text-sm text-gray-500">
            Assign and track appointments across technicians
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <label className="text-sm text-gray-600">Group</label>
        <select
          className="border rounded-md px-2 py-1 text-sm hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={group}
          onChange={e => setGroup(e.target.value)}
        >
          <option value="all">All</option>
          {(skillGroups ?? []).map(g => (
            <option key={g.group_name} value={g.group_name}>
              {g.group_name}
            </option>
          ))}
        </select>
        <label className="text-sm ml-4 text-gray-600">Category</label>
        <input
          className="border rounded-md px-2 py-1 text-sm hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={t("plantafel.categoryExample")}
          value={category === "all" ? "" : category}
          onChange={e => setCategory(e.target.value || "all")}
        />
      </div>

      {/* Inbox + Employee lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Auftragseingang */}
        <div
          className={`bg-white border rounded-md p-3 min-h-64 transition-all duration-200 ${
            dragOverTarget === "inbox"
              ? "ring-2 ring-blue-400 shadow-md"
              : "hover:shadow-sm"
          }`}
          onDragEnter={() => setDragOverTarget("inbox")}
          onDragLeave={() =>
            setDragOverTarget(current => (current === "inbox" ? null : current))
          }
          onDragOver={allowDrop}
          onDrop={async e => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            if (!id) return;
            try {
              // Remove any existing assignments for this appointment
              const existing = assignments.filter(a => a.appointment_id === id);
              if (existing.length > 0) {
                await Promise.all(existing.map(a => deleteAssignment(a.id)));
              }
              // Reset status to waiting (treat legacy new/pending as waiting)
              await updateAppointment(id, {
                status: "waiting" as AppointmentStatus,
              });
              toast.success("Returned to Order Inbox");
            } catch (err) {
              // errors handled in hooks
            }
            setDragOverTarget(null);
          }}
        >
          <div className="text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-2">
            {t("plantafel.orderInbox")}
          </div>
          <input
            className="w-full mb-2 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={t("plantafel.searchInbox")}
            value={inboxQuery}
            onChange={e => setInboxQuery(e.target.value)}
          />
          <div className="space-y-2">
            {filtered
              .filter(a => {
                const s = (a.status as any) || "";
                return s === "waiting" || s === "pending" || s === "new";
              }) // Show only unassigned appointments in inbox
              .filter(a => {
                if (!inboxQuery.trim()) return true;
                const q = inboxQuery.toLowerCase();
                const hay = [
                  a.title,
                  a.customer?.name,
                  a.vehicle?.make,
                  a.vehicle?.model,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();
                return hay.includes(q);
              })
              .map(a => (
                <div
                  key={a.id}
                  data-job-customer={a.customer_id}
                  data-job-vehicle={a.vehicle_id}
                  draggable
                  onDragStart={e => onDragStart(e, a.id)}
                  className="bg-gray-50 border rounded p-2 cursor-move transition transform hover:shadow-md active:scale-[0.98]"
                >
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-gray-500">Unassigned</div>
                </div>
              ))}
          </div>
        </div>

        {/* Employee lanes */}
        {technicians.map(emp => (
          <div
            key={emp.id}
            className={`bg-white border rounded-md p-3 min-h-64 transition-all duration-200 ${
              dragOverTarget === emp.id
                ? "ring-2 ring-blue-400 shadow-md"
                : "hover:shadow-sm"
            }`}
            onDragEnter={() => setDragOverTarget(emp.id)}
            onDragLeave={() =>
              setDragOverTarget(current =>
                current === emp.id ? null : current
              )
            }
            onDragOver={allowDrop}
            onDrop={async e => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (!id) return;
              try {
                // Remove any existing assignments for this appointment first
                const existing = assignments.filter(
                  a => a.appointment_id === id
                );
                if (existing.length > 0) {
                  await Promise.all(existing.map(a => deleteAssignment(a.id)));
                }
                // Create schedule assignment for this technician
                const { start, end } = computeTimesForAppointment(id);
                await createAssignment({
                  appointment_id: id,
                  technician_id: emp.id,
                  start_time: start.toISOString(),
                  end_time: end.toISOString(),
                  aw_planned:
                    appointments.find(a => a.id === id)?.aw_estimate ?? 10,
                  status: "scheduled",
                });
                // Ensure appointment status is assigned
                await updateAppointment(id, {
                  status: "assigned" as AppointmentStatus,
                });
                toast.success(`Assigned to ${emp.name}`);
              } catch (err) {
                // No toast here; hooks already handle errors
              }
              setDragOverTarget(null);
            }}
          >
            <div className="text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-2">
              {emp.name}
            </div>
            <div className="space-y-2">
              {(() => {
                const items = filtered.filter(a => {
                  // Only show appointments that are actually assigned to this technician
                  const assignedToEmp =
                    assignedAppointmentIdsByTechnician.get(emp.id)?.has(a.id) ??
                    false;
                  return assignedToEmp;
                });
                if (items.length === 0)
                  return (
                    <div className="border border-dashed rounded-md p-3 text-xs text-gray-400">
                      No assignments
                    </div>
                  );
                return items.map(a => (
                  <div
                    key={a.id}
                    data-job-customer={a.customer_id}
                    data-job-vehicle={a.vehicle_id}
                    draggable
                    onDragStart={e => onDragStart(e, a.id)}
                    className="bg-gray-50 border rounded p-2 cursor-move transition transform hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate pr-2">
                        {a.title}
                      </div>
                      <span
                        className={`text-[10px] border rounded px-1 py-0.5 ${priorityClass(a.priority)}`}
                      >
                        {a.priority || "normal"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {a.aw_estimate ?? 10} AW
                        <span className="text-gray-400">
                          ({minutesFromAw(a.aw_estimate)}m)
                        </span>
                      </span>
                      {(() => {
                        const sla = formatSlaBadge(a.sla_promised_at as any);
                        if (!sla) return null;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 ${sla.late ? "text-red-600" : "text-gray-600"}`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${sla.late ? "bg-red-500" : "bg-amber-500"}`}
                            ></span>
                            SLA {sla.late ? "-" : "in "}
                            {sla.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Status board (optional): keep below for status moves */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statuses.map(col => (
          <div
            key={col}
            className={`bg-white border rounded-md p-3 min-h-64 transition-all duration-200 ${
              dragOverTarget === col
                ? "ring-2 ring-blue-400 shadow-md"
                : "hover:shadow-sm"
            }`}
            onDragEnter={() => setDragOverTarget(col)}
            onDragLeave={() =>
              setDragOverTarget(current => (current === col ? null : current))
            }
            onDragOver={allowDrop}
            onDrop={onDrop(col as AppointmentStatus)}
          >
            <div className="font-semibold mb-2 capitalize">
              {col.replace("_", " ")}
            </div>
            <div className="space-y-2">
              {(() => {
                const items = filtered.filter(a => a.status === col);
                if (items.length === 0)
                  return (
                    <div className="border border-dashed rounded-md p-3 text-xs text-gray-400">
                      No items
                    </div>
                  );
                return items.map(a => (
                  <div
                    key={a.id}
                    draggable
                    onDragStart={e => onDragStart(e, a.id)}
                    className="bg-gray-50 border rounded p-2 cursor-move transition transform hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate pr-2">
                        {a.title}
                      </div>
                      <span
                        className={`text-[10px] border rounded px-1 py-0.5 ${priorityClass(a.priority)}`}
                      >
                        {a.priority || "normal"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {a.aw_estimate ?? 10} AW
                        <span className="text-gray-400">
                          ({minutesFromAw(a.aw_estimate)}m)
                        </span>
                      </span>
                      {(() => {
                        const sla = formatSlaBadge(a.sla_promised_at as any);
                        if (!sla) return null;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 ${sla.late ? "text-red-600" : "text-gray-600"}`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${sla.late ? "bg-red-500" : "bg-amber-500"}`}
                            ></span>
                            SLA {sla.late ? "-" : "in "}
                            {sla.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
