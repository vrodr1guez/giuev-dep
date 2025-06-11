/// <reference path="../../../app/types/react.d.ts" />
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RefreshCw, Check, AlertCircle, LineChart, Cpu } from 'lucide-react';
import { Progress } from '../ui/progress';

interface ModelTrainingPanelProps {
  onTrainingComplete?: (results: any) => void;
}

interface Chemistry {
  id: string;
  label: string;
  selected: boolean;
}

interface FeatureImportance {
  [feature: string]: number;
}

interface ModelDetails {
  message: string;
  feature_importance?: FeatureImportance;
}

interface TrainingResult {
  status: string;
  details: Record<string, ModelDetails>;
}

const ModelTrainingPanel = ({ onTrainingComplete }: ModelTrainingPanelProps) => {
  // Initialize state without generic type parameters
  const [chemistries, setChemistries] = useState([
    { id: 'NMC', label: 'NMC (Lithium Nickel Manganese Cobalt Oxide)', selected: true },
    { id: 'LFP', label: 'LFP (Lithium Iron Phosphate)', selected: true },
    { id: 'NCA', label: 'NCA (Lithium Nickel Cobalt Aluminum Oxide)', selected: true }
  ]);
  
  const [trainingDays, setTrainingDays] = useState(365);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null as TrainingResult | null);
  const [error, setError] = useState(null as string | null);
  
  // Function to train models
  const trainModels = async () => {
    const selectedChemistries = chemistries.filter(c => c.selected).map(c => c.id);
    
    if (selectedChemistries.length === 0) {
      setError('Please select at least one battery chemistry');
      return;
    }
    
    setIsTraining(true);
    setError(null);
    setResult(null);
    setProgress(0);
    
    // Simulate progress (in a real application, this would be updated via WebSocket or polling)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 500);
    
    try {
      const response = await fetch('/api/v1/battery-health/train-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chemistries: selectedChemistries,
          days: trainingDays
        }),
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (data.status === 'success') {
        setResult(data as TrainingResult);
        if (onTrainingComplete) {
          onTrainingComplete(data);
        }
      } else {
        setError(data.message || 'Failed to train models');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('An error occurred while training models');
      console.error('Error training models:', err);
    } finally {
      setIsTraining(false);
    }
  };
  
  // Toggle chemistry selection
  const toggleChemistry = (id: string) => {
    setChemistries(chemistries.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Train Prediction Models
        </CardTitle>
        <CardDescription>
          Train machine learning models for battery health prediction using historical data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Battery Chemistries</h3>
            <div className="space-y-2">
              {chemistries.map(chemistry => (
                <div key={chemistry.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`chemistry-${chemistry.id}`}
                    checked={chemistry.selected}
                    onCheckedChange={() => toggleChemistry(chemistry.id)}
                    disabled={isTraining}
                  />
                  <label 
                    htmlFor={`chemistry-${chemistry.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {chemistry.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">
              Training Data: {trainingDays} days
            </h3>
            <Slider 
              min={30}
              max={730}
              step={30}
              value={[trainingDays]}
              onValueChange={(value) => setTrainingDays(value[0])}
              disabled={isTraining}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 month</span>
              <span>6 months</span>
              <span>1 year</span>
              <span>2 years</span>
            </div>
          </div>
          
          {isTraining && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Training Progress</p>
                <p className="text-sm">{Math.round(progress)}%</p>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Models trained successfully
                <div className="mt-2 space-y-2">
                  {Object.entries(result.details).map(([chemistry, modelDetails]) => {
                    // Type assertion for modelDetails
                    const typedDetails = modelDetails as ModelDetails;
                    return (
                      <div key={chemistry} className="text-sm">
                        <p className="font-medium">{chemistry}:</p>
                        <p>{typedDetails.message}</p>
                        {typedDetails.feature_importance && (
                          <div className="mt-1 pl-2 border-l-2 border-slate-200">
                            <p className="text-xs text-slate-500">Feature Importance:</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                              {Object.entries(typedDetails.feature_importance).map(([feature, importanceValue]) => (
                                <div key={feature} className="flex justify-between">
                                  <span className="text-xs">{feature}:</span>
                                  <span className="text-xs font-medium">{(importanceValue * 100).toFixed(1)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            setResult(null);
            setError(null);
          }}
          disabled={isTraining || (!result && !error)}
        >
          Clear
        </Button>
        <Button 
          onClick={trainModels}
          disabled={isTraining || chemistries.filter(c => c.selected).length === 0}
        >
          {isTraining ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Training...
            </>
          ) : (
            <>
              <LineChart className="mr-2 h-4 w-4" />
              Train Models
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelTrainingPanel; 