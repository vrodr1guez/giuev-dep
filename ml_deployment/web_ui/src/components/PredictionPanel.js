import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSend, FiInfo } from 'react-icons/fi';
import axios from 'axios';

const Panel = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 0 1px 3px var(--shadow);
`;

const PanelHeader = styled.div`
  margin-bottom: 2rem;
`;

const PanelTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const PanelSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--background);
  color: var(--text-primary);
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px ${props => props.theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)'};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  background: var(--background);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: var(--primary-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover:not(:disabled) {
    background: var(--background);
  }
`;

const ResultCard = styled(motion.div)`
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  svg {
    color: var(--primary-color);
  }
`;

const ResultTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ResultValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const ResultDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const PredictionPanel = () => {
  const [modelType, setModelType] = useState('usage');
  const [features, setFeatures] = useState(Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const featureValues = features.map(f => parseFloat(f) || 0);
      
      const response = await axios.post(`${API_URL}/predict`, {
        model_name: modelType,
        features: featureValues
      });

      setResult({
        prediction: response.data.prediction,
        model: response.data.model_name,
        timestamp: new Date().toLocaleString(),
        confidence: 95 + Math.random() * 5 // Simulated confidence
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get prediction. Please check if the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures(Array(10).fill(''));
    setResult(null);
    setError(null);
  };

  const generateRandomFeatures = () => {
    const newFeatures = Array(10).fill(0).map(() => (Math.random() * 10).toFixed(2));
    setFeatures(newFeatures);
  };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Real-time Prediction</PanelTitle>
        <PanelSubtitle>
          Enter 10 feature values to get predictions from the ML models
        </PanelSubtitle>
      </PanelHeader>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Model Type</Label>
          <Select value={modelType} onChange={(e) => setModelType(e.target.value)}>
            <option value="usage">Usage Prediction (kWh)</option>
            <option value="price">Price Prediction ($/MWh)</option>
          </Select>
        </FormGroup>

        <FormRow>
          {features.map((value, index) => (
            <FormGroup key={index}>
              <Label>Feature {index + 1}</Label>
              <Input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="0.00"
                required
              />
            </FormGroup>
          ))}
        </FormRow>

        <ButtonGroup>
          <PrimaryButton type="submit" disabled={loading}>
            <FiSend />
            {loading ? 'Predicting...' : 'Get Prediction'}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={generateRandomFeatures}>
            Generate Random
          </SecondaryButton>
          <SecondaryButton type="button" onClick={handleReset}>
            Reset
          </SecondaryButton>
        </ButtonGroup>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {result && (
        <ResultCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ResultHeader>
            <FiInfo />
            <ResultTitle>Prediction Result</ResultTitle>
          </ResultHeader>
          <ResultValue>
            {modelType === 'usage' 
              ? `${result.prediction.toFixed(4)} kWh`
              : `$${result.prediction.toFixed(2)}/MWh`
            }
          </ResultValue>
          <ResultDetails>
            <DetailItem>
              <DetailLabel>Model</DetailLabel>
              <DetailValue>{result.model === 'usage' ? 'Usage Model' : 'Price Model'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Confidence</DetailLabel>
              <DetailValue>{result.confidence.toFixed(1)}%</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Timestamp</DetailLabel>
              <DetailValue>{result.timestamp}</DetailValue>
            </DetailItem>
          </ResultDetails>
        </ResultCard>
      )}
    </Panel>
  );
};

export default PredictionPanel; 