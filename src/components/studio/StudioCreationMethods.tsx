
import { motion } from "framer-motion";
import { IconHover3D } from "@/components/ui/icon-3d-hover";
import { 
  Camera, 
  Type, 
  Palette, 
  Grid3X3,
  Images
} from "lucide-react";

interface CreationMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
}

interface StudioCreationMethodsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const StudioCreationMethods = ({ 
  activeTab, 
  onTabChange, 
  className = "" 
}: StudioCreationMethodsProps) => {
  
  const creationMethods: CreationMethod[] = [
    {
      id: 'image-to-3d',
      title: '✨ Image to 3D Magic',
      description: "Transform your images into stunning 3D models with AI-powered conversion technology.",
      icon: Camera,
      onClick: () => onTabChange('image-to-3d')
    },
    {
      id: 'text-to-3d',
      title: '🎨 Text to 3D Creation',
      description: 'Generate amazing 3D models directly from text descriptions using advanced AI.',
      icon: Type,
      onClick: () => onTabChange('text-to-3d')
    },
    {
      id: 'camera',
      title: '📸 Camera Capture',
      description: 'Capture photos in real-time and instantly convert them to interactive 3D models.',
      icon: Camera,
      onClick: () => onTabChange('camera')
    },
    {
      id: 'web-icons',
      title: '🎭 Icon Workshop',
      description: 'Create professional web icons and graphics with customizable styles and formats.',
      icon: Palette,
      onClick: () => onTabChange('web-icons')
    },
    {
      id: 'gallery',
      title: '🏛️ Gallery Collection',
      description: 'Browse and manage your collection of 3D models and creative works.',
      icon: Grid3X3,
      onClick: () => onTabChange('gallery')
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {creationMethods.map((method, index) => (
        <motion.div
          key={method.id}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 120 
          }}
          className="relative"
        >
          <IconHover3D
            heading={method.title}
            text={method.description}
            onClick={method.onClick}
            width={350}
            height={140}
            className={`w-full transition-all duration-300 ${
              activeTab === method.id 
                ? 'ring-2 ring-primary/50 bg-primary/5' 
                : 'hover:bg-muted/5'
            }`}
            style={{
              border: activeTab === method.id 
                ? '2px solid hsl(var(--primary))' 
                : '1px solid hsl(var(--border))'
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StudioCreationMethods;
