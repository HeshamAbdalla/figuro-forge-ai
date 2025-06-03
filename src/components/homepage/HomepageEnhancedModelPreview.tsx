
import React from "react";
import EnhancedGalleryModelPreview from "@/components/gallery/enhanced/EnhancedGalleryModelPreview";

interface HomepageEnhancedModelPreviewProps {
  modelUrl: string;
  fileName: string;
}

const HomepageEnhancedModelPreview: React.FC<HomepageEnhancedModelPreviewProps> = ({
  modelUrl,
  fileName
}) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/30">
      <EnhancedGalleryModelPreview 
        modelUrl={modelUrl} 
        fileName={fileName}
      />
    </div>
  );
};

export default HomepageEnhancedModelPreview;
