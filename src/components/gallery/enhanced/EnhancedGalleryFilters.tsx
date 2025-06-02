
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SortDesc, Grid3X3, List, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

interface EnhancedGalleryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
  isLoading?: boolean;
}

const categories = [
  { value: "all", label: "All Models" },
  { value: "text-to-3d", label: "Text-to-3D" },
  { value: "traditional", label: "Traditional" },
  { value: "with-model", label: "3D Models" },
  { value: "images-only", label: "Images Only" }
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "title", label: "Alphabetical" }
];

const EnhancedGalleryFilters: React.FC<EnhancedGalleryFiltersProps> = ({
  filters,
  onFiltersChange,
  totalResults,
  isLoading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearSearch = () => {
    updateFilter('search', '');
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.sortBy !== 'newest';

  return (
    <div className="space-y-6">
      {/* Main search bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className={cn(
          "relative transition-all duration-300",
          searchFocused ? "transform scale-105" : ""
        )}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <Input
            placeholder="Search models, styles, creators..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "pl-12 pr-12 py-4 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl",
              "focus:bg-white/10 focus:border-figuro-accent/50 focus:ring-2 focus:ring-figuro-accent/20",
              "transition-all duration-300"
            )}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Results count */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/20 text-white/70 bg-white/5">
              {isLoading ? "Loading..." : `${totalResults} models`}
            </Badge>
            {hasActiveFilters && (
              <Badge className="bg-figuro-accent/20 text-figuro-accent border-figuro-accent/30">
                Filtered
              </Badge>
            )}
          </div>

          {/* Advanced filters toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "text-white/60 hover:text-white hover:bg-white/10",
              showAdvanced && "bg-white/10 text-white"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('viewMode', 'grid')}
              className={cn(
                "px-3 py-2",
                filters.viewMode === 'grid' 
                  ? "bg-figuro-accent text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('viewMode', 'list')}
              className={cn(
                "px-3 py-2",
                filters.viewMode === 'list' 
                  ? "bg-figuro-accent text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-panel rounded-xl p-6 border border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category
                </label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="text-white">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort filter */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Sort By
                </label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        <div className="flex items-center">
                          <SortDesc className="w-4 h-4 mr-2" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick actions */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Quick Actions
                </label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFiltersChange({ search: '', category: 'all', sortBy: 'newest', viewMode: filters.viewMode })}
                    className="w-full justify-start border-white/20 text-white/70 hover:bg-white/10"
                    disabled={!hasActiveFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedGalleryFilters;
