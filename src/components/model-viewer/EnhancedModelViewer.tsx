
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
  console.log('🎯 [ENHANCED-MODEL-VIEWER] Rendering with props:', {
    isLegacy: isLegacyProps(props),
    isEnhanced: isEnhancedProps(props),
    timestamp: new Date().toISOString()
  });

  // Handle legacy props for backward compatibility
  if (isLegacyProps(props)) {
    const { modelUrl, autoRotate, ...restProps } = props;
    
    console.log('📦 [ENHANCED-MODEL-VIEWER] Using legacy props mode:', { modelUrl: !!modelUrl, autoRotate });
    
    // Skip rendering if no model URL
    if (!modelUrl) {
      console.warn('⚠️ [ENHANCED-MODEL-VIEWER] No model URL provided in legacy mode');
      return null;
    }
    
    // Convert legacy props to new format
    const urlModelInfo: UrlModelInfo = {
      type: 'url',
      modelUrl,
      autoRotate: autoRotate ?? true
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
    
    console.log('🎯 [ENHANCED-MODEL-VIEWER] Using enhanced props mode:', {
      hasModelInfo: !!modelInfo,
      modelType: modelInfo?.type,
      isTextTo3D: isTextTo3DModelInfo(modelInfo)
    });
    
    // Skip rendering if no model info
    if (!modelInfo) {
      console.warn('⚠️ [ENHANCED-MODEL-VIEWER] No model info provided in enhanced mode');
      return null;
    }
    
    // Use discriminated union to render appropriate viewer
    if (isTextTo3DModelInfo(modelInfo)) {
      console.log('🎨 [ENHANCED-MODEL-VIEWER] Rendering Text3DModelViewer for:', {
        taskId: modelInfo.taskId,
        status: modelInfo.status,
        hasModelUrl: !!modelInfo.modelUrl
      });
      
      return (
        <Text3DModelViewer
          modelInfo={modelInfo}
          {...restProps}
        />
      );
    } else {
      console.log('🌐 [ENHANCED-MODEL-VIEWER] Rendering GenericModelViewer for URL-based model');
      
      return (
        <GenericModelViewer
          modelInfo={modelInfo}
          {...restProps}
        />
      );
    }
  }
  
  // Fallback - should not happen with proper TypeScript usage
  console.error('❌ [ENHANCED-MODEL-VIEWER] Invalid props provided, unable to determine viewer type');
  
  // Render error state instead of null for better debugging
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <p className="text-red-500 font-medium">Model Viewer Error</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Invalid props configuration
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-1 text-left bg-gray-200 dark:bg-gray-700 p-2 rounded">
              {JSON.stringify(props, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default EnhancedModelViewer;
