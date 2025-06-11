"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';

interface Canvas3DWrapperProps {
  children: React.ReactNode;
  className?: string;
}

function LoadingFallback() {
  return (
    <group>
      {/* Loading indicator box */}
      <Box args={[2, 2, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#6b7280" wireframe />
      </Box>
      
      {/* Loading text */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
      >
        Loading 3D...
      </Text>
      
      {/* Basic lighting for fallback */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
    </group>
  );
}

// Simple test cube to verify 3D is working
function TestCube() {
  return (
    <group>
      <Box args={[1, 1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#00ff88" />
      </Box>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
    </group>
  );
}

export default function Canvas3DWrapper({ children, className = "" }: Canvas3DWrapperProps) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('3D Canvas Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-red-400 text-center">
          <div className="text-lg font-bold mb-2">3D Rendering Error</div>
          <div className="text-sm">Unable to load 3D visualization</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onError={(error) => {
          console.error('Canvas Error:', error);
          setHasError(true);
        }}
      >
        <React.Suspense fallback={<LoadingFallback />}>
          {/* Show test cube if children fail to render */}
          {children || <TestCube />}
        </React.Suspense>
      </Canvas>
    </div>
  );
} 