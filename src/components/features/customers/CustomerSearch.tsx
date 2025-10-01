import React, { useState, useEffect, useMemo } from "react";
import { useCustomers } from "@/hooks/api";
import { useVehicles } from "@/hooks/api";
import { Search, User, Car, X } from "lucide-react";
import type { Customer, Vehicle } from "@/types";

interface CustomerSearchProps {
  onCustomerSelect?: (customer: Customer, vehicle?: Vehicle) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  type: "customer" | "vehicle";
  customer: Customer;
  vehicle?: Vehicle;
  displayText: string;
  searchText: string;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  onCustomerSelect,
  placeholder = "Search by customer name or license plate...",
  className = "",
}) => {
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Generate search results based on search term
  const generateSearchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search by customer name (last name priority)
    customers.forEach(customer => {
      const nameParts = customer.name.toLowerCase().split(" ");
      const lastName = nameParts[nameParts.length - 1];

      if (
        customer.name.toLowerCase().includes(term) ||
        lastName.includes(term)
      ) {
        // Find all vehicles for this customer
        const customerVehicles = vehicles.filter(
          v => v.customer_id === customer.id
        );

        if (customerVehicles.length > 0) {
          // Add each vehicle as a separate result
          customerVehicles.forEach(vehicle => {
            results.push({
              type: "vehicle",
              customer,
              vehicle,
              displayText: `${customer.name} - ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`,
              searchText: `${customer.name} ${vehicle.license_plate} ${vehicle.make} ${vehicle.model}`,
            });
          });
        } else {
          // Customer without vehicles
          results.push({
            type: "customer",
            customer,
            displayText: `${customer.name} (No vehicles)`,
            searchText: customer.name,
          });
        }
      }
    });

    // Search by license plate
    vehicles.forEach(vehicle => {
      if (vehicle.license_plate?.toLowerCase().includes(term)) {
        const customer = customers.find(c => c.id === vehicle.customer_id);
        if (customer) {
          results.push({
            type: "vehicle",
            customer,
            vehicle,
            displayText: `${vehicle.license_plate} - ${customer.name} (${vehicle.make} ${vehicle.model})`,
            searchText: `${vehicle.license_plate} ${customer.name} ${vehicle.make} ${vehicle.model}`,
          });
        }
      }
    });

    // Remove duplicates and sort by relevance
    const uniqueResults = results.filter(
      (result, index, self) =>
        index ===
        self.findIndex(
          r =>
            r.customer.id === result.customer.id &&
            (!result.vehicle ||
              !r.vehicle ||
              r.vehicle.id === result.vehicle.id)
        )
    );

    // Sort by relevance (exact matches first, then partial matches)
    return uniqueResults.sort((a, b) => {
      const aExact = a.searchText.toLowerCase().startsWith(term);
      const bExact = b.searchText.toLowerCase().startsWith(term);

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return a.searchText.length - b.searchText.length;
    });
  }, [searchTerm, customers, vehicles]);

  useEffect(() => {
    setSearchResults(generateSearchResults);
    setSelectedIndex(0);
  }, [generateSearchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultSelect(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    if (onCustomerSelect) {
      onCustomerSelect(result.customer, result.vehicle);
    }
    setSearchTerm(result.displayText);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on results
    setTimeout(() => setIsOpen(false), 200);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <div
              key={`${result.customer.id}-${result.vehicle?.id || "no-vehicle"}`}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => handleResultSelect(result)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    result.type === "vehicle"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {result.type === "vehicle" ? (
                    <Car className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.displayText}
                  </div>
                  {result.vehicle && (
                    <div className="text-xs text-gray-500">
                      {result.customer.email && `${result.customer.email} • `}
                      {result.customer.phone && `${result.customer.phone}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && searchTerm && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No customers or vehicles found</p>
            <p className="text-xs">Try searching by name or license plate</p>
          </div>
        </div>
      )}
    </div>
  );
};
