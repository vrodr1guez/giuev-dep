"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface EnergyParticleSystemProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  intensity: number; // 0-1, controls particle count and speed
  direction: 'to-grid' | 'from-grid';
  color: string;
  particleCount?: number;
}

export function EnergyParticleSystem({
  startPosition,
  endPosition,
  intensity,
  direction,
  color,
  particleCount = 50
}: EnergyParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Performance optimization: reduce particle count based on intensity
  const actualParticleCount = Math.max(10, Math.floor(particleCount * intensity));
  
  // Memoized particle system - only recalculate when positions change
  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions = new Float32Array(actualParticleCount * 3);
    const velocities = new Float32Array(actualParticleCount * 3);
    const lifetimes = new Float32Array(actualParticleCount);
    
    // Calculate path vector
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);
    const pathVector = end.clone().sub(start);
    const pathLength = pathVector.length();
    
    for (let i = 0; i < actualParticleCount; i++) {
      const i3 = i * 3;
      
      // Distribute particles along the path
      const progress = i / actualParticleCount;
      const currentPos = start.clone().add(pathVector.clone().multiplyScalar(progress));
      
      // Add some randomness for visual appeal
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      currentPos.add(randomOffset);
      
      positions[i3] = currentPos.x;
      positions[i3 + 1] = currentPos.y;
      positions[i3 + 2] = currentPos.z;
      
      // Calculate velocity direction
      const velocity = pathVector.clone().normalize();
      if (direction === 'from-grid') {
        velocity.multiplyScalar(-1); // Reverse direction
      }
      
      // Add speed variation based on intensity
      const speed = 0.5 + intensity * 1.5;
      velocity.multiplyScalar(speed);
      
      velocities[i3] = velocity.x;
      velocities[i3 + 1] = velocity.y;
      velocities[i3 + 2] = velocity.z;
      
      // Random lifetime for continuous flow effect
      lifetimes[i] = Math.random() * 2 + 1; // 1-3 seconds
    }
    
    return { positions, velocities, lifetimes };
  }, [startPosition, endPosition, actualParticleCount, direction, intensity]);
  
  // Animated particle system
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const positions = positionAttribute.array as Float32Array;
    
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);
    const pathVector = end.clone().sub(start);
    
    for (let i = 0; i < actualParticleCount; i++) {
      const i3 = i * 3;
      
      // Update particle positions
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Update lifetimes
      lifetimes[i] -= delta;
      
      // Reset particles that have reached the end or expired
      if (lifetimes[i] <= 0) {
        // Reset to start position with random offset
        const resetPos = direction === 'to-grid' ? start.clone() : end.clone();
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        resetPos.add(randomOffset);
        
        positions[i3] = resetPos.x;
        positions[i3 + 1] = resetPos.y;
        positions[i3 + 2] = resetPos.z;
        
        lifetimes[i] = Math.random() * 2 + 1; // Reset lifetime
      }
    }
    
    positionAttribute.needsUpdate = true;
    
    // Animate material opacity based on intensity
    if (materialRef.current) {
      materialRef.current.opacity = 0.3 + intensity * 0.7;
    }
  });
  
  // Memoized geometry for performance
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);
  
  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        color={color}
        size={0.05}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        vertexColors={false}
      />
    </points>
  );
}

// Enhanced Energy Flow Tube for high-intensity connections
export function EnergyFlowTube({
  startPosition,
  endPosition,
  intensity,
  direction,
  color
}: EnergyParticleSystemProps) {
  const tubeRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Create tube geometry
  const tubeGeometry = useMemo(() => {
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);
    
    // Create curve for the tube
    const curve = new THREE.LineCurve3(start, end);
    
    return new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
  }, [startPosition, endPosition]);
  
  // Animate tube material
  useFrame((state) => {
    if (materialRef.current) {
      // Pulsing effect based on energy flow
      const pulseIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2 * intensity;
      materialRef.current.emissiveIntensity = pulseIntensity;
      
      // Direction-based color animation
      if (direction === 'to-grid') {
        materialRef.current.emissive.setHex(0x00ff88);
      } else {
        materialRef.current.emissive.setHex(0x0088ff);
      }
    }
  });
  
  return (
    <mesh ref={tubeRef} geometry={tubeGeometry}>
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.6 + intensity * 0.4}
      />
    </mesh>
  );
}

// Lightning-style energy arc for high-power V2G connections
export function EnergyLightningArc({
  startPosition,
  endPosition,
  intensity,
  direction,
  color
}: EnergyParticleSystemProps) {
  const lineRef = useRef<THREE.Line>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  
  // Generate lightning-like path
  const lightningPath = useMemo(() => {
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...endPosition);
    const points: THREE.Vector3[] = [];
    
    const segments = 10;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = start.clone().lerp(end, t);
      
      // Add random offset for lightning effect (except endpoints)
      if (i > 0 && i < segments) {
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.8
        );
        point.add(randomOffset);
      }
      
      points.push(point);
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [startPosition, endPosition]);
  
  // Animate lightning effect
  useFrame((state) => {
    if (materialRef.current) {
      // Flickering effect
      const flicker = Math.random() > 0.7 ? 1 : 0.3;
      materialRef.current.opacity = flicker * intensity;
    }
  });
  
  return (
    <line ref={lineRef} geometry={lightningPath}>
      <lineBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.8}
        linewidth={2}
      />
    </line>
  );
}

// Main Energy Flow Visualization Component
export default function EnergyFlowVisualization({
  startPosition,
  endPosition,
  intensity,
  direction,
  color,
  particleCount = 50
}: EnergyParticleSystemProps) {
  // Choose visualization type based on intensity
  if (intensity > 0.8) {
    // High intensity: Lightning arc + particles
    return (
      <group>
        <EnergyLightningArc
          startPosition={startPosition}
          endPosition={endPosition}
          intensity={intensity}
          direction={direction}
          color={color}
        />
        <EnergyParticleSystem
          startPosition={startPosition}
          endPosition={endPosition}
          intensity={intensity}
          direction={direction}
          color={color}
          particleCount={particleCount * 2}
        />
      </group>
    );
  } else if (intensity > 0.4) {
    // Medium intensity: Tube + particles
    return (
      <group>
        <EnergyFlowTube
          startPosition={startPosition}
          endPosition={endPosition}
          intensity={intensity}
          direction={direction}
          color={color}
        />
        <EnergyParticleSystem
          startPosition={startPosition}
          endPosition={endPosition}
          intensity={intensity}
          direction={direction}
          color={color}
          particleCount={particleCount}
        />
      </group>
    );
  } else {
    // Low intensity: Particles only
    return (
      <EnergyParticleSystem
        startPosition={startPosition}
        endPosition={endPosition}
        intensity={intensity}
        direction={direction}
        color={color}
        particleCount={Math.max(10, particleCount * 0.5)}
      />
    );
  }
} 