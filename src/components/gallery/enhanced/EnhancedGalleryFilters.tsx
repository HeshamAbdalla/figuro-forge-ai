
import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  isLoading: boolean;
}

const EnhancedGalleryFilters: React.FC<EnhancedGalleryFiltersProps> = ({
  filters,
  onFiltersChange,
  totalResults,
  isLoading
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-6 rounded-2xl border border-white/10 shadow-glow"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <Input
            placeholder="Search 3D models..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter - Updated for 3D models only */}
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all" className="text-white">All Models</SelectItem>
              <SelectItem value="text-to-3d" className="text-white">Text-to-3D</SelectItem>
              <SelectItem value="traditional" className="text-white">Traditional</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger className="w-36 bg-white/5 border-white/20 text-white">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="newest" className="text-white">Newest</SelectItem>
              <SelectItem value="oldest" className="text-white">Oldest</SelectItem>
              <SelectItem value="title" className="text-white">A-Z</SelectItem>
              <SelectItem value="popular" className="text-white">Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/20">
            <Button
              variant={filters.viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("viewMode", "grid")}
              className={`px-3 py-1 ${
                filters.viewMode === "grid"
                  ? "bg-figuro-accent text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={filters.viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange("viewMode", "list")}
              className={`px-3 py-1 ${
                filters.viewMode === "list"
                  ? "bg-figuro-accent text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-figuro-accent/30 text-figuro-accent">
            {isLoading ? "Loading..." : `${totalResults} 3D Models`}
          </Badge>
          {filters.search && (
            <Badge variant="secondary" className="bg-white/10 text-white/80">
              Search: "{filters.search}"
            </Badge>
          )}
        </div>

        {/* Clear Filters */}
        {(filters.search || filters.category !== "all" || filters.sortBy !== "newest") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({
              search: "",
              category: "all",
              sortBy: "newest",
              viewMode: filters.viewMode
            })}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedGalleryFilters;
