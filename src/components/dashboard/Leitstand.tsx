import React, { useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";

// Minimal skeleton: groups jobs by team (derived from technician.specialization)
export const Leitstand: React.FC = () => {
  const { jobs } = useJobs();
  const groups = jobs.reduce<Record<string, typeof jobs>>( (acc, j) => {
    const team = j.technician?.specialization || "Ungrouped";
    (acc[team] ||= []).push(j);
    return acc;
  }, {});

  useEffect(() => {
    // Realtime handled by useJobs
  }, []);

  // Listen for highlight events to visually mark related cards
  useEffect(() => {
    const handler = (e: any) => {
      const { customerId, vehicleId } = e.detail || {};
      document.querySelectorAll<HTMLElement>("[data-job-customer]").forEach((el) => {
        if (el.dataset.jobCustomer === customerId || el.dataset.jobVehicle === vehicleId) {
          el.classList.add("ring-2", "ring-blue-500");
          setTimeout(() => el.classList.remove("ring-2", "ring-blue-500"), 1500);
        }
      });
    };
    window.addEventListener("highlight-related", handler as any);
    return () => window.removeEventListener("highlight-related", handler as any);
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(groups).map(([team, list]) => (
        <div key={team} className="bg-white border rounded-lg">
          <div className="p-3 font-semibold">Team {team}</div>
          <div className="divide-y">
            {list.map(j => (
              <div key={j.id} data-job-customer={j.customer_id} data-job-vehicle={j.vehicle_id} className="p-3 text-sm">
                <div className="font-medium">{j.service_type}</div>
                <div className="text-gray-500">{j.customer?.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};


