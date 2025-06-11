# EV Charging ML System Architecture

## Overview

The EV Charging ML System provides machine learning capabilities for predicting energy usage and pricing in EV charging infrastructure. The system uses ONNX models for cross-platform compatibility and provides both API and direct integration options.

## System Components

### 1. Machine Learning Models

#### 1.1 Usage Prediction Model
- **Purpose**: Predicts EV charging usage patterns
- **Input**: 10 numerical features representing various usage indicators
- **Output**: Single prediction value for usage
- **Model Type**: Random Forest Regressor (converted to ONNX)
- **Performance Metrics**:
  - Mean prediction: 1.0768
  - Std deviation: 1.6072
  - Range: 0.0920 - 4.5766

#### 1.2 Energy Price Prediction Model
- **Purpose**: Predicts energy pricing based on various factors
- **Input**: 10 numerical features representing pricing factors
- **Output**: Single prediction value for price
- **Model Type**: Linear Regression (converted to ONNX)
- **Performance Metrics**:
  - Mean prediction: 25.4284
  - Std deviation: 10.2835
  - Range: 12.0048 - 44.9475

### 2. API Server

The FastAPI-based server provides RESTful endpoints for model inference:

```
Base URL: http://localhost:8000

Endpoints:
- GET  /              - API information
- GET  /health        - Health check
- GET  /models        - List available models
- GET  /models/{name} - Get model information
- POST /predict       - Make predictions
- GET  /examples      - Get example requests
- GET  /docs          - Interactive API documentation
```

### 3. Integration Options

#### 3.1 REST API Integration
```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={
        "model_name": "usage",
        "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
    }
)
prediction = response.json()["prediction"]
```

#### 3.2 Direct ONNX Integration
```python
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("models/usage_model.onnx")
input_data = np.array([[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]], dtype=np.float32)
result = session.run(None, {"float_input": input_data})
prediction = result[0][0][0]
```

#### 3.3 ML.NET Integration (Windows/Linux)
```csharp
var mlContext = new MLContext();
var pipeline = mlContext.Transforms.ApplyOnnxModel(
    outputColumnName: "variable",
    inputColumnName: "float_input",
    modelFile: "models/usage_model.onnx");
```

## Data Flow

```
Input Features (10 values)
    ↓
Preprocessing (StandardScaler)
    ↓
Model Inference (ONNX Runtime)
    ↓
Prediction Output (single value)
```

## Deployment Architecture

### Local Deployment
```
┌─────────────────┐     ┌─────────────────┐
│   Client App    │────▶│   API Server    │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  ONNX Runtime   │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  ONNX Models    │
                        └─────────────────┘
```

### Cloud Deployment (Azure)
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client App    │────▶│  Azure API GW    │────▶│ Container App   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  Azure ML       │
                                                  └─────────────────┘
```

## Security Considerations

1. **API Authentication**: Implement JWT tokens for API access
2. **Input Validation**: Validate all inputs before model inference
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **HTTPS**: Use HTTPS in production environments
5. **Model Protection**: Store models securely and implement access controls

## Performance Optimization

1. **Model Caching**: ONNX sessions are cached on server startup
2. **Batch Predictions**: Support batch inference for multiple predictions
3. **Async Processing**: Use FastAPI's async capabilities
4. **Hardware Acceleration**: ONNX Runtime supports GPU acceleration

## Monitoring and Logging

1. **Metrics to Track**:
   - Prediction latency
   - Request volume
   - Error rates
   - Model accuracy over time

2. **Logging**:
   - All predictions logged with timestamps
   - Error tracking for failed predictions
   - Performance metrics logged

## Scalability

1. **Horizontal Scaling**: Deploy multiple API server instances
2. **Load Balancing**: Use a load balancer for distributing requests
3. **Caching**: Implement Redis for caching frequent predictions
4. **Queue System**: Use message queues for async processing

## Testing Strategy

1. **Unit Tests**: Test individual model predictions
2. **Integration Tests**: Test API endpoints
3. **Load Tests**: Test system under high load
4. **Validation Tests**: Continuous model validation

## Future Enhancements

1. **Model Versioning**: Implement model version management
2. **A/B Testing**: Support multiple model versions simultaneously
3. **AutoML Integration**: Automated model retraining
4. **Real-time Updates**: Support for online learning
5. **Explainability**: Add SHAP/LIME for prediction explanations 