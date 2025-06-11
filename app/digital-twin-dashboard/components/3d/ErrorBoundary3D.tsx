"use client";

import React, { useState, useEffect } from 'react';

interface ErrorBoundary3DProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorInfo {
  error: Error | null;
  errorInfo: string | null;
}

export default function ErrorBoundary3D({ children, fallback }: ErrorBoundary3DProps) {
  const [errorInfo, setErrorInfo] = useState({ error: null, errorInfo: null });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('3D Error caught by boundary:', event.error);
      setErrorInfo({
        error: event.error,
        errorInfo: event.error?.stack || 'Unknown error'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('3D Promise rejection caught by boundary:', event.reason);
      setErrorInfo({
        error: new Error(event.reason),
        errorInfo: event.reason?.toString() || 'Promise rejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const resetError = () => {
    setErrorInfo({ error: null, errorInfo: null });
  };

  if (errorInfo.error) {
    return (
      fallback || (
        <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-lg border border-red-500/30">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-400 text-xl font-bold mb-4">
              3D Rendering Error
            </div>
            <div className="text-gray-300 text-sm mb-4">
              Unable to load 3D visualization. This might be due to:
            </div>
            <ul className="text-gray-400 text-xs text-left mb-6 space-y-1">
              <li>• WebGL compatibility issues</li>
              <li>• Graphics driver problems</li>
              <li>• Browser limitations</li>
              <li>• Component loading errors</li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={resetError}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Try Again
              </button>
              <div className="text-xs text-gray-500">
                Error: {errorInfo.error.message}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
} 