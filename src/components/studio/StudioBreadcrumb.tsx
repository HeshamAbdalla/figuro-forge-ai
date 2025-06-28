
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";

interface StudioBreadcrumbProps {
  currentPage: string;
  description?: string;
}

const StudioBreadcrumb = ({ currentPage, description }: StudioBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col space-y-4"
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/studio')}
          className="text-white/60 hover:text-white p-0 h-auto font-normal"
        >
          <Home className="w-4 h-4 mr-1" />
          Studio Hub
        </Button>
        <span className="text-white/40">/</span>
        <span className="text-figuro-accent font-medium">{currentPage}</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{currentPage}</h1>
          {description && (
            <p className="text-white/70 mt-2">{description}</p>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => navigate('/studio')}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>
      </div>
    </motion.div>
  );
};

export default StudioBreadcrumb;
