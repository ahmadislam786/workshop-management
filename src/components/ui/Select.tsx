import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  helperText?: string;
  // Enhanced accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  leftIcon,
  helperText,
  ariaLabel,
  ariaDescribedBy,
  id,
}) => {
  // Generate unique ID for accessibility
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced accessibility attributes
  const accessibilityProps = {
    "aria-label": ariaLabel,
    "aria-describedby":
      [
        error && `${selectId}-error`,
        helperText && `${selectId}-helper`,
        ariaDescribedBy,
      ]
        .filter(Boolean)
        .join(" ") || undefined,
    "aria-invalid": error ? true : false,
    "aria-required": required,
    "aria-disabled": disabled,
  };

  return (
    <div className="space-y-2">
      {/* Enhanced label with better accessibility */}
      {label && (
        <label
          htmlFor={selectId}
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

      {/* Select container with enhanced styling */}
      <div className="relative group will-change-transform">
        {/* Left icon with better positioning */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-600 transition-colors duration-200">
            <div className="h-5 w-5">{leftIcon}</div>
          </div>
        )}

        {/* Enhanced select with better accessibility and styling */}
        <select
          id={selectId}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={cn(
            "block w-full rounded-lg border-gray-300 shadow-sm transition-all duration-200 appearance-none",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg",
            "hover:border-gray-400 hover:shadow-md",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            "placeholder:text-gray-400 placeholder:text-sm",
            // Icon spacing
            leftIcon ? "pl-10" : "",
            "pr-10", // Always add right padding for chevron
            // Error states
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500 focus:shadow-red-100"
              : "",
            // Enhanced focus states
            "form-input-focus",
            // Better touch targets
            "h-11"
          )}
          {...accessibilityProps}
        >
          {/* Enhanced placeholder option */}
          {placeholder && (
            <option value="" disabled className="text-gray-400">
              {placeholder}
            </option>
          )}

          {/* Enhanced options with better accessibility */}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={option.disabled ? "text-gray-400" : "text-gray-900"}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Enhanced chevron icon with better positioning */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-600 transition-colors duration-200">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>

        {/* Enhanced focus ring for better accessibility */}
        <div className="absolute inset-0 rounded-lg ring-2 ring-transparent ring-offset-2 ring-offset-white transition-all duration-200 group-focus-within:ring-blue-500 pointer-events-none" />
      </div>

      {/* Helper text with better styling */}
      {helperText && !error && (
        <p
          id={`${selectId}-helper`}
          className="text-sm text-gray-600 flex items-start gap-1"
        >
          <span className="text-blue-500 mt-0.5">ℹ</span>
          {helperText}
        </p>
      )}

      {/* Enhanced error message with better accessibility */}
      {error && (
        <p
          id={`${selectId}-error`}
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
