import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  style,
  ...props
}) => {
  const baseClasses = "bg-gray-200 rounded";

  const variantClasses = {
    text: "h-4 w-full",
    rectangular: "w-full",
    circular: "rounded-full aspect-square",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "loading-skeleton",
    none: "",
  };

  const customStyle = {
    width: width
      ? typeof width === "number"
        ? `${width}px`
        : width
      : undefined,
    height: height
      ? typeof height === "number"
        ? `${height}px`
        : height
      : undefined,
    ...style,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={customStyle}
      {...props}
    />
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}
  >
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="text" width={60} height={16} />
    </div>
    <Skeleton variant="text" width="80%" height={20} className="mb-2" />
    <Skeleton variant="text" width="60%" height={16} className="mb-4" />
    <Skeleton variant="text" width="40%" height={14} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className,
}) => (
  <div className={cn("space-y-4", className)}>
    {/* Header */}
    <div className="grid grid-cols-4 gap-4">
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} />
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="grid grid-cols-4 gap-4">
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className,
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={16} />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      </div>
    ))}
  </div>
);
