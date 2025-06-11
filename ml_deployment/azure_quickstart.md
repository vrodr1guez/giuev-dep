# Azure Container Instances - Quick Deployment

## 🚀 5-Minute Deployment

### Prerequisites Check
```bash
# Check if Azure CLI is installed
az --version

# Check if Docker is installed
docker --version

# Login to Azure
az login
```

### Quick Deploy Commands

Just run these commands in order:

```bash
# 1. Set variables (customize these)
export RESOURCE_GROUP="ev-ml-demo"
export LOCATION="eastus"
export ACR_NAME="evmldemo$(date +%s)"  # Unique name
export IMAGE_NAME="ev-ml-api"

# 2. Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 3. Create container registry
az acr create --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME --sku Basic --admin-enabled true

# 4. Build using ACR (no local Docker needed!)
cd ml_deployment
az acr build --registry $ACR_NAME --image $IMAGE_NAME:v1 .

# 5. Deploy to container instance
az container create \
  --resource-group $RESOURCE_GROUP \
  --name ev-ml-api \
  --image $ACR_NAME.azurecr.io/$IMAGE_NAME:v1 \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $(az acr credential show --name $ACR_NAME --query username -o tsv) \
  --registry-password $(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv) \
  --dns-name-label ev-ml-api-$(date +%s) \
  --ports 8000 \
  --cpu 1 \
  --memory 1.5

# 6. Get the URL
echo "Your API URL:"
az container show --resource-group $RESOURCE_GROUP \
  --name ev-ml-api --query ipAddress.fqdn -o tsv
```

### Test Your Deployment

```bash
# Get your API URL
API_URL="http://$(az container show --resource-group $RESOURCE_GROUP --name ev-ml-api --query ipAddress.fqdn -o tsv):8000"

# Test health endpoint
curl $API_URL/health

# Test prediction
curl -X POST $API_URL/predict \
  -H "Content-Type: application/json" \
  -d '{"model_name": "usage", "features": [1,2,3,4,5,6,7,8,9,10]}'
```

### View Logs
```bash
az container logs --resource-group $RESOURCE_GROUP --name ev-ml-api
```

### Clean Up (Important!)
```bash
# Delete everything to avoid charges
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## 💰 Cost: ~$1.50/day

## 🔧 Troubleshooting

If deployment fails:
1. Check logs: `az container logs -g $RESOURCE_GROUP -n ev-ml-api`
2. Check state: `az container show -g $RESOURCE_GROUP -n ev-ml-api --query instanceView.state`
3. Ensure ACR name is unique (add random numbers)

## 📊 What You Get

- ✅ Publicly accessible ML API
- ✅ Auto-scaling ready
- ✅ Monitoring enabled
- ✅ Secure container registry
- ✅ Production-grade deployment 