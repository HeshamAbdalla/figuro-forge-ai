
import { toast, success, error, warning, info, loading, promise } from "@/hooks/use-enhanced-toast";

// Common toast patterns for the app
export const toastUtils = {
  // Authentication toasts
  auth: {
    signInSuccess: () => success({
      title: "Welcome back! 🎉",
      description: "You've been signed in successfully."
    }),
    
    signUpSuccess: () => success({
      title: "Account created! ✨",
      description: "Welcome to Figuros.AI! Please check your email to verify your account."
    }),
    
    signOutSuccess: () => info({
      title: "Signed out",
      description: "You've been signed out successfully."
    }),
    
    authError: (message?: string) => error({
      title: "Authentication failed",
      description: message || "Please check your credentials and try again."
    }),
    
    verificationSent: () => success({
      title: "Verification email sent! 📧",
      description: "Please check your inbox and click the verification link."
    })
  },

  // Generation toasts
  generation: {
    started: (type: string) => loading({
      title: `${type} generation started`,
      description: "Your creation is being processed..."
    }),
    
    success: (type: string) => success({
      title: `${type} generated successfully! 🎨`,
      description: "Your creation is ready to view and download."
    }),
    
    error: (type: string, message?: string) => error({
      title: `${type} generation failed`,
      description: message || "Something went wrong. Please try again."
    })
  },

  // File operations
  file: {
    uploadSuccess: () => success({
      title: "Upload successful! 📁",
      description: "Your file has been uploaded successfully."
    }),
    
    downloadStarted: () => info({
      title: "Download started",
      description: "Your file download has begun."
    }),
    
    deleteSuccess: () => success({
      title: "Deleted successfully",
      description: "The item has been removed."
    }),
    
    uploadError: (message?: string) => error({
      title: "Upload failed",
      description: message || "Failed to upload file. Please try again."
    })
  },

  // Subscription toasts
  subscription: {
    upgraded: () => success({
      title: "Subscription upgraded! 🚀",
      description: "You now have access to premium features."
    }),
    
    cancelled: () => warning({
      title: "Subscription cancelled",
      description: "Your subscription will remain active until the end of your billing period."
    }),
    
    paymentSuccess: () => success({
      title: "Payment successful! 💳",
      description: "Your payment has been processed successfully."
    }),
    
    paymentFailed: () => error({
      title: "Payment failed",
      description: "There was an issue processing your payment. Please try again."
    })
  },

  // Model operations
  model: {
    loadingStarted: () => loading({
      title: "Loading 3D model...",
      description: "Please wait while we prepare your model."
    }),
    
    loadingComplete: () => success({
      title: "Model loaded! 🎯",
      description: "Your 3D model is ready to view."
    }),
    
    loadingError: () => error({
      title: "Failed to load model",
      description: "There was an issue loading the 3D model. Please try again."
    }),
    
    conversionStarted: () => loading({
      title: "Converting model...",
      description: "Your model is being converted to the requested format."
    })
  },

  // Generic utilities
  generic: {
    copied: () => success({
      title: "Copied! 📋",
      description: "Content has been copied to clipboard."
    }),
    
    saved: () => success({
      title: "Saved! 💾",
      description: "Your changes have been saved."
    }),
    
    networkError: () => error({
      title: "Network error",
      description: "Please check your connection and try again."
    }),
    
    unexpectedError: () => error({
      title: "Something went wrong",
      description: "An unexpected error occurred. Please try again."
    })
  }
};

// Promise wrapper for common async operations
export const toastPromise = {
  auth: <T>(promise: Promise<T>, operation: string) => 
    promise({
      loading: `${operation}...`,
      success: `${operation} successful!`,
      error: `${operation} failed. Please try again.`
    }),
  
  generation: <T>(promise: Promise<T>, type: string) =>
    promise({
      loading: {
        title: `Generating ${type}...`,
        description: "This may take a few moments."
      },
      success: (data: T) => ({
        title: `${type} generated! 🎨`,
        description: "Your creation is ready!"
      }),
      error: (error: any) => ({
        title: `${type} generation failed`,
        description: error?.message || "Something went wrong. Please try again."
      })
    }),
  
  upload: <T>(promise: Promise<T>) =>
    promise({
      loading: "Uploading file...",
      success: "Upload complete! 📁",
      error: "Upload failed. Please try again."
    })
};

export { toast, success, error, warning, info, loading, promise };
