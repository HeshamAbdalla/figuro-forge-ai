
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";

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
  const { canPerformAction, consumeAction } = useSubscription();

  // Handle download functionality
  const handleDownload = (url: string, name: string) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model') => {
    if (fileType === '3d-model') {
      handleViewModel(url, fileName);
    } else {
      handleViewImage(url, fileName);
    }
  };

  // Handle 3D generation with subscription usage tracking
  const handleGenerate3D = async (imageUrl: string, imageName: string) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    
    // Check if user can perform 3D conversion
    const canConvert = canPerformAction("model_conversion");
    if (!canConvert) {
      setAuthPromptOpen(true);
      return;
    }
    
    // Consume usage before generation
    const consumed = await consumeAction("model_conversion");
    if (!consumed) {
      setAuthPromptOpen(true);
      return;
    }
    
    generate3DModel(imageUrl, imageName);
  };

  // Handle navigation to studio
  const handleNavigateToStudio = () => {
    navigate('/studio');
  };

  // Handle upload click
  const handleUploadClick = () => {
    // TODO: Implement upload functionality
    console.log('Upload clicked');
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
