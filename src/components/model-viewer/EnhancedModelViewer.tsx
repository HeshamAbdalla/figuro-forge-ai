
import React from "react";
import GenericModelViewer from "./GenericModelViewer";
import Text3DModelViewer from "./Text3DModelViewer";
import { 
  ModelViewerProps, 
  isLegacyProps, 
  isEnhancedProps, 
  isTextTo3DModelInfo,
  UrlModelInfo,
  TextTo3DModelInfo
} from "./types/ModelViewerTypes";

const EnhancedModelViewer: React.FC<ModelViewerProps> = (props) => {
  console.log('🎯 [ENHANCED-MODEL-VIEWER] Rendering with props:', {
    isLegacy: isLegacyProps(props),
    isEnhanced: isEnhancedProps(props),
    timestamp: new Date().toISOString()
  });

  // Handle legacy props for backward compatibility
  // Legacy: { modelUrl: string, autoRotate?: boolean, ...otherProps }
  if (isLegacyProps(props)) {
    const { modelUrl, autoRotate, ...restProps } = props;
    
    console.log('📦 [ENHANCED-MODEL-VIEWER] Using legacy props mode:', { 
      modelUrl: !!modelUrl, 
      autoRotate 
    });
    
    // Skip rendering if no model URL in legacy mode
    if (!modelUrl) {
      console.log('⚠️ [ENHANCED-MODEL-VIEWER] No model URL provided in legacy mode - rendering placeholder');
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No 3D Model</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate an image and convert it to 3D to see your model here
            </p>
          </div>
        </div>
      );
    }
    
    // Convert legacy props to new UrlModelInfo format for consistent handling
    const urlModelInfo: UrlModelInfo = {
      type: 'url',
      modelUrl,
      fileName: `model-${Date.now()}.glb`, // Generate a default filename
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
  // Enhanced: { modelInfo: ModelInfo, ...otherProps }
  if (isEnhancedProps(props)) {
    const { modelInfo, ...restProps } = props;
    
    console.log('🎯 [ENHANCED-MODEL-VIEWER] Using enhanced props mode:', {
      hasModelInfo: !!modelInfo,
      modelType: modelInfo?.type,
      isTextTo3D: isTextTo3DModelInfo(modelInfo)
    });
    
    // Render placeholder if no model info in enhanced mode
    if (!modelInfo) {
      console.log('⚠️ [ENHANCED-MODEL-VIEWER] No model info provided in enhanced mode - rendering placeholder');
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready for 3D</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your 3D model will appear here once generated
            </p>
          </div>
        </div>
      );
    }
    
    // Use discriminated union to render appropriate viewer based on model type
    if (isTextTo3DModelInfo(modelInfo)) {
      console.log('🎨 [ENHANCED-MODEL-VIEWER] Rendering Text3DModelViewer for text-to-3D:', {
        taskId: modelInfo.taskId,
        status: modelInfo.status,
        hasModelUrl: !!modelInfo.modelUrl,
        hasPrompt: !!modelInfo.prompt
      });
      
      // Ensure Text3DModelViewer gets properly typed TextTo3DModelInfo
      return (
        <Text3DModelViewer
          modelInfo={modelInfo as TextTo3DModelInfo}
          {...restProps}
        />
      );
    } else {
      console.log('🌐 [ENHANCED-MODEL-VIEWER] Rendering GenericModelViewer for URL-based model:', {
        modelUrl: modelInfo.modelUrl,
        fileName: (modelInfo as UrlModelInfo).fileName
      });
      
      // Ensure GenericModelViewer gets properly typed UrlModelInfo
      return (
        <GenericModelViewer
          modelInfo={modelInfo as UrlModelInfo}
          {...restProps}
        />
      );
    }
  }
  
  // Fallback error state - should not happen with proper TypeScript usage
  console.error('❌ [ENHANCED-MODEL-VIEWER] Invalid props provided, unable to determine viewer type');
  
  // Enhanced error state with better UX and debugging info
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center p-6">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Model Viewer Configuration Error</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Unable to display 3D model due to invalid props configuration
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Show Debug Info
            </summary>
            <pre className="mt-2 text-xs bg-gray-200 dark:bg-gray-700 p-3 rounded overflow-auto max-h-32">
              {JSON.stringify(props, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default EnhancedModelViewer;
