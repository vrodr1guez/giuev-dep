import React from 'react';
import VehicleDetail from '../../components/vehicles/VehicleDetail';

interface VehicleDetailPageProps {
  params: {
    id: string;
  };
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const vehicleId = parseInt(params.id, 10);
  
  return (
    <div className="container mx-auto py-6">
      <VehicleDetail vehicleId={vehicleId} />
    </div>
  );
} 