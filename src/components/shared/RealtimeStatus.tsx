import React from "react";
import { useRealtime } from "@/contexts/realtime-context";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

export const RealtimeStatus: React.FC = () => {
  const { connected, error } = useRealtime();

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Connection Error</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {connected ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Offline</span>
        </>
      )}
    </div>
  );
};

// Backward-compatible alias for existing imports
export const RealtimeStatusIndicator = RealtimeStatus;
