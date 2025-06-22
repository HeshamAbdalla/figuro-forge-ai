
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TestUpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestUpgradeModal: React.FC<TestUpgradeModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  console.log('🧪 [TEST-MODAL] Rendering with isOpen:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-red-500 border-2 border-yellow-400 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            TEST MODAL - DO YOU SEE ME?
          </DialogTitle>
          <DialogDescription className="text-white">
            This is a test modal to verify Dialog rendering works.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-blue-500 text-white text-center">
          <p className="text-lg font-bold">BRIGHT TEST MODAL</p>
          <p>If you can see this, the Dialog component works!</p>
        </div>

        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-green-500 hover:bg-green-600 text-black font-bold"
          >
            CLOSE TEST
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestUpgradeModal;
