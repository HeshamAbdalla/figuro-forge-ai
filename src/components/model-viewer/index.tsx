
import React from "react";
import EnhancedModelViewer from "./EnhancedModelViewer";

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

const ModelViewer: React.FC<ModelViewerProps> = (props) => {
  return <EnhancedModelViewer {...props} />;
};

export default ModelViewer;
