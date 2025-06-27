
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-[420px] flex-col gap-3 p-4 md:max-w-[520px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start justify-between space-x-4 overflow-hidden rounded-xl border backdrop-blur-xl p-4 pr-8 shadow-2xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "border-white/20 bg-white/10 text-white",
        success: "border-green-500/30 bg-green-500/10 text-white",
        error: "border-red-500/30 bg-red-500/10 text-white",
        warning: "border-yellow-500/30 bg-yellow-500/10 text-white",
        info: "border-blue-500/30 bg-blue-500/10 text-white",
        loading: "border-figuro-accent/30 bg-figuro-accent/10 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      duration?: number;
      persistent?: boolean;
    }
>(({ className, variant, duration = 5000, persistent = false, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={persistent ? Infinity : duration}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-figuro-accent focus:ring-offset-2 focus:ring-offset-figuro-dark disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-white/50 opacity-0 transition-opacity hover:text-white/80 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-figuro-accent group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-white", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-white/80 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastIcon = ({ variant }: { variant?: string }) => {
  const iconProps = { className: "h-5 w-5 flex-shrink-0 mt-0.5" }
  
  switch (variant) {
    case "success":
      return <CheckCircle className={cn(iconProps.className, "text-green-400")} />
    case "error":
      return <AlertCircle className={cn(iconProps.className, "text-red-400")} />
    case "warning":
      return <AlertTriangle className={cn(iconProps.className, "text-yellow-400")} />
    case "info":
      return <Info className={cn(iconProps.className, "text-blue-400")} />
    case "loading":
      return <Loader2 className={cn(iconProps.className, "text-figuro-accent animate-spin")} />
    default:
      return <Info className={cn(iconProps.className, "text-white/60")} />
  }
}

const ToastProgress = React.forwardRef<
  HTMLDivElement,
  {
    className?: string;
    variant?: string;
    duration?: number;
  }
>(({ className, variant, duration = 5000 }, ref) => {
  const progressColor = React.useMemo(() => {
    switch (variant) {
      case "success": return "bg-gradient-to-r from-green-400 to-emerald-400"
      case "error": return "bg-gradient-to-r from-red-400 to-pink-400"
      case "warning": return "bg-gradient-to-r from-yellow-400 to-orange-400"
      case "info": return "bg-gradient-to-r from-blue-400 to-cyan-400"
      case "loading": return "bg-gradient-to-r from-figuro-accent to-purple-400"
      default: return "bg-gradient-to-r from-white/40 to-white/20"
    }
  }, [variant])

  return (
    <motion.div
      ref={ref}
      className={cn(
        "absolute bottom-0 left-0 h-1 rounded-b-xl",
        progressColor,
        className
      )}
      initial={{ width: "100%" }}
      animate={{ width: "0%" }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  )
})
ToastProgress.displayName = "ToastProgress"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  ToastProgress,
}
