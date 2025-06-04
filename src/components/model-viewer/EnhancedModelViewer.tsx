
import React from "react";
import TextTo3DModelViewer from "./TextTo3DModelViewer";
import StandardModelViewer from "./StandardModelViewer";
import type { EnhancedModelViewerProps } from "./types";

const EnhancedModelViewer: React.FC<EnhancedModelViewerProps> = (props) => {
  console.log('🔄 [ENHANCED-MODEL-VIEWER] Props received:', {
    hasModelUrl: !!props.modelUrl,
    hasModelInfo: !!props.modelInfo,
    viewerType: props.viewerType
  });

  // Use discriminated union to determine which viewer to render
  if ('modelInfo' in props && props.modelInfo) {
    console.log('🎯 [ENHANCED-MODEL-VIEWER] Rendering TextTo3DModelViewer');
    return <TextTo3DModelViewer {...props} modelInfo={props.modelInfo} />;
  }

  if ('modelUrl' in props) {
    console.log('🎯 [ENHANCED-MODEL-VIEWER] Rendering StandardModelViewer');
    return <StandardModelViewer {...props} modelUrl={props.modelUrl} />;
  }

  console.log('⚠️ [ENHANCED-MODEL-VIEWER] No valid props, returning null');
  return null;
};

export default EnhancedModelViewer;
