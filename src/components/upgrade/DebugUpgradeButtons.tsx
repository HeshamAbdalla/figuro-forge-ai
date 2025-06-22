
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import TestUpgradeModal from "./TestUpgradeModal";
import { AlertTriangle, Zap, Crown } from "lucide-react";

const DebugUpgradeButtons: React.FC = () => {
  const [testModalOpen, setTestModalOpen] = useState(false);
  const { showUpgradeNotification } = useUpgradeNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 bg-black/80 p-4 rounded-lg border border-white/20">
      <h3 className="text-white font-bold text-sm">Debug Upgrade Notifications</h3>
      
      {/* Test Buttons */}
      <div className="flex flex-col gap-1">
        <Button
          size="sm"
          onClick={() => {
            console.log('🚀 [DEBUG] Triggering image_generation notification');
            showUpgradeNotification('image_generation');
          }}
          className="bg-blue-500 hover:bg-blue-600 text-xs py-1"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Image Limit
        </Button>
        
        <Button
          size="sm"
          onClick={() => {
            console.log('🚀 [DEBUG] Triggering model_conversion notification');
            showUpgradeNotification('model_conversion');
          }}
          className="bg-purple-500 hover:bg-purple-600 text-xs py-1"
        >
          <Zap className="w-3 h-3 mr-1" />
          3D Limit
        </Button>
        
        <Button
          size="sm"
          onClick={() => {
            console.log('🚀 [DEBUG] Triggering model_remesh notification');
            showUpgradeNotification('model_remesh');
          }}
          className="bg-green-500 hover:bg-green-600 text-xs py-1"
        >
          <Crown className="w-3 h-3 mr-1" />
          Remesh Limit
        </Button>
        
        <Button
          size="sm"
          onClick={() => {
            console.log('🧪 [DEBUG] Opening test modal');
            setTestModalOpen(true);
          }}
          className="bg-red-500 hover:bg-red-600 text-xs py-1"
        >
          Test Modal
        </Button>
      </div>

      {/* Test Modal */}
      <TestUpgradeModal
        isOpen={testModalOpen}
        onOpenChange={setTestModalOpen}
      />
    </div>
  );
};

export default DebugUpgradeButtons;
