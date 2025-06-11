# ML Deployment Guide

## Quick Start

### 1. Local Development

```bash
# Navigate to deployment directory
cd ml_deployment

# Install dependencies
pip install fastapi uvicorn onnxruntime numpy pydantic

# Start the API server
python api/model_api_server.py

# In another terminal, test the API
python api/test_api_client.py
```

### 2. Test the Models

```bash
# Run comprehensive tests
python tests/comprehensive_model_test.py

# Run ONNX validation tests
python tests/test_onnx_models.py
```

## Production Deployment

### Option 1: Docker Deployment

1. Build the Docker image:
```bash
docker build -t ev-charging-ml:latest .
```

2. Run the container:
```bash
docker run -d -p 8000:8000 --name ev-ml-api ev-charging-ml:latest
```

3. Test the deployment:
```bash
curl http://localhost:8000/health
```

### Option 2: Kubernetes Deployment

1. Apply the Kubernetes manifests:
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

2. Check deployment status:
```bash
kubectl get pods -l app=ev-ml-api
kubectl get svc ev-ml-api-service
```

### Option 3: Azure Container Instances

1. Create a resource group:
```bash
az group create --name ev-charging-rg --location eastus
```

2. Create container registry:
```bash
az acr create --resource-group ev-charging-rg \
  --name evchargingacr --sku Basic
```

3. Build and push image:
```bash
az acr build --registry evchargingacr \
  --image ev-charging-ml:v1 .
```

4. Deploy to ACI:
```bash
az container create \
  --resource-group ev-charging-rg \
  --name ev-ml-api \
  --image evchargingacr.azurecr.io/ev-charging-ml:v1 \
  --dns-name-label ev-ml-api \
  --ports 8000
```

## Configuration

### Environment Variables

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Model Configuration
MODEL_PATH=/app/models
MODEL_CACHE_SIZE=100

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/api.log

# Security
API_KEY=your-secret-api-key
ENABLE_CORS=true
ALLOWED_ORIGINS=*
```

### Model Updates

1. **Update models without downtime:**
```bash
# Copy new models to staging
cp new_models/*.onnx ml_deployment/models/staging/

# Validate new models
python tests/validate_models.py --path ml_deployment/models/staging/

# If validation passes, update production
mv ml_deployment/models/staging/*.onnx ml_deployment/models/

# Reload API server
kill -HUP $(pgrep -f model_api_server)
```

2. **Version management:**
```bash
# Tag models with version
cp usage_model.onnx models/usage_model_v2.onnx

# Update API to use specific version
MODEL_VERSION=v2 python api/model_api_server.py
```

## Monitoring

### 1. Health Checks

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed health check with model status
curl http://localhost:8000/health?detailed=true
```

### 2. Metrics Collection

```python
# Add to your monitoring system
metrics = {
    "prediction_count": prometheus_client.Counter('ml_predictions_total'),
    "prediction_latency": prometheus_client.Histogram('ml_prediction_duration_seconds'),
    "model_errors": prometheus_client.Counter('ml_model_errors_total')
}
```

### 3. Log Analysis

```bash
# View recent predictions
tail -f logs/predictions.log | jq .

# Count predictions by model
grep "model_name" logs/predictions.log | sort | uniq -c

# Find slow predictions
awk '$6 > 1000' logs/predictions.log  # latency > 1s
```

## Performance Tuning

### 1. API Server Optimization

```python
# config/gunicorn.conf.py
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
keepalive = 5
```

### 2. Model Optimization

```bash
# Optimize ONNX models
python -m onnxruntime.tools.optimizer \
  --input models/usage_model.onnx \
  --output models/usage_model_opt.onnx
```

### 3. Caching Strategy

```python
# Add Redis caching
import redis
cache = redis.Redis(host='localhost', port=6379)

def get_prediction(features, model_name):
    cache_key = f"{model_name}:{hash(str(features))}"
    cached = cache.get(cache_key)
    if cached:
        return float(cached)
    
    prediction = model.predict(features)
    cache.setex(cache_key, 3600, str(prediction))
    return prediction
```

## Troubleshooting

### Common Issues

1. **Model loading fails:**
```bash
# Check model file permissions
ls -la models/

# Validate ONNX model
python -c "import onnx; onnx.checker.check_model('models/usage_model.onnx')"
```

2. **High latency:**
```bash
# Profile the API
python -m cProfile api/model_api_server.py

# Check ONNX Runtime version
python -c "import onnxruntime; print(onnxruntime.__version__)"
```

3. **Memory issues:**
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep model_api_server'

# Limit memory usage
docker run -m 512m ev-charging-ml:latest
```

## Security Hardening

### 1. API Authentication

```python
# Add to API server
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.post("/predict")
async def predict(
    request: PredictionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not verify_token(credentials.credentials):
        raise HTTPException(status_code=401)
    # ... rest of prediction logic
```

### 2. Input Validation

```python
class PredictionRequest(BaseModel):
    features: List[float] = Field(..., min_items=10, max_items=10)
    model_name: str = Field(..., regex="^(usage|price)$")
    
    @validator('features')
    def validate_features(cls, v):
        for feature in v:
            if not -100 <= feature <= 100:
                raise ValueError('Feature values must be between -100 and 100')
        return v
```

### 3. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/predict")
@limiter.limit("100/minute")
async def predict(request: Request, prediction_request: PredictionRequest):
    # ... prediction logic
```

## Backup and Recovery

### 1. Model Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/models/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
cp models/*.onnx $BACKUP_DIR/
echo "Models backed up to $BACKUP_DIR"
```

### 2. Configuration Backup

```bash
# Backup all configurations
tar -czf ml_deployment_backup_$(date +%Y%m%d).tar.gz \
  config/ \
  models/ \
  api/model_api_server.py
```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Review error logs
   - Check model performance metrics
   - Update dependencies

2. **Monthly:**
   - Validate model accuracy
   - Performance benchmarking
   - Security updates

3. **Quarterly:**
   - Model retraining evaluation
   - Architecture review
   - Disaster recovery testing 