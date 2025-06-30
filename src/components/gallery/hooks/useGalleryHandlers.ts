
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { usePublicDownload } from "@/hooks/usePublicDownload";

interface UseGalleryHandlersProps {
  generate3DModel: (imageUrl: string, imageName: string) => void;
  handleViewModel: (url: string, fileName: string) => void;
  handleViewImage: (url: string, fileName: string) => void;
}

export const useGalleryHandlers = ({
  generate3DModel,
  handleViewModel,
  handleViewImage
}: UseGalleryHandlersProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const { canPerformAction } = useSubscription();
  const { publicDownload } = usePublicDownload();

  // Handle download functionality - now public by default
  const handleDownload = (url: string, name: string) => {
    console.log('📥 [GALLERY-HANDLERS] Public download initiated');
    publicDownload(url, name);
  };

  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model') => {
    if (fileType === '3d-model') {
      handleViewModel(url, fileName);
    } else {
      handleViewImage(url, fileName);
    }
  };

  // Handle 3D generation - requires authentication
  const handleGenerate3D = async (imageUrl: string, imageName: string) => {
    if (!user) {
      console.log('🔒 [GALLERY-HANDLERS] 3D generation requires authentication');
      setAuthPromptOpen(true);
      return;
    }
    
    // Check if user can perform 3D conversion
    const canConvert = canPerformAction("model_conversion");
    if (!canConvert) {
      console.log('🔒 [GALLERY-HANDLERS] User cannot perform 3D conversion');
      setAuthPromptOpen(true);
      return;
    }
    
    // Open the config modal instead of immediately starting conversion
    generate3DModel(imageUrl, imageName);
  };

  // Handle navigation to studio - requires authentication for creation
  const handleNavigateToStudio = () => {
    if (!user) {
      console.log('🔒 [GALLERY-HANDLERS] Studio access requires authentication');
      setAuthPromptOpen(true);
      return;
    }
    navigate('/studio');
  };

  // Handle upload click - requires authentication
  const handleUploadClick = () => {
    if (!user) {
      console.log('🔒 [GALLERY-HANDLERS] Upload requires authentication');
      setAuthPromptOpen(true);
      return;
    }
    console.log('📁 [GALLERY-HANDLERS] Upload clicked');
  };

  return {
    authPromptOpen,
    setAuthPromptOpen,
    handleDownload,
    handleView,
    handleGenerate3D,
    handleNavigateToStudio,
    handleUploadClick
  };
};
