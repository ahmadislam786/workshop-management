import React, { useMemo, useState } from "react";
import { useScans } from "@/hooks/useScans";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ScanMeasurement, ScanRecord } from "@/types";

// Lightweight client-side PDF print using window.print() of a composed view
const openScanPdf = (scan: ScanRecord) => {
  const w = window.open("", "_blank");
  if (!w) return;
  const title = `Scan-${scan.id}`;
  const results = Array.isArray(scan.results) ? (scan.results as ScanMeasurement[]) : [];
  w.document.write(`<!doctype html><html><head><meta charset=\"utf-8\"/><title>${title}</title>
    <style>body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;padding:24px}h1{margin:0 0 8px}
    table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
    th{background:#f3f4f6}
    </style></head><body>`);
  w.document.write(`<h1>Scan Report</h1><p><strong>ID:</strong> ${scan.id}<br/><strong>Date:</strong> ${new Date(scan.created_at).toLocaleString()}<br/><strong>Device:</strong> ${scan.device || "-"}</p>`);
  if (results.length) {
    w.document.write("<table><thead><tr><th>Measurement</th><th>Value</th><th>Unit</th><th>Status</th></tr></thead><tbody>");
    results.forEach(r => {
      w.document!.write(`<tr><td>${r.name || ""}</td><td>${r.value ?? ""}</td><td>${r.unit ?? ""}</td><td>${r.status ?? ""}</td></tr>`);
    });
    w.document.write("</tbody></table>");
  } else {
    w.document.write("<p>No detailed results available.</p>");
  }
  w.document.write("</body></html>");
  w.document.close();
  w.focus();
  // Give it a tick to render before print
  setTimeout(() => w.print(), 250);
};

export const ScanList: React.FC = () => {
  const { scans, loading, error } = useScans();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scans;
    return scans.filter(s => {
      const hay = [s.id, s.summary, s.device].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, scans]);

  if (loading) return <div>Loading scans…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Input
          placeholder="Search scans…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="bg-white border rounded-lg divide-y">
          {filtered.map((scan) => (
            <button
              key={scan.id}
              onClick={() => setSelected(scan)}
              className={`w-full text-left p-4 hover:bg-gray-50 ${selected?.id === scan.id ? "bg-blue-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{scan.summary || "Scan"}</div>
                  <div className="text-xs text-gray-500">{new Date(scan.created_at).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gray-500">{scan.device || "Device"}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="p-4 text-sm text-gray-500">No scans found.</div>}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!selected ? (
          <div className="text-gray-500">Select a scan to view results.</div>
        ) : (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{selected.summary || "Scan details"}</div>
                <div className="text-sm text-gray-500">{new Date(selected.created_at).toLocaleString()} · {selected.device || "Device"}</div>
              </div>
              <Button onClick={() => openScanPdf(selected)}>PDF</Button>
            </div>

            {Array.isArray(selected.results) ? (
              <table className="min-w-full border rounded-md overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 p-2">Measurement</th>
                    <th className="text-left text-xs font-semibold text-gray-600 p-2">Value</th>
                    <th className="text-left text-xs font-semibold text-gray-600 p-2">Unit</th>
                    <th className="text-left text-xs font-semibold text-gray-600 p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.results as ScanMeasurement[]).map((m, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2 text-sm">{m.name}</td>
                      <td className="p-2 text-sm">{String(m.value)}</td>
                      <td className="p-2 text-sm">{m.unit || ""}</td>
                      <td className="p-2 text-sm">{m.status || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto">{JSON.stringify(selected.results, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


