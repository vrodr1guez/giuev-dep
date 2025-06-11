/// <reference path="../../types/react.d.ts" />
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RefreshCw, Check, AlertCircle, Database, Activity } from 'lucide-react';

interface TelemetryDataCollectionProps {
  vehicleId: string;
  onDataCollected?: (data: any) => void;
}

const TelemetryDataCollection: React.FC<TelemetryDataCollectionProps> = ({
  vehicleId,
  onDataCollected
}) => {
  const [provider, setProvider] = useState('' as string);
  const [isLoading, setIsLoading] = useState(false as boolean);
  const [result, setResult] = useState(null as any);
  const [error, setError] = useState(null as string | null);
  
  // Available providers
  const providers = [
    { id: 'tesla', name: 'Tesla API' },
    { id: 'ford', name: 'Ford API' },
    { id: 'generic_oem', name: 'Generic OEM' }
  ];
  
  // Function to collect telemetry data
  const collectTelemetryData = async () => {
    if (!provider) {
      setError('Please select a provider');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/v1/battery-health/telemetry/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          provider
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setResult(data);
        if (onDataCollected) {
          onDataCollected(data);
        }
      } else {
        setError(data.message || 'Failed to collect telemetry data');
      }
    } catch (err) {
      setError('An error occurred while collecting telemetry data');
      console.error('Error collecting telemetry data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Telemetry Data Collection
        </CardTitle>
        <CardDescription>
          Collect real-time battery telemetry data from the vehicle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Provider</label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select API provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle ID</label>
            <Input value={vehicleId} disabled />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Alert className="mt-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Telemetry data collected successfully
              {result.validation_messages && result.validation_messages.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Validation Messages:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.validation_messages.map((msg: string, index: number) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            setResult(null);
            setError(null);
          }}
          disabled={isLoading || (!result && !error)}
        >
          Clear
        </Button>
        <Button 
          onClick={collectTelemetryData}
          disabled={isLoading || !provider}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Collecting...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Collect Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TelemetryDataCollection; 