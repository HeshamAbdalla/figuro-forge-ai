
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
  fillHeight?: boolean;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  autoRotate,
  fillHeight,
  ...restProps
}) => {
  // Convert legacy props to new ModelInfo format
  const modelInfo = convertLegacyToModelInfo(modelUrl, { autoRotate });
  
  return (
    <EnhancedModelViewer 
      modelInfo={modelInfo}
      fillHeight={fillHeight}
      {...restProps}
    />
  );
};

export default ModelViewer;
