import React, { useMemo, useState } from "react";
import { useScans } from "@/hooks/useScans";
import { useLanguage } from "@/contexts/language-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SearchFilter } from "@/components/ui/SearchFilter";
import { SkeletonCard } from "@/components/ui/Skeleton";
import {
  Search,
  Download,
  Eye,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Printer,
} from "lucide-react";
import type { ScanMeasurement, ScanRecord } from "@/types";

// Lightweight client-side PDF print using window.print() of a composed view
const openScanPdf = (scan: ScanRecord) => {
  const w = window.open("", "_blank");
  if (!w) return;
  const title = `Scan-${scan.id}`;
  const results = Array.isArray(scan.results)
    ? (scan.results as ScanMeasurement[])
    : [];
  w.document
    .write(`<!doctype html><html><head><meta charset=\"utf-8\"/><title>${title}</title>
    <style>body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;padding:24px}h1{margin:0 0 8px}
    table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
    th{background:#f3f4f6}
    </style></head><body>`);
  w.document.write(
    `<h1>Scan Report</h1><p><strong>ID:</strong> ${
      scan.id
    }<br/><strong>Date:</strong> ${new Date(
      scan.created_at
    ).toLocaleString()}<br/><strong>Device:</strong> ${scan.device || "-"}</p>`
  );
  if (results.length) {
    w.document.write(
      "<table><thead><tr><th>Measurement</th><th>Value</th><th>Unit</th><th>Status</th></tr></thead><tbody>"
    );
    results.forEach((r) => {
      w.document!.write(
        `<tr><td>${r.name || ""}</td><td>${r.value ?? ""}</td><td>${
          r.unit ?? ""
        }</td><td>${r.status ?? ""}</td></tr>`
      );
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
  const { scans, loading, error, refetch } = useScans();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ScanRecord | null>(null);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = useMemo(() => {
    let filteredScans = scans;

    // Search filter
    if (query.trim()) {
      const searchLower = query.trim().toLowerCase();
      filteredScans = filteredScans.filter((s) => {
        const searchText = [s.id, s.summary, s.device, s.customer_name]
          .join(" ")
          .toLowerCase();
        return searchText.includes(searchLower);
      });
    }

    // Device filter
    if (selectedDevice) {
      filteredScans = filteredScans.filter((s) => s.device === selectedDevice);
    }

    // Date filter
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filteredScans = filteredScans.filter((s) => {
        const scanDate = new Date(s.created_at);
        return scanDate.toDateString() === filterDate.toDateString();
      });
    }

    return filteredScans;
  }, [query, scans, selectedDevice, selectedDate]);

  const uniqueDevices = useMemo(() => {
    const devices = [...new Set(scans.map((s) => s.device).filter(Boolean))];
    return devices.map((device) => ({ value: device, label: device }));
  }, [scans]);

  const getScanStatus = (scan: ScanRecord) => {
    const results = Array.isArray(scan.results)
      ? (scan.results as ScanMeasurement[])
      : [];
    if (results.length === 0) return "no-data";

    const hasErrors = results.some(
      (r) => r.status === "error" || r.status === "warning"
    );
    const hasWarnings = results.some((r) => r.status === "warning");

    if (hasErrors) return "error";
    if (hasWarnings) return "warning";
    return "success";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Scans
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan Results</h1>
          <p className="text-gray-600">
            Diagnostic scan results and measurements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant="outline"
            onClick={refetch}
            leftIcon={<Search className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <SearchFilter
          searchValue={query}
          onSearchChange={setQuery}
          placeholder="Search scans by ID, summary, device, or customer..."
          filters={{
            device: {
              label: "Device",
              options: uniqueDevices,
              value: selectedDevice,
              onChange: setSelectedDevice,
            },
            date: {
              label: "Date",
              options: [
                { value: "", label: "All Dates" },
                {
                  value: new Date().toISOString().split("T")[0],
                  label: "Today",
                },
                {
                  value: new Date(Date.now() - 86400000)
                    .toISOString()
                    .split("T")[0],
                  label: "Yesterday",
                },
                {
                  value: new Date(Date.now() - 7 * 86400000)
                    .toISOString()
                    .split("T")[0],
                  label: "Last Week",
                },
              ],
              value: selectedDate,
              onChange: setSelectedDate,
            },
          }}
        />
      </div>

      {/* Results */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scan List */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg divide-y max-h-96 overflow-y-auto">
              {filtered.map((scan) => {
                const status = getScanStatus(scan);
                return (
                  <button
                    key={scan.id}
                    onClick={() => setSelected(scan)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selected?.id === scan.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {scan.summary || "Scan"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {scan.customer_name || "Unknown Customer"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="text-xs text-gray-500">
                          {scan.device || "Device"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        {new Date(scan.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No scans found</p>
                </div>
              )}
            </div>
          </div>

          {/* Scan Details */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a scan to view detailed results</p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-6 space-y-6">
                {/* Scan Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selected.summary || "Scan Results"}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>ID: {selected.id}</span>
                      <span>Device: {selected.device || "Unknown"}</span>
                      <span>
                        Customer: {selected.customer_name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(selected.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                        getScanStatus(selected)
                      )}`}
                    >
                      {getScanStatus(selected).replace("_", " ")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openScanPdf(selected)}
                      leftIcon={<Printer className="h-4 w-4" />}
                    >
                      Print
                    </Button>
                  </div>
                </div>

                {/* Scan Results */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Measurement Results
                  </h3>
                  {Array.isArray(selected.results) &&
                  selected.results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Measurement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(selected.results as ScanMeasurement[]).map(
                            (result, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {result.name || `Measurement ${index + 1}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {result.value ?? "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {result.unit || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(
                                      result.status || "no-data"
                                    )}`}
                                  >
                                    {getStatusIcon(result.status || "no-data")}
                                    {result.status || "No Data"}
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No measurement results available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((scan) => {
            const status = getScanStatus(scan);
            return (
              <div
                key={scan.id}
                className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelected(scan)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {scan.summary || "Scan"}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {scan.customer_name || "Unknown Customer"}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                      status
                    )}`}
                  >
                    {status.replace("_", " ")}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span>ID: {scan.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(scan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Device: {scan.device || "Unknown"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {Array.isArray(scan.results) ? scan.results.length : 0}{" "}
                      measurements
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openScanPdf(scan);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Printer className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No scans found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
