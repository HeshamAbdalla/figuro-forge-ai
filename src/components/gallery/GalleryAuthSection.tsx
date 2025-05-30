
import React from "react";
import Header from "@/components/Header";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import CallToAction from "@/components/gallery/CallToAction";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { BucketImage } from "@/components/gallery/types";

interface GalleryAuthSectionProps {
  images: BucketImage[];
  isLoading: boolean;
  authPromptOpen: boolean;
  onAuthPromptChange: (open: boolean) => void;
  onDownload: (url: string, name: string) => void;
  onView: (url: string, fileName: string, fileType: 'image' | '3d-model' | 'web-icon') => void;
  onGenerate3D: (url: string, name: string) => void;
  onNavigateToStudio: () => void;
  onUploadClick: () => void;
}

const GalleryAuthSection: React.FC<GalleryAuthSectionProps> = ({
  images,
  isLoading,
  authPromptOpen,
  onAuthPromptChange,
  onDownload,
  onView,
  onGenerate3D,
  onNavigateToStudio,
  onUploadClick
}) => {
  return (
    <>
      <Header />
      <AuthPromptModal 
        open={authPromptOpen} 
        onOpenChange={onAuthPromptChange}
      />
      <PageTransition>
        <Helmet>
          <title>Gallery - Figuro</title>
          <meta name="description" content="Browse and manage your 3D models and images in your personal Figuro gallery." />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-dark to-figuro-accent/20 pt-24">
          <div className="container mx-auto px-4 py-8">
            <GalleryHeader onUploadClick={onUploadClick} />
            
            <GalleryGrid 
              images={images}
              isLoading={isLoading}
              onDownload={onDownload}
              onView={onView}
              onGenerate3D={onGenerate3D}
            />
            
            <CallToAction onNavigateToStudio={onNavigateToStudio} />
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default GalleryAuthSection;
