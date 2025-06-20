
import React from "react";
import GenericModelViewer from "./GenericModelViewer";
import Text3DModelViewer from "./Text3DModelViewer";
import { 
  ModelViewerProps, 
  isLegacyProps, 
  isEnhancedProps, 
  isTextTo3DModelInfo,
  UrlModelInfo 
} from "./types/ModelViewerTypes";

const EnhancedModelViewer: React.FC<ModelViewerProps> = (props) => {
  // Handle legacy props for backward compatibility
  if (isLegacyProps(props)) {
    const { modelUrl, autoRotate, ...restProps } = props;
    
    // Skip rendering if no model URL
    if (!modelUrl) {
      return null;
    }
    
    // Convert legacy props to new format
    const urlModelInfo: UrlModelInfo = {
      type: 'url',
      modelUrl,
      autoRotate
    };
    
    return (
      <GenericModelViewer
        modelInfo={urlModelInfo}
        {...restProps}
      />
    );
  }
  
  // Handle enhanced props with discriminated unions
  if (isEnhancedProps(props))  {
    const { modelInfo, ...restProps } = props;
    
    // Skip rendering if no model info
    if (!modelInfo) {
      return null;
    }
    
    // Use discriminated union to render appropriate viewer
    if (isTextTo3DModelInfo(modelInfo)) {
      return (
        <Text3DModelViewer
          modelInfo={modelInfo}
          {...restProps}
        />
      );
    } else {
      return (
        <GenericModelViewer
          modelInfo={modelInfo}
          {...restProps}
        />
      );
    }
  }
  
  // Fallback - should not happen with proper TypeScript usage
  console.warn('EnhancedModelViewer: Invalid props provided');
  return null;
};

export default EnhancedModelViewer;
