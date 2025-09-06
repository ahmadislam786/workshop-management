import React, { useState, useMemo } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    [key: string]: {
      label: string;
      options: FilterOption[];
      value: string;
      onChange: (value: string) => void;
    };
  };
  placeholder?: string;
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters = {},
  placeholder = "Search...",
  className,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [, setActiveFilters] = useState<Set<string>>(new Set());

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((filter) => filter.value !== "");
  }, [filters]);

  const handleFilterChange = (filterKey: string, value: string) => {
    const filter = filters[filterKey];
    if (filter) {
      filter.onChange(value);

      // Update active filters state
      setActiveFilters((prev) => {
        const newSet = new Set(prev);
        if (value === "") {
          newSet.delete(filterKey);
        } else {
          newSet.add(filterKey);
        }
        return newSet;
      });
    }
  };

  const clearAllFilters = () => {
    Object.keys(filters).forEach((filterKey) => {
      handleFilterChange(filterKey, "");
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((filter) => filter.value !== "")
      .length;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        {/* Filter Toggle Button */}
        {Object.keys(filters).length > 0 && (
          <Button
            variant={hasActiveFilters ? "primary" : "outline"}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2"
            aria-expanded={isFiltersOpen}
            aria-controls="filter-panel"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isFiltersOpen && "rotate-180"
              )}
            />
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isFiltersOpen && Object.keys(filters).length > 0 && (
        <div
          id="filter-panel"
          className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
        >
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filters).map(([filterKey, filter]) => (
              <div key={filterKey} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) =>
                    handleFilterChange(filterKey, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                      {option.count !== undefined && ` (${option.count})`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([filterKey, filter]) => {
            if (filter.value === "") return null;

            const selectedOption = filter.options.find(
              (opt) => opt.value === filter.value
            );
            if (!selectedOption) return null;

            return (
              <div
                key={filterKey}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{selectedOption.label}</span>
                <button
                  onClick={() => handleFilterChange(filterKey, "")}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
