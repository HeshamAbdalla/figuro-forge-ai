
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Search, Filter, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Figurine } from "@/types/figurine";
import ModelPreviewGrid from "./ModelPreviewGrid";
import { cn } from "@/lib/utils";

interface EnhancedGalleryViewProps {
  figurines: Figurine[];
  loading: boolean;
  onDownload: (figurine: Figurine) => void;
  onViewModel: (figurine: Figurine) => void;
  onTogglePublish: (figurine: Figurine) => void;
  onUploadModel: (figurine: Figurine) => void;
}

type ViewMode = "grid" | "list";
type SortOption = "newest" | "oldest" | "name" | "type";
type FilterOption = "all" | "with-model" | "images-only" | "text-to-3d" | "web-icons" | "public" | "private";

const EnhancedGalleryView: React.FC<EnhancedGalleryViewProps> = ({
  figurines,
  loading,
  onDownload,
  onViewModel,
  onTogglePublish,
  onUploadModel
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort figurines
  const processedFigurines = React.useMemo(() => {
    let filtered = figurines.filter(figurine => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!figurine.title.toLowerCase().includes(query) &&
            !figurine.style?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Type filter
      switch (filterBy) {
        case "with-model":
          return !!figurine.model_url;
        case "images-only":
          return !figurine.model_url;
        case "text-to-3d":
          return figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
        case "web-icons":
          return figurine.file_type === 'web-icon' || figurine.title.startsWith('Web Icon:');
        case "public":
          return figurine.is_public;
        case "private":
          return !figurine.is_public;
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "type":
          return (a.style || "").localeCompare(b.style || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [figurines, searchQuery, sortBy, filterBy]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = figurines.length;
    const withModel = figurines.filter(f => !!f.model_url).length;
    const textTo3D = figurines.filter(f => f.style === 'text-to-3d' || f.title.startsWith('Text-to-3D:')).length;
    const webIcons = figurines.filter(f => f.file_type === 'web-icon' || f.title.startsWith('Web Icon:')).length;
    const publicCount = figurines.filter(f => f.is_public).length;

    return { total, withModel, textTo3D, webIcons, publicCount };
  }, [figurines]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">My Gallery</h2>
          <Badge variant="secondary" className="bg-white/10 text-white/70">
            {processedFigurines.length} of {stats.total}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 px-3",
                viewMode === "grid" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
              )}
            >
              <Grid3X3 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 px-3",
                viewMode === "list" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
              )}
            >
              <List size={16} />
            </Button>
          </div>

          {/* Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-8 px-3 text-white/60 hover:text-white",
              showFilters && "bg-white/10 text-white"
            )}
          >
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search figurines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <SortDesc size={16} className="text-white/60" />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/60" />
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="with-model">With 3D Model</SelectItem>
                  <SelectItem value="images-only">Images Only</SelectItem>
                  <SelectItem value="text-to-3d">Text-to-3D</SelectItem>
                  <SelectItem value="web-icons">Web Icons</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-blue-400/30 text-blue-400">
            {stats.withModel} with 3D models
          </Badge>
          <Badge variant="outline" className="border-purple-400/30 text-purple-400">
            {stats.textTo3D} text-to-3D
          </Badge>
          <Badge variant="outline" className="border-orange-400/30 text-orange-400">
            {stats.webIcons} web icons
          </Badge>
          <Badge variant="outline" className="border-green-400/30 text-green-400">
            {stats.publicCount} public
          </Badge>
        </div>
      </div>

      {/* Gallery Grid */}
      <ModelPreviewGrid
        figurines={processedFigurines}
        loading={loading}
        onDownload={onDownload}
        onViewModel={onViewModel}
        onTogglePublish={onTogglePublish}
        onUploadModel={onUploadModel}
        viewMode={viewMode}
      />
    </div>
  );
};

export default EnhancedGalleryView;
