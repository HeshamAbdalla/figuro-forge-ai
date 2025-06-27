
import * as React from "react"
import { motion } from "framer-motion"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/enhanced-toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "success" | "error" | "warning" | "info" | "loading"
  duration?: number
  persistent?: boolean
  showProgress?: boolean
  richContent?: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast(props: Toast | string) {
  const id = genId()
  
  // Handle string shorthand
  const toastProps: Toast = typeof props === "string" 
    ? { description: props, variant: "default" }
    : props

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...toastProps,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// Convenience methods
function success(props: Toast | string) {
  const toastProps = typeof props === "string" ? { description: props } : props
  return toast({ ...toastProps, variant: "success" })
}

function error(props: Toast | string) {
  const toastProps = typeof props === "string" ? { description: props } : props
  return toast({ ...toastProps, variant: "error" })
}

function warning(props: Toast | string) {
  const toastProps = typeof props === "string" ? { description: props } : props
  return toast({ ...toastProps, variant: "warning" })
}

function info(props: Toast | string) {
  const toastProps = typeof props === "string" ? { description: props } : props
  return toast({ ...toastProps, variant: "info" })
}

function loading(props: Toast | string) {
  const toastProps = typeof props === "string" ? { description: props } : props
  return toast({ ...toastProps, variant: "loading", persistent: true })
}

function promise<T>(
  promise: Promise<T>,
  {
    loading: loadingProps,
    success: successProps,
    error: errorProps,
  }: {
    loading?: Toast | string
    success?: Toast | string | ((data: T) => Toast | string)
    error?: Toast | string | ((error: any) => Toast | string)
  }
) {
  const id = genId()
  
  const loadingToast = typeof loadingProps === "string" 
    ? { description: loadingProps } 
    : loadingProps

  // Show loading toast
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...loadingToast,
      id,
      variant: "loading",
      persistent: true,
      open: true,
      onOpenChange: (open) => {
        if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id })
      },
    },
  })

  promise
    .then((data) => {
      const successToast = typeof successProps === "function" 
        ? successProps(data) 
        : successProps
      
      const finalSuccessProps = typeof successToast === "string"
        ? { description: successToast }
        : successToast

      dispatch({
        type: "UPDATE_TOAST",
        toast: {
          id,
          ...finalSuccessProps,
          variant: "success",
          persistent: false,
          duration: 5000,
        },
      })
    })
    .catch((error) => {
      const errorToast = typeof errorProps === "function" 
        ? errorProps(error) 
        : errorProps
      
      const finalErrorProps = typeof errorToast === "string"
        ? { description: errorToast }
        : errorToast

      dispatch({
        type: "UPDATE_TOAST",
        toast: {
          id,
          ...finalErrorProps,
          variant: "error",
          persistent: false,
          duration: 7000,
        },
      })
    })

  return { id, dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }) }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast, success, error, warning, info, loading, promise }
