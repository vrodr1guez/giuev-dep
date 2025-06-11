"use client";

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Box, 
  Sphere, 
  Cylinder, 
  RoundedBox,
  Html,
  Text,
  OrbitControls,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';

interface OCPPConnector {
  id: number;
  connectorNumber: number;
  connectorType: 'CCS1' | 'CCS2' | 'CHAdeMO' | 'Type1' | 'Type2' | 'GBT' | 'NACS' | 'Other';
  maxPowerKw: number;
  status: 'available' | 'occupied' | 'reserved' | 'out_of_service' | 'faulted';
  currentPowerKw?: number;
  currentSession?: {
    sessionId: string;
    vehicleId: string;
    startTime: string;
    currentEnergy: number;
  };
}

interface OCPPChargingStation {
  id: number;
  chargePointId: string;
  name: string;
  position: [number, number, number];
  status: 'available' | 'preparing' | 'charging' | 'suspended_evse' | 'suspended_ev' | 'finishing' | 'reserved' | 'unavailable' | 'faulted';
  connectors: OCPPConnector[];
  maxPowerKw: number;
  currentLoadPct: number;
  temperature?: number;
  lastSeen: string;
  isOnline: boolean;
  ocppVersion: string;
  firmwareVersion?: string;
  errorCode?: string;
  maintenanceAlert: boolean;
}

interface OCPPChargingNetwork3DProps {
  stations: OCPPChargingStation[];
  onStationClick?: (station: OCPPChargingStation) => void;
  onConnectorClick?: (station: OCPPChargingStation, connector: OCPPConnector) => void;
  showLoadBalancing?: boolean;
  autoRotate?: boolean;
}

// Individual OCPP Charging Station 3D Component
function OCPPStation3D({ 
  station, 
  isSelected, 
  onClick,
  onConnectorClick,
  showLoadBalancing = false
}: {
  station: OCPPChargingStation;
  isSelected: boolean;
  onClick: () => void;
  onConnectorClick: (connector: OCPPConnector) => void;
  showLoadBalancing?: boolean;
}) {
  const stationRef = useRef<THREE.Group>(null);
  const alertRef = useRef<THREE.Group>(null);
  
  // Performance optimized animations
  useFrame((state) => {
    if (stationRef.current) {
      // Subtle breathing animation for active stations
      if (station.isOnline && station.status !== 'faulted') {
        const breathe = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        stationRef.current.scale.setScalar(breathe);
      }
    }
    
    if (alertRef.current && station.maintenanceAlert) {
      // Alert pulsing animation
      alertRef.current.rotation.y = state.clock.elapsedTime * 3;
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
      alertRef.current.scale.setScalar(pulse);
    }
  });

  // Memoized station colors based on status
  const stationColor = useMemo(() => {
    if (!station.isOnline) return '#333333';
    
    switch (station.status) {
      case 'available': return '#00ff00';
      case 'charging': return '#0088ff';
      case 'preparing': return '#ffaa00';
      case 'reserved': return '#ff8800';
      case 'faulted': return '#ff0000';
      case 'unavailable': return '#666666';
      default: return '#888888';
    }
  }, [station.isOnline, station.status]);

  // Load balancing visualization
  const loadIntensity = useMemo(() => {
    return station.currentLoadPct / 100;
  }, [station.currentLoadPct]);

  return (
    <group ref={stationRef} position={station.position} onClick={onClick}>
      {/* Main Station Body */}
      <RoundedBox args={[1.2, 2.5, 0.8]} radius={0.1}>
        <meshStandardMaterial
          color={stationColor}
          emissive={station.isOnline ? stationColor : '#000000'}
          emissiveIntensity={station.isOnline ? 0.2 : 0}
          metalness={0.6}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Station Display Screen */}
      <RoundedBox args={[0.8, 0.6, 0.05]} position={[0, 0.8, 0.45]} radius={0.02}>
        <meshStandardMaterial
          color={station.isOnline ? '#000020' : '#000000'}
          emissive={station.isOnline ? '#0044ff' : '#000000'}
          emissiveIntensity={station.isOnline ? 0.3 : 0}
        />
      </RoundedBox>

      {/* OCPP Version Indicator */}
      <Text
        position={[0, 0.8, 0.5]}
        fontSize={0.08}
        color={station.isOnline ? '#00ffff' : '#666666'}
        anchorX="center"
        anchorY="middle"
      >
        OCPP {station.ocppVersion}
      </Text>

      {/* Connectors */}
      {station.connectors.map((connector, index) => {
        const connectorX = (index - (station.connectors.length - 1) / 2) * 0.4;
        const connectorColor = useMemo(() => {
          switch (connector.status) {
            case 'available': return '#00ff00';
            case 'occupied': return '#0088ff';
            case 'reserved': return '#ff8800';
            case 'out_of_service': return '#666666';
            case 'faulted': return '#ff0000';
            default: return '#888888';
          }
        }, [connector.status]);

        return (
          <group 
            key={connector.id} 
            position={[connectorX, -0.5, 0.5]}
            onClick={(e) => {
              e.stopPropagation();
              onConnectorClick(connector);
            }}
          >
            {/* Connector Socket */}
            <Cylinder args={[0.08, 0.08, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color={connectorColor}
                emissive={connectorColor}
                emissiveIntensity={0.4}
              />
            </Cylinder>

            {/* Connector Type Label */}
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.05}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {connector.connectorType}
            </Text>

            {/* Power Output Indicator */}
            {connector.currentPowerKw && connector.currentPowerKw > 0 && (
              <Text
                position={[0, -0.4, 0]}
                fontSize={0.04}
                color="#00ffff"
                anchorX="center"
                anchorY="middle"
              >
                {connector.currentPowerKw.toFixed(1)}kW
              </Text>
            )}

            {/* Active Session Indicator */}
            {connector.currentSession && (
              <Sphere args={[0.03]} position={[0, 0.15, 0]}>
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={0.8}
                />
              </Sphere>
            )}
          </group>
        );
      })}

      {/* Load Balancing Visualization */}
      {showLoadBalancing && station.currentLoadPct > 10 && (
        <group position={[0, 1.5, 0]}>
          {/* Load percentage ring */}
          <Cylinder args={[0.5, 0.5, 0.1]} rotation={[0, 0, 0]}>
            <meshStandardMaterial
              color="#ffaa00"
              transparent
              opacity={0.3}
            />
          </Cylinder>
          
          {/* Load indicator */}
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.1}
            color="#ffaa00"
            anchorX="center"
            anchorY="middle"
          >
            {station.currentLoadPct.toFixed(0)}%
          </Text>
        </group>
      )}

      {/* Maintenance Alert */}
      {station.maintenanceAlert && (
        <group ref={alertRef} position={[0.8, 1.5, 0]}>
          <Sphere args={[0.1]}>
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.8}
            />
          </Sphere>
          
          <Text
            position={[0, -0.2, 0]}
            fontSize={0.05}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
          >
            ALERT
          </Text>
        </group>
      )}

      {/* Station Status Label */}
      <Html position={[0, -1.8, 0]} center>
        <div className={`bg-black/80 text-white px-2 py-1 rounded text-xs ${isSelected ? 'border border-blue-400' : ''}`}>
          <div className="text-center">
            <div className="font-semibold">{station.name}</div>
            <div className="text-gray-300">{station.chargePointId}</div>
            <div className={`text-xs capitalize ${
              station.isOnline ? 'text-green-400' : 'text-red-400'
            }`}>
              {station.isOnline ? station.status : 'Offline'}
            </div>
            <div className="text-gray-400 text-xs">
              {station.connectors.filter(c => c.status === 'available').length}/{station.connectors.length} Available
            </div>
            {station.currentLoadPct > 0 && (
              <div className="text-yellow-400 text-xs">
                Load: {station.currentLoadPct.toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </Html>

      {/* Selection indicator */}
      {isSelected && (
        <Cylinder args={[1.5, 1.5, 0.1]} position={[0, -1.3, 0]}>
          <meshStandardMaterial
            color="#0088ff"
            transparent
            opacity={0.2}
            wireframe
          />
        </Cylinder>
      )}

      {/* Error indicator */}
      {station.errorCode && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-red-900/90 text-red-200 px-2 py-1 rounded text-xs">
            Error: {station.errorCode}
          </div>
        </Html>
      )}
    </group>
  );
}

// Main OCPP Charging Network 3D Component
export default function OCPPChargingNetwork3D({
  stations,
  onStationClick,
  onConnectorClick,
  showLoadBalancing = true,
  autoRotate = true
}: OCPPChargingNetwork3DProps) {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  
  // Network statistics (memoized for performance)
  const networkStats = useMemo(() => {
    const onlineStations = stations.filter(s => s.isOnline);
    const totalConnectors = stations.reduce((sum, s) => sum + s.connectors.length, 0);
    const availableConnectors = stations.reduce((sum, s) => 
      sum + s.connectors.filter(c => c.status === 'available').length, 0);
    const occupiedConnectors = stations.reduce((sum, s) => 
      sum + s.connectors.filter(c => c.status === 'occupied').length, 0);
    const faultedStations = stations.filter(s => s.status === 'faulted' || s.errorCode);
    const maintenanceAlerts = stations.filter(s => s.maintenanceAlert);
    const totalPowerOutput = stations.reduce((sum, s) => 
      sum + s.connectors.reduce((connSum, c) => connSum + (c.currentPowerKw || 0), 0), 0);
    
    return {
      totalStations: stations.length,
      onlineStations: onlineStations.length,
      totalConnectors,
      availableConnectors,
      occupiedConnectors,
      faultedStations: faultedStations.length,
      maintenanceAlerts: maintenanceAlerts.length,
      totalPowerOutput,
      networkEfficiency: onlineStations.length > 0 ? (onlineStations.length / stations.length) * 100 : 0
    };
  }, [stations]);

  const handleStationClick = (station: OCPPChargingStation) => {
    setSelectedStation(station.chargePointId);
    onStationClick?.(station);
  };

  const handleConnectorClick = (station: OCPPChargingStation, connector: OCPPConnector) => {
    onConnectorClick?.(station, connector);
  };

  return (
    <group>
      {/* Environment and Lighting */}
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#0088ff" />

      {/* OCPP Charging Stations */}
      {stations.map((station) => (
        <OCPPStation3D
          key={station.chargePointId}
          station={station}
          isSelected={selectedStation === station.chargePointId}
          onClick={() => handleStationClick(station)}
          onConnectorClick={(connector) => handleConnectorClick(station, connector)}
          showLoadBalancing={showLoadBalancing}
        />
      ))}

      {/* Network Statistics HUD */}
      <Html position={[-8, 6, 0]} center>
        <div className="bg-black/90 text-white p-4 rounded-lg min-w-64">
          <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2">
            OCPP Network Status
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Stations:</span>
              <span className="text-blue-400 font-semibold">{networkStats.totalStations}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Online:</span>
              <span className="text-green-400 font-semibold">{networkStats.onlineStations}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Available Connectors:</span>
              <span className="text-green-400 font-semibold">{networkStats.availableConnectors}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">In Use:</span>
              <span className="text-blue-400 font-semibold">{networkStats.occupiedConnectors}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Total Power:</span>
              <span className="text-yellow-400 font-semibold">{networkStats.totalPowerOutput.toFixed(1)}kW</span>
            </div>
            
            {networkStats.faultedStations > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Faulted:</span>
                <span className="text-red-400 font-semibold">{networkStats.faultedStations}</span>
              </div>
            )}
            
            {networkStats.maintenanceAlerts > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Maintenance Alerts:</span>
                <span className="text-orange-400 font-semibold">{networkStats.maintenanceAlerts}</span>
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-300">Network Efficiency:</span>
                <span className="text-green-400 font-semibold">
                  {networkStats.networkEfficiency.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Html>

      {/* Performance optimized orbit controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={30}
        minDistance={8}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </group>
  );
} 