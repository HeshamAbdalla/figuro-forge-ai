
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, success, error, warning, info, loading, promise } from "@/hooks/use-enhanced-toast";
import { toastUtils, toastPromise } from "@/utils/toastUtils";

export const ToastDemo = () => {
  const handleBasicToasts = () => {
    success("Operation completed successfully!");
    error("Something went wrong!");
    warning("Please check your input.");
    info("Here's some helpful information.");
  };

  const handleAdvancedToasts = () => {
    toast({
      title: "Advanced Toast Example",
      description: "This toast has a title, description, and action button.",
      variant: "info",
      duration: 8000,
      actionLabel: "View Details",
      onAction: () => console.log("Action clicked!"),
      showProgress: true
    });
  };

  const handleLoadingToast = () => {
    const loadingToast = loading("Processing your request...");
    
    setTimeout(() => {
      loadingToast.update({
        id: loadingToast.id,
        title: "Processing complete! ✅",
        description: "Your request has been processed successfully.",
        variant: "success",
        persistent: false,
        duration: 5000
      });
    }, 3000);
  };

  const handlePromiseToast = () => {
    const mockPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("Success!") : reject(new Error("Failed!"));
      }, 2000);
    });

    promise(mockPromise, {
      loading: {
        title: "Processing...",
        description: "Please wait while we process your request."
      },
      success: {
        title: "Success! 🎉",
        description: "Your request was processed successfully."
      },
      error: {
        title: "Error occurred",
        description: "Something went wrong. Please try again."
      }
    });
  };

  const handleUtilityToasts = () => {
    toastUtils.auth.signInSuccess();
    setTimeout(() => toastUtils.generation.started("3D Model"), 1000);
    setTimeout(() => toastUtils.file.uploadSuccess(), 2000);
  };

  const handleRichContentToast = () => {
    toast({
      title: "Rich Content Toast",
      description: "This toast contains custom rich content below:",
      variant: "info",
      duration: 10000,
      richContent: (
        <div className="space-y-2">
          <div className="p-2 bg-white/10 rounded-md">
            <p className="text-xs text-white/90">File: model.obj</p>
            <p className="text-xs text-white/70">Size: 2.3 MB</p>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="h-6 text-xs">
              Download
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-xs">
              Share
            </Button>
          </div>
        </div>
      )
    });
  };

  const handlePersistentToast = () => {
    toast({
      title: "Persistent Toast",
      description: "This toast will stay until manually dismissed.",
      variant: "warning",
      persistent: true,
      actionLabel: "Dismiss",
      onAction: () => console.log("Persistent toast dismissed")
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Toast System Demo</CardTitle>
        <CardDescription>
          Try out the different toast variants and features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleBasicToasts} variant="outline">
            Basic Toasts
          </Button>
          
          <Button onClick={handleAdvancedToasts} variant="outline">
            Advanced Toast
          </Button>
          
          <Button onClick={handleLoadingToast} variant="outline">
            Loading Toast
          </Button>
          
          <Button onClick={handlePromiseToast} variant="outline">
            Promise Toast
          </Button>
          
          <Button onClick={handleUtilityToasts} variant="outline">
            Utility Toasts
          </Button>
          
          <Button onClick={handleRichContentToast} variant="outline">
            Rich Content
          </Button>
          
          <Button onClick={handlePersistentToast} variant="outline">
            Persistent Toast
          </Button>
          
          <Button 
            onClick={() => toast("Simple string toast!")} 
            variant="outline"
          >
            String Toast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
