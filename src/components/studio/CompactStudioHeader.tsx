
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const CompactStudioHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
          <Sparkles className="text-figuro-accent" size={16} />
          <span className="text-white font-medium">Figuro Studio</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
          <span>AI-Powered 3D Generation</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 rounded-full bg-figuro-accent/20 text-figuro-accent text-xs font-medium">
          Live
        </div>
      </div>
    </motion.div>
  );
};

export default CompactStudioHeader;
