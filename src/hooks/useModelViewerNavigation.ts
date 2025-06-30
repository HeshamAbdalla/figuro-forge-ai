
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

interface NavigateToModelViewerParams {
  modelUrl: string;
  fileName?: string;
  modelId?: string;
  autoRotate?: boolean;
  returnUrl?: string;
  useModal?: boolean; // This option is now the default behavior
}

export const useModelViewerNavigation = () => {
  const navigate = useNavigate();

  const navigateToModelViewer = useCallback(({
    modelUrl,
    fileName = 'Model',
    modelId,
    autoRotate = true,
    returnUrl,
    useModal = true // Default to modal behavior
  }: NavigateToModelViewerParams) => {
    // Create URL parameters for modal navigation
    const params = new URLSearchParams();
    params.set('url', encodeURIComponent(modelUrl));
    params.set('name', fileName);
    params.set('autoRotate', autoRotate.toString());
    
    if (returnUrl) {
      params.set('return', returnUrl);
    } else {
      // Set current location as return URL
      params.set('return', window.location.pathname);
    }

    // Navigate to the model viewer page which will show as a modal
    const modelPath = modelId ? `/model-viewer/${modelId}` : '/model-viewer';
    navigate(`${modelPath}?${params.toString()}`);
  }, [navigate]);

  const navigateToModelViewerInNewTab = useCallback(({
    modelUrl,
    fileName = 'Model',
    modelId,
    autoRotate = true,
    returnUrl
  }: NavigateToModelViewerParams) => {
    // Create URL parameters
    const params = new URLSearchParams();
    params.set('url', encodeURIComponent(modelUrl));
    params.set('name', fileName);
    params.set('autoRotate', autoRotate.toString());
    
    if (returnUrl) {
      params.set('return', returnUrl);
    }

    // Open in new tab
    const modelPath = modelId ? `/model-viewer/${modelId}` : '/model-viewer';
    const fullUrl = `${window.location.origin}${modelPath}?${params.toString()}`;
    window.open(fullUrl, '_blank');
  }, []);

  return {
    navigateToModelViewer,
    navigateToModelViewerInNewTab
  };
};
