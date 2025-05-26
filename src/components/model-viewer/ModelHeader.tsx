
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ModelHeaderProps {
  displayModelUrl: string | null;
  onUploadClick: () => void;
}

const ModelHeader = ({ 
  displayModelUrl, 
  onUploadClick 
}: ModelHeaderProps) => {
  return (
    <div className="p-4 border-b border-white/10 flex justify-between items-center">
      <h3 className="text-lg font-medium">3D Model Preview</h3>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 hover:border-white/30"
          onClick={onUploadClick}
        >
          <Upload size={16} className="mr-1" />
          Upload Model
        </Button>
      </div>
    </div>
  );
};

export default ModelHeader;
