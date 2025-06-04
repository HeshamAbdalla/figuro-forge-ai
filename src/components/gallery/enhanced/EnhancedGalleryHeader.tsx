
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EnhancedGalleryHeaderProps {
  totalFiles: number;
  onRefresh: () => void;
}

const EnhancedGalleryHeader: React.FC<EnhancedGalleryHeaderProps> = ({
  totalFiles,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Gallery</h1>
        <p className="text-white/60">{totalFiles} items in your collection</p>
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        className="border-white/20 text-white/70 hover:bg-white/10"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default EnhancedGalleryHeader;
