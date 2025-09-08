
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface FilterOption {
  id?: string;
  value?: string;
  label: string;
}

export interface FilterConfig {
  id?: string;
  name?: string; // Keep 'name' for backward compatibility
  label?: string; // Add 'label' as required by some components
  options: FilterOption[];
}

interface SearchFilterProps {
  placeholder?: string;
  filterConfig?: FilterConfig[];
  filters?: FilterConfig[] | any[]; // Allow both formats for backward compatibility
  onSearch?: (searchTerm: string, activeFilters?: Record<string, string[]>) => void;
  onFilterChange?: (filter: string, value: string) => void;
  className?: string;
  type?: "search";
  searchButtonHandler?: () => void; // New prop for custom search button handler
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = 'Buscar...',
  filterConfig = [],
  filters = [],
  onSearch,
  onFilterChange,
  className,
  type = "search",
  searchButtonHandler
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Use either filterConfig or filters prop, giving priority to filterConfig
  const filtersToUse = filterConfig.length > 0 ? filterConfig : filters;

  const updateFilter = (filterId: string, optionId: string, isChecked: boolean) => {
    setActiveFilters(prev => {
      const currentOptions = prev[filterId] || [];
      
      if (isChecked) {
        return {
          ...prev,
          [filterId]: [...currentOptions, optionId]
        };
      } else {
        return {
          ...prev,
          [filterId]: currentOptions.filter(id => id !== optionId)
        };
      }
    });
  };

  const handleSearch = () => {
    if (searchButtonHandler) {
      // Use custom handler if provided
      searchButtonHandler();
    } else if (onSearch) {
      // Use default behavior
      onSearch(searchTerm, activeFilters);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle filter change with the new interface
  const handleFilterChange = (filterName: string, optionValue: string, isChecked: boolean) => {
    // For backward compatibility with onFilterChange
    if (onFilterChange && isChecked) {
      onFilterChange(filterName, optionValue);
    }
    
    // For components using the activeFilters object
    const filterId = filterName;
    updateFilter(filterId, optionValue, isChecked);
  };

  return (
    <div className={`flex gap-2 mb-4 ${className}`}>
      <div className="relative flex-grow">
        <Input
          type={type}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full"
        />
      </div>
      
      {filtersToUse.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter size={16} />
              Filtros
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {filtersToUse.map(filter => {
              // Handle different filter structure formats
              const filterId = filter.id || filter.name || filter.label || '';
              const filterLabel = filter.label || filter.name || filter.id || '';
              const filterOptions = filter.options || [];
              
              return (
                <div key={filterId} className="p-2">
                  <div className="font-medium text-sm mb-1">{filterLabel}</div>
                  {filterOptions.map(option => {
                    const optionId = option.id || option.value || option.label;
                    
                    return (
                      <DropdownMenuCheckboxItem
                        key={optionId}
                        checked={Boolean(activeFilters[filterId]?.includes(optionId))}
                        onCheckedChange={(checked) => handleFilterChange(filterId, optionId, checked)}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <Button 
        onClick={handleSearch} 
        className="bg-cross-blue hover:bg-cross-blue/90"
      >
        Buscar
      </Button>
    </div>
  );
};

export default SearchFilter;
