
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Users, 
  Heart, 
  TrendingUp, 
  Calendar, 
  Crown 
} from "lucide-react";

interface ExploreCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  count?: number;
}

interface GalleryExploreCardsProps {
  onCategorySelect: (category: string) => void;
}

const GalleryExploreCards: React.FC<GalleryExploreCardsProps> = ({ onCategorySelect }) => {
  const categories: ExploreCategory[] = [
    {
      id: "all",
      title: "All Models",
      description: "Browse the complete collection of 3D models",
      icon: Sparkles,
      gradient: "from-purple-500 via-violet-500 to-purple-600",
    },
    {
      id: "text-to-3d", 
      title: "AI Generated",
      description: "Models created with text-to-3D AI technology",
      icon: Crown,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    },
    {
      id: "traditional",
      title: "Traditional",
      description: "Classic 3D models and figurines",
      icon: Users,
      gradient: "from-orange-500 via-red-500 to-pink-500",
    },
    {
      id: "popular",
      title: "Most Popular",
      description: "Community favorites and trending models",
      icon: TrendingUp,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
    },
    {
      id: "liked",
      title: "Most Liked",
      description: "Models with the highest community ratings",
      icon: Heart,
      gradient: "from-pink-500 via-rose-500 to-red-500",
    },
    {
      id: "newest",
      title: "Latest Uploads",
      description: "Fresh models from our creative community",
      icon: Calendar,
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    // Map our category IDs to the filter system values
    const filterMap: Record<string, string> = {
      "all": "all",
      "text-to-3d": "text-to-3d", 
      "traditional": "traditional",
      "popular": "popular",
      "liked": "liked",
      "newest": "newest"
    };
    
    onCategorySelect(filterMap[categoryId] || "all");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => {
        const IconComponent = category.icon;
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card 
              className="relative overflow-hidden border-0 cursor-pointer group h-40 bg-transparent"
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Overlay Pattern */}
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Content */}
              <CardContent className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 group-hover:scale-105 transition-transform duration-200">
                      {category.title}
                    </h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                      <IconComponent size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white rounded-full"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GalleryExploreCards;
