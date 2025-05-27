
import { motion } from "framer-motion";
import { Sparkles, Wand2, GalleryHorizontal } from "lucide-react";
import { TabKey } from "@/hooks/useTabNavigation";

interface EnhancedStudioTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  className?: string;
}

const tabConfig = [
  {
    key: 'image-to-3d' as TabKey,
    label: 'Image to 3D',
    icon: Wand2,
    description: 'Generate from text'
  },
  {
    key: 'text-to-3d' as TabKey,
    label: 'Text to 3D',
    icon: Sparkles,
    description: 'Direct 3D creation'
  },
  {
    key: 'gallery' as TabKey,
    label: 'Gallery',
    icon: GalleryHorizontal,
    description: 'Your collection'
  }
];

const EnhancedStudioTabs = ({ activeTab, onTabChange, className = "" }: EnhancedStudioTabsProps) => {
  return (
    <div className={`flex justify-center mb-8 ${className}`}>
      <div className="glass-panel border-white/20 backdrop-blur-sm rounded-xl p-2">
        <div className="flex gap-2">
          {tabConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`
                  relative px-6 py-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2 min-w-[120px]
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-white/70 hover:text-white/90 hover:bg-white/5'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-figuro-accent rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <Icon size={20} className={isActive ? 'text-white' : 'text-white/70'} />
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {tab.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                      {tab.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudioTabs;
