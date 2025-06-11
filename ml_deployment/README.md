# EV Charging ML Deployment

This directory contains the production-ready deployment of the EV Charging machine learning models.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
cd ml_deployment
docker-compose up -d
```

Access the services:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

### Option 2: Local Python
```bash
cd ml_deployment
pip install -r requirements.txt
python api/model_api_server.py
```

## 📁 Directory Structure

```
ml_deployment/
├── api/                    # API server code
│   ├── model_api_server.py # FastAPI server
│   └── test_api_client.py  # API test client
├── models/                 # ONNX models
│   ├── usage_model.onnx    # Usage prediction model
│   └── price_model.onnx    # Price prediction model
├── tests/                  # Test scripts
│   ├── comprehensive_model_test.py
│   └── test_onnx_models.py
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   └── DEPLOYMENT_GUIDE.md # Deployment instructions
├── config/                 # Configuration files
├── Dockerfile             # Container definition
├── docker-compose.yml     # Multi-container setup
└── requirements.txt       # Python dependencies
```

## 🧪 Testing

Run comprehensive tests:
```bash
python tests/comprehensive_model_test.py
```

Test API endpoints:
```bash
# Start server first
python api/model_api_server.py

# In another terminal
python api/test_api_client.py
```

## 📊 Models

### Usage Prediction Model
- **Input**: 10 numerical features
- **Output**: Usage prediction value
- **Type**: Random Forest (ONNX)
- **Performance**: Mean 1.08, Std 1.61

### Price Prediction Model
- **Input**: 10 numerical features
- **Output**: Price prediction value
- **Type**: Linear Regression (ONNX)
- **Performance**: Mean 25.43, Std 10.28

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/models` | GET | List available models |
| `/models/{name}` | GET | Model information |
| `/predict` | POST | Make prediction |
| `/examples` | GET | Example requests |
| `/docs` | GET | Interactive API docs |

### Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "usage",
    "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
  }'
```

## 🚢 Deployment Options

### 1. Docker
```bash
docker build -t ev-ml-api .
docker run -p 8000:8000 ev-ml-api
```

### 2. Kubernetes
```bash
kubectl apply -f k8s/
```

### 3. Azure Container Instances
```bash
az container create \
  --resource-group ev-charging-rg \
  --name ev-ml-api \
  --image ev-ml-api:latest \
  --ports 8000
```

## 📈 Monitoring

- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Visualization (port 3000)
- **Health endpoint**: `/health`
- **Logs**: `./logs/` directory

## 🔧 Configuration

Environment variables:
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)
- `LOG_LEVEL`: Logging level (default: INFO)

## 🛡️ Security

- Input validation on all endpoints
- Rate limiting available
- JWT authentication ready
- CORS configuration

## 📝 License

This project is part of the EV Charging Infrastructure system. 