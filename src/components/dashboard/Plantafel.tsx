import React, { useMemo, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useTechnicians";
import type { Job } from "@/types";

export const Plantafel: React.FC = () => {
  const { jobs, updateJob } = useJobs();
  const { technicians } = useTechnicians();
  const [team, setTeam] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [inboxQuery, setInboxQuery] = useState("");

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const teamOk = team === "all" || j.technician?.specialization === team;
      const catOk = category === "all" || j.service_type.toLowerCase().includes(category.toLowerCase());
      return teamOk && catOk;
    });
  }, [jobs, team, category]);

  const teams = Array.from(new Set(jobs.map(j => j.technician?.specialization).filter(Boolean))) as string[];

  const statuses: Job["status"][] = ["pending", "scheduled", "in_progress", "completed", "cancelled"];

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (status: Job["status"]) => async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) await updateJob(id, { status });
  };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm">Team</label>
        <select className="border rounded-md px-2 py-1 text-sm" value={team} onChange={e => setTeam(e.target.value)}>
          <option value="all">All</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="text-sm ml-4">Category</label>
        <input className="border rounded-md px-2 py-1 text-sm" placeholder="e.g. Elektrik" value={category === "all" ? "" : category} onChange={e => setCategory(e.target.value || "all")} />
      </div>

      {/* Inbox + Employee lanes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Auftragseingang */}
        <div className="bg-white border rounded-md p-3 min-h-64" onDragOver={allowDrop}
          onDrop={async (e)=>{ e.preventDefault(); const id=e.dataTransfer.getData("text/plain"); if (id) await updateJob(id, { assigned_employee_id: null, team_id: null }); }}>
          <div className="font-semibold mb-2">Auftragseingang</div>
          <input
            className="w-full mb-2 border rounded-md px-2 py-1 text-sm"
            placeholder="Suche im Eingang…"
            value={inboxQuery}
            onChange={(e)=>setInboxQuery(e.target.value)}
          />
          <div className="space-y-2">
            {filtered
              .filter(j => !j.assigned_employee_id)
              .filter(j => {
                if (!inboxQuery.trim()) return true;
                const q = inboxQuery.toLowerCase();
                const hay = [j.service_type, j.customer?.name, j.vehicle?.make, j.vehicle?.model].filter(Boolean).join(" ").toLowerCase();
                return hay.includes(q);
              })
              .map(j => (
              <div key={j.id} data-job-customer={j.customer_id} data-job-vehicle={j.vehicle_id} draggable onDragStart={(e)=>onDragStart(e,j.id)} className="bg-gray-50 border rounded p-2 cursor-move">
                <div className="text-sm font-medium">{j.service_type}</div>
                <div className="text-xs text-gray-500">{j.technician?.name || "Unassigned"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee lanes */}
        {technicians.map(emp => (
          <div key={emp.id} className="bg-white border rounded-md p-3 min-h-64" onDragOver={allowDrop}
            onDrop={async (e)=>{ e.preventDefault(); const id=e.dataTransfer.getData("text/plain"); if (id) await updateJob(id, { assigned_employee_id: emp.id, team_id: emp.id }); }}>
            <div className="font-semibold mb-2">{emp.name}</div>
            <div className="space-y-2">
              {filtered.filter(j => j.assigned_employee_id === emp.id).map(j => (
                <div key={j.id} data-job-customer={j.customer_id} data-job-vehicle={j.vehicle_id} draggable onDragStart={(e)=>onDragStart(e,j.id)} className="bg-gray-50 border rounded p-2 cursor-move">
                  <div className="text-sm font-medium">{j.service_type}</div>
                  <div className="text-xs text-gray-500">{j.technician?.name || "Unassigned"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Status board (optional): keep below for status moves */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statuses.map(col => (
          <div key={col} className="bg-white border rounded-md p-3 min-h-64"
            onDragOver={allowDrop}
            onDrop={onDrop(col)}
          >
            <div className="font-semibold mb-2 capitalize">{col.replace("_"," ")}</div>
            <div className="space-y-2">
              {filtered.filter(j => j.status === col).map(j => (
                <div key={j.id} draggable onDragStart={(e) => onDragStart(e, j.id)} className="bg-gray-50 border rounded p-2 cursor-move">
                  <div className="text-sm font-medium">{j.service_type}</div>
                  <div className="text-xs text-gray-500">{j.technician?.name || "Unassigned"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


