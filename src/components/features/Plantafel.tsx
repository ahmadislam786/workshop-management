import React, { useMemo, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useSkillGroups } from "@/hooks/useSkillGroups";
import { useLanguage } from "@/contexts/language-context";
import type { Job } from "@/types";

export const Plantafel: React.FC = () => {
  const { jobs, updateJob } = useJobs();
  const { technicians } = useTechnicians();
  const { data: skillGroups } = useSkillGroups();
  const { t } = useLanguage();
  const [group, setGroup] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [inboxQuery, setInboxQuery] = useState("");

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

    return jobs.filter(j => {
      const groupOk =
        group === "all" || mapServiceToGroup(j.service_type) === group;
      const catOk =
        category === "all" ||
        j.service_type.toLowerCase().includes(category.toLowerCase());
      return groupOk && catOk;
    });
  }, [jobs, group, category]);

  const statuses: Job["status"][] = [
    "pending",
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop =
    (status: Job["status"]) => async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (id) await updateJob(id, { status });
    };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm">Group</label>
        <select
          className="border rounded-md px-2 py-1 text-sm"
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
        <label className="text-sm ml-4">Category</label>
        <input
          className="border rounded-md px-2 py-1 text-sm"
          placeholder={t("plantafel.categoryExample")}
          value={category === "all" ? "" : category}
          onChange={e => setCategory(e.target.value || "all")}
        />
      </div>

      {/* Inbox + Employee lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Auftragseingang */}
        <div
          className="bg-white border rounded-md p-3 min-h-64"
          onDragOver={allowDrop}
          onDrop={async e => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            if (id)
              await updateJob(id, {
                technician_id: null,
              });
          }}
        >
          <div className="font-semibold mb-2">{t("plantafel.orderInbox")}</div>
          <input
            className="w-full mb-2 border rounded-md px-2 py-1 text-sm"
            placeholder={t("plantafel.searchInbox")}
            value={inboxQuery}
            onChange={e => setInboxQuery(e.target.value)}
          />
          <div className="space-y-2">
            {filtered
              .filter(j => !j.technician_id)
              .filter(j => {
                if (!inboxQuery.trim()) return true;
                const q = inboxQuery.toLowerCase();
                const hay = [
                  j.service_type,
                  j.customer?.name,
                  j.vehicle?.make,
                  j.vehicle?.model,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();
                return hay.includes(q);
              })
              .map(j => (
                <div
                  key={j.id}
                  data-job-customer={j.customer_id}
                  data-job-vehicle={j.vehicle_id}
                  draggable
                  onDragStart={e => onDragStart(e, j.id)}
                  className="bg-gray-50 border rounded p-2 cursor-move"
                >
                  <div className="text-sm font-medium">{j.service_type}</div>
                  <div className="text-xs text-gray-500">
                    {j.technician?.name || "Unassigned"}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Employee lanes */}
        {technicians.map(emp => (
          <div
            key={emp.id}
            className="bg-white border rounded-md p-3 min-h-64"
            onDragOver={allowDrop}
            onDrop={async e => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id)
                await updateJob(id, {
                  technician_id: emp.id,
                });
            }}
          >
            <div className="font-semibold mb-2">{emp.name}</div>
            <div className="space-y-2">
              {filtered
                .filter(j => j.technician_id === emp.id)
                .map(j => (
                  <div
                    key={j.id}
                    data-job-customer={j.customer_id}
                    data-job-vehicle={j.vehicle_id}
                    draggable
                    onDragStart={e => onDragStart(e, j.id)}
                    className="bg-gray-50 border rounded p-2 cursor-move"
                  >
                    <div className="text-sm font-medium">{j.service_type}</div>
                    <div className="text-xs text-gray-500">
                      {j.technician?.name || "Unassigned"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Status board (optional): keep below for status moves */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statuses.map(col => (
          <div
            key={col}
            className="bg-white border rounded-md p-3 min-h-64"
            onDragOver={allowDrop}
            onDrop={onDrop(col)}
          >
            <div className="font-semibold mb-2 capitalize">
              {col.replace("_", " ")}
            </div>
            <div className="space-y-2">
              {filtered
                .filter(j => j.status === col)
                .map(j => (
                  <div
                    key={j.id}
                    draggable
                    onDragStart={e => onDragStart(e, j.id)}
                    className="bg-gray-50 border rounded p-2 cursor-move"
                  >
                    <div className="text-sm font-medium">{j.service_type}</div>
                    <div className="text-xs text-gray-500">
                      {j.technician?.name || "Unassigned"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};