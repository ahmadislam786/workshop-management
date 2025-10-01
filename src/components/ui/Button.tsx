import React from "react";
import { cn } from "@/utils/formatting/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // Enhanced accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  loading = false,
  leftIcon,
  rightIcon,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  ...props
}) => {
  // Enhanced base classes with better accessibility and micro-interactions
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-interactive relative overflow-hidden will-change-transform group";

  // Enhanced variants with better contrast, accessibility, and micro-interactions
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl focus:shadow-xl active:scale-[0.98] hover:shadow-blue-500/25 hover:-translate-y-0.5",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300 hover:border-gray-400 active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl focus:shadow-xl active:scale-[0.98] hover:shadow-red-500/25 hover:-translate-y-0.5",
    success:
      "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 focus:ring-emerald-500 shadow-lg hover:shadow-xl focus:shadow-xl active:scale-[0.98] hover:shadow-emerald-500/25 hover:-translate-y-0.5",
    outline:
      "bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500 hover:border-blue-700 active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 hover:text-gray-900 active:scale-[0.98] hover:shadow-sm hover:-translate-y-0.5",
  };

  // Enhanced sizes with better touch targets and responsive design
  const sizes = {
    sm: "px-3 py-2 text-sm h-9 min-w-[72px] gap-1.5", // Improved touch target
    md: "px-4 py-2.5 text-sm h-11 min-w-[88px] gap-2", // Improved touch target
    lg: "px-6 py-3 text-base h-12 min-w-[96px] gap-2.5",
    xl: "px-8 py-4 text-lg h-14 min-w-[112px] gap-3",
  };

  const isDisabled = disabled || loading;

  // Enhanced accessibility attributes
  const accessibilityProps = {
    "aria-disabled": isDisabled,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    "aria-expanded": ariaExpanded,
    "aria-controls": ariaControls,
    "aria-busy": loading,
    role: "button",
    tabIndex: isDisabled ? -1 : 0,
  };

  // Ripple effect handler
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={isDisabled}
      onClick={handleClick}
      {...accessibilityProps}
      {...props}
    >
      {/* Loading state with better accessibility and animation */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg animate-fade-in">
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
            aria-label="Loading"
          />
        </div>
      )}

      {/* Content with proper opacity management and enhanced transitions */}
      <div
        className={cn(
          "flex items-center justify-center w-full transition-all duration-200",
          loading ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Left icon with enhanced hover effects */}
        {leftIcon && (
          <span
            className="mr-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        {/* Button text with enhanced typography */}
        <span className="flex-shrink-0 font-medium tracking-wide">
          {children}
        </span>

        {/* Right icon with enhanced hover effects */}
        {rightIcon && (
          <span
            className="ml-2 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {/* Enhanced focus indicator with better accessibility */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-white transition-all duration-200 focus-within:ring-blue-500 pointer-events-none" />

      {/* Hover glow effect for primary buttons */}
      {variant === "primary" && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};
