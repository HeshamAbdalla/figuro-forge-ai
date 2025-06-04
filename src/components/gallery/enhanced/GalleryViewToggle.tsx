
import React from "react";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface GalleryViewToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const GalleryViewToggle: React.FC<GalleryViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="border-white/20"
      >
        <Grid className="h-4 w-4 mr-2" />
        Grid
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="border-white/20"
      >
        <List className="h-4 w-4 mr-2" />
        List
      </Button>
    </div>
  );
};

export default GalleryViewToggle;
