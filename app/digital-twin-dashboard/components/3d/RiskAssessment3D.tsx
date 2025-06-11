"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Box, 
  Text, 
  Sphere, 
  Cylinder, 
  RoundedBox,
  OrbitControls, 
  Environment,
  Html,
  Billboard
} from '@react-three/drei';
import * as THREE from 'three';

interface RiskFactor {
  category: string;
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface RiskAssessment3DProps {
  riskFactors: RiskFactor[];
}

// Simple Risk Node Component
function SimpleRiskNode({ risk, position, index }: { risk: RiskFactor; position: [number, number, number]; index: number }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Dynamic floating based on risk level
      const intensity = risk.severity === 'critical' ? 0.3 : risk.severity === 'high' ? 0.2 : 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * intensity;
      
      // Rotation speed based on severity
      const rotationSpeed = risk.severity === 'critical' ? 0.02 : risk.severity === 'high' ? 0.015 : 0.01;
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  const riskColor = useMemo(() => {
    switch (risk.severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffaa00';
      case 'low': return '#00ff88';
      default: return '#888888';
    }
  }, [risk.severity]);

  const nodeSize = useMemo(() => {
    const baseSize = 0.3;
    const sizeMultiplier = risk.value / 100;
    return baseSize + (sizeMultiplier * 0.4);
  }, [risk.value]);

  return (
    <group ref={meshRef} position={position}>
      {/* Main risk node */}
      <Sphere args={[nodeSize]}>
        <meshStandardMaterial
          color={riskColor}
          metalness={0.7}
          roughness={0.3}
          emissive={riskColor}
          emissiveIntensity={0.3 + (risk.value / 100) * 0.4}
        />
      </Sphere>

      {/* Risk level indicator ring */}
      <RoundedBox args={[nodeSize * 2.2, 0.05, nodeSize * 2.2]} position={[0, 0, 0]} radius={0.02}>
        <meshBasicMaterial 
          color={riskColor}
          transparent
          opacity={0.3}
        />
      </RoundedBox>

      {/* Critical alert indicators */}
      {risk.severity === 'critical' && (
        <group>
          {Array.from({ length: 4 }, (_, i) => (
            <Cylinder key={i} args={[0.05, 0.05, 0.3]} position={[
              Math.cos(i * Math.PI / 2) * (nodeSize + 0.5),
              0.2,
              Math.sin(i * Math.PI / 2) * (nodeSize + 0.5)
            ]}>
              <meshStandardMaterial 
                color="#ff0000"
                emissive="#ff0000"
                emissiveIntensity={0.8}
              />
            </Cylinder>
          ))}
        </group>
      )}

      {/* Risk category label */}
      <Text
        position={[0, -nodeSize - 0.3, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {risk.category}
      </Text>
      
      <Text
        position={[0, -nodeSize - 0.5, 0]}
        fontSize={0.1}
        color={riskColor}
        anchorX="center"
        anchorY="middle"
      >
        {`${risk.value.toFixed(1)} - ${risk.severity.toUpperCase()}`}
      </Text>
    </group>
  );
}

// Simple Risk Grid
function SimpleRiskGrid() {
  return (
    <group>
      {/* Grid floor */}
      <RoundedBox args={[12, 0.1, 12]} position={[0, -1, 0]} radius={0.05}>
        <meshStandardMaterial 
          color="#0a0a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>

      {/* Grid lines */}
      {Array.from({ length: 13 }, (_, i) => (
        <group key={`risk-grid-${i}`}>
          <Box args={[0.01, 0.01, 12]} position={[-6 + i, -0.95, 0]}>
            <meshBasicMaterial color="#ff4444" transparent opacity={0.2} />
          </Box>
          <Box args={[12, 0.01, 0.01]} position={[0, -0.95, -6 + i]}>
            <meshBasicMaterial color="#ff4444" transparent opacity={0.2} />
          </Box>
        </group>
      ))}

      {/* Central warning beacon */}
      <Cylinder args={[0.2, 0.2, 1.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial 
          color="#ff4444" 
          emissive="#ff4444" 
          emissiveIntensity={0.4}
        />
      </Cylinder>
    </group>
  );
}

// Simple Risk Analysis HUD
function SimpleRiskHUD({ riskFactors }: { riskFactors: RiskFactor[] }) {
  const analysis = useMemo(() => {
    const total = riskFactors.length;
    const critical = riskFactors.filter(r => r.severity === 'critical').length;
    const high = riskFactors.filter(r => r.severity === 'high').length;
    const avgScore = riskFactors.reduce((sum, r) => sum + r.value, 0) / total;
    
    let overallStatus = 'SECURE';
    let statusColor = '#00ff88';
    
    if (critical > 0) {
      overallStatus = 'CRITICAL';
      statusColor = '#ff0000';
    } else if (high > 1) {
      overallStatus = 'HIGH RISK';
      statusColor = '#ff6600';
    } else if (avgScore > 50) {
      overallStatus = 'ELEVATED';
      statusColor = '#ffaa00';
    }
    
    return { total, critical, high, avgScore, overallStatus, statusColor };
  }, [riskFactors]);

  return (
    <Billboard position={[6, 3, 0]}>
      <Html transform distanceFactor={8}>
        <div className="bg-black/90 backdrop-blur-xl rounded-lg p-4 border border-red-400/30 min-w-64 shadow-xl">
          <div className="flex items-center mb-3 pb-2 border-b border-red-400/30">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                analysis.critical > 0 ? 'animate-ping' : 'animate-pulse'
              }`}
              style={{ backgroundColor: analysis.statusColor }}
            ></div>
            <h3 className="text-red-400 font-mono font-bold text-sm">RISK ANALYSIS</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="font-mono font-bold" style={{ color: analysis.statusColor }}>
                {analysis.overallStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Score:</span>
              <span className="text-white font-mono">{analysis.avgScore.toFixed(1)}/100</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-red-400/30">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-red-400">Critical:</span>
                <span className="text-white font-mono">{analysis.critical}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-400">High:</span>
                <span className="text-white font-mono">{analysis.high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-white font-mono">{analysis.total}</span>
              </div>
            </div>
          </div>

          {analysis.critical > 0 && (
            <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-500/50">
              <div className="text-red-400 text-xs font-bold">ACTION REQUIRED</div>
              <div className="text-gray-300 text-xs">
                {analysis.critical} critical risk{analysis.critical > 1 ? 's' : ''} detected
              </div>
            </div>
          )}
        </div>
      </Html>
    </Billboard>
  );
}

// Main RiskAssessment3D Component
export default function RiskAssessment3D({ riskFactors }: RiskAssessment3DProps) {
  // Generate positions for risk nodes in a circle
  const nodePositions = useMemo(() => {
    return riskFactors.map((_, index) => {
      const angle = (index / riskFactors.length) * Math.PI * 2;
      const radius = 4;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number];
    });
  }, [riskFactors]);

  return (
    <group>
      {/* Basic Environment */}
      <Environment preset="dawn" />
      
      {/* Simple Lighting */}
      <ambientLight intensity={0.2} color="#660000" />
      <pointLight position={[10, 10, 8]} intensity={1.2} />
      <pointLight position={[-10, 8, -8]} intensity={0.6} color="#ff4444" />

      {/* Risk Grid */}
      <SimpleRiskGrid />

      {/* Risk Nodes */}
      {riskFactors.map((risk, index) => (
        <SimpleRiskNode
          key={risk.category}
          risk={risk}
          position={nodePositions[index]}
          index={index}
        />
      ))}

      {/* Risk Analysis HUD */}
      <SimpleRiskHUD riskFactors={riskFactors} />

      {/* Camera Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={25}
        minDistance={6}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </group>
  );
} 