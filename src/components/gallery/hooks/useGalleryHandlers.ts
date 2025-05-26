
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

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

  // Handle 3D generation
  const handleGenerate3D = (imageUrl: string, imageName: string) => {
    if (!user) {
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
