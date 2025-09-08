import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  // Enhanced accessibility props
  required?: boolean;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  leftIcon,
  rightIcon,
  helperText,
  required = false,
  ariaDescribedBy,
  ariaInvalid,
  id,
  ...props
}) => {
  // Generate unique ID for accessibility
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced accessibility attributes
  const accessibilityProps = {
    "aria-invalid": error ? true : ariaInvalid || false,
    "aria-describedby":
      [
        error && `${inputId}-error`,
        helperText && `${inputId}-helper`,
        ariaDescribedBy,
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    "aria-required": required,
  };

  return (
    <div className="space-y-2">
      {/* Enhanced label with better accessibility */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-700 flex items-center gap-1"
        >
          {label}
          {required && (
            <span
              className="text-red-500 text-lg leading-none"
              aria-label="required"
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input container with enhanced styling */}
      <div className="relative group">
        {/* Left icon with better positioning */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-600 transition-colors duration-200">
            <div className="h-5 w-5">{leftIcon}</div>
          </div>
        )}

        {/* Enhanced input with better accessibility and styling */}
        <input
          id={inputId}
          className={cn(
            "block w-full rounded-lg border-gray-300 shadow-sm transition-all duration-200",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg",
            "hover:border-gray-400 hover:shadow-md",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "placeholder:text-gray-400 placeholder:text-sm",
            // Icon spacing
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            // Error states
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500 focus:shadow-red-100"
              : "",
            // Enhanced focus states
            "form-input-focus",
            className
          )}
          {...accessibilityProps}
          {...props}
        />

        {/* Right icon should be interactive (e.g., password toggle) */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 group-focus-within:text-blue-600 transition-colors duration-200">
            <div className="h-5 w-5 flex items-center">{rightIcon}</div>
          </div>
        )}

        {/* Enhanced focus ring for better accessibility */}
        <div className="absolute inset-0 rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-white transition-all duration-200 group-focus-within:ring-blue-500 pointer-events-none" />
      </div>

      {/* Helper text with better styling */}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="text-sm text-gray-600 flex items-start gap-1"
        >
          <span className="text-blue-500 mt-0.5">ℹ</span>
          {helperText}
        </p>
      )}

      {/* Enhanced error message with better accessibility */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-red-600 flex items-start gap-1"
          role="alert"
          aria-live="polite"
        >
          <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};