
import React from "react";
import EnhancedModelViewer from "./EnhancedModelViewer";
import type { EnhancedModelViewerProps } from "./types";

const ModelViewer: React.FC<EnhancedModelViewerProps> = (props) => {
  return <EnhancedModelViewer {...props} />;
};

export default ModelViewer;
