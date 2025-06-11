# Azure Container Instances Deployment Guide

This guide will walk you through deploying the EV Charging ML models to Azure Container Instances.

## Prerequisites

1. **Azure Account**: Sign up at [azure.com](https://azure.com) if you don't have one
2. **Azure CLI**: Install from [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Docker**: Install from [docker.com](https://docker.com)
4. **Models Ready**: Ensure you're in the `ml_deployment` directory

## Step-by-Step Deployment

### 1. Prepare Your Environment

```bash
# Navigate to the ml_deployment directory
cd ml_deployment

# Make the deployment script executable
chmod +x deploy_to_azure.sh
```

### 2. Login to Azure

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your-Subscription-Name"
```

### 3. Automated Deployment (Recommended)

Run the automated deployment script:

```bash
./deploy_to_azure.sh
```

This script will:
- Create a resource group
- Create an Azure Container Registry
- Build and push your Docker image
- Deploy to Azure Container Instances
- Test the deployment

### 4. Manual Deployment (Alternative)

If you prefer to deploy manually or the script fails, follow these steps:

#### 4.1 Create Resource Group

```bash
RESOURCE_GROUP="ev-charging-ml-rg"
LOCATION="eastus"

az group create --name $RESOURCE_GROUP --location $LOCATION
```

#### 4.2 Create Azure Container Registry

```bash
ACR_NAME="evchargingmlacr"  # Must be globally unique

az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true
```

#### 4.3 Get ACR Credentials

```bash
# Get login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

# Get credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

echo "ACR Server: $ACR_LOGIN_SERVER"
echo "Username: $ACR_USERNAME"
```

#### 4.4 Build and Push Docker Image

```bash
# Build the image
docker build -t ev-ml-api:v1.0 .

# Tag for ACR
docker tag ev-ml-api:v1.0 $ACR_LOGIN_SERVER/ev-ml-api:v1.0

# Login to ACR
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

# Push to ACR
docker push $ACR_LOGIN_SERVER/ev-ml-api:v1.0
```

#### 4.5 Deploy to Azure Container Instances

```bash
CONTAINER_NAME="ev-ml-api-container"
DNS_NAME_LABEL="ev-charging-ml-api"  # Must be unique in the region

az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_LOGIN_SERVER/ev-ml-api:v1.0 \
  --cpu 1 \
  --memory 1.5 \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label $DNS_NAME_LABEL \
  --ports 8000 \
  --environment-variables \
    API_HOST=0.0.0.0 \
    API_PORT=8000 \
    LOG_LEVEL=INFO
```

#### 4.6 Get Deployment URL

```bash
# Get the FQDN
FQDN=$(az container show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --query ipAddress.fqdn -o tsv)

echo "API URL: http://$FQDN:8000"
echo "API Docs: http://$FQDN:8000/docs"
```

### 5. Test the Deployment

```bash
# Check health endpoint
curl http://$FQDN:8000/health

# Test a prediction
curl -X POST http://$FQDN:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "usage",
    "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
  }'
```

### 6. Monitor the Deployment

```bash
# View container logs
az container logs \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME

# View container status
az container show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --query instanceView.state

# Stream logs (follow mode)
az container attach \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME
```

## Advanced Configuration

### Enable HTTPS with Application Gateway

```bash
# Create Application Gateway for HTTPS
az network application-gateway create \
  --name ev-ml-app-gateway \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --sku Standard_v2 \
  --capacity 1 \
  --http-settings-port 8000 \
  --frontend-port 443 \
  --routing-rule-type Basic
```

### Scale the Container

```bash
# Update container with more resources
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_LOGIN_SERVER/ev-ml-api:v1.0 \
  --cpu 2 \
  --memory 4 \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label $DNS_NAME_LABEL \
  --ports 8000
```

### Add Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app ev-ml-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app ev-ml-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Update container with Application Insights
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_LOGIN_SERVER/ev-ml-api:v1.0 \
  --environment-variables \
    APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

## Cost Optimization

### Estimated Monthly Costs
- Container Instance (1 vCPU, 1.5GB): ~$40/month
- Container Registry (Basic): ~$5/month
- Storage: ~$1/month
- **Total**: ~$46/month

### Cost-Saving Tips
1. Use spot instances for dev/test
2. Stop containers when not in use
3. Use consumption-based pricing for low traffic

## Troubleshooting

### Common Issues

1. **Container fails to start**
   ```bash
   # Check logs
   az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME
   ```

2. **Cannot access API**
   ```bash
   # Check container state
   az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --query instanceView.state
   ```

3. **ACR push fails**
   ```bash
   # Re-authenticate
   az acr login --name $ACR_NAME
   ```

## Cleanup

To remove all resources and avoid charges:

```bash
# Delete the entire resource group
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## Next Steps

1. **Add Custom Domain**: Configure a custom domain name
2. **Enable SSL**: Add HTTPS support with Let's Encrypt
3. **Setup CI/CD**: Configure GitHub Actions for automatic deployments
4. **Add Monitoring**: Setup Azure Monitor dashboards
5. **Implement Auto-scaling**: Configure auto-scaling rules

## Support

- Azure Documentation: https://docs.microsoft.com/azure/container-instances/
- Azure Support: https://azure.microsoft.com/support/
- Community Forum: https://docs.microsoft.com/answers/ 