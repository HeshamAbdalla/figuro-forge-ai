
import React from "react";
import EnhancedModelViewer from "./EnhancedModelViewer";
import { convertLegacyToModelInfo } from "@/utils/modelTypeDetection";

interface ModelViewerProps {
  modelUrl: string | null;
  isLoading: boolean;
  progress?: number;
  errorMessage?: string | null;
  onCustomModelLoad?: (url: string, file: File) => void;
  variant?: "standard" | "compact" | "gallery";
  showControls?: boolean;
  autoRotate?: boolean;
  className?: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  autoRotate,
  ...restProps
}) => {
  // Convert legacy props to new ModelInfo format
  const modelInfo = convertLegacyToModelInfo(modelUrl, { autoRotate });
  
  return (
    <EnhancedModelViewer 
      modelInfo={modelInfo}
      {...restProps}
    />
  );
};

export default ModelViewer;
