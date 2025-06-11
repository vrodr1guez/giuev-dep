'use client';

import { Toast, ToastActionElement, ToastProps } from "../../components/ui/toast";
import {
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "../../components/ui/toast";
import React, { createContext, useCallback, useContext, useState } from "react";

type ToastContextType = {
  toast: (props: ToastOptions) => void;
  dismiss: (toastId?: string) => void;
};

const ToastContext = createContext(null as ToastContextType | null);

export interface ToastOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
}

export const ToastContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toasts, setToasts] = useState([] as ToastOptions[]);

  const toast = useCallback(
    ({ id = crypto.randomUUID(), ...props }: ToastOptions) => {
      setToasts((prev) => [...prev, { id, ...props }]);
      
      if (props.duration !== Infinity) {
        setTimeout(() => {
          dismiss(id);
        }, props.duration || 5000);
      }
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prev) =>
      toastId
        ? prev.filter((toast) => toast.id !== toastId)
        : prev.slice(0, prev.length - 1)
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastProvider>
        {toasts.map(({ id, title, description, action, variant }) => (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastContextProvider");
  }
  return context;
}; 