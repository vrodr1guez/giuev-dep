import React from 'react';
import ChargingStationDetail from '../../components/charging/ChargingStationDetail';

interface ChargingStationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ChargingStationDetailPage({ params }: ChargingStationDetailPageProps) {
  const stationId = parseInt(params.id, 10);
  
  return (
    <div className="container mx-auto py-6">
      <ChargingStationDetail stationId={stationId} />
    </div>
  );
} 