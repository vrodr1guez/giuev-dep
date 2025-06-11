#!/bin/bash

# Azure ML Deployment Script
# This script deploys the EV Charging ML models to Azure Container Instances

# Configuration
RESOURCE_GROUP="ev-charging-ml-rg"
LOCATION="eastus"
ACR_NAME="evchargingmlacr"
IMAGE_NAME="ev-ml-api"
IMAGE_TAG="v1.0"
CONTAINER_NAME="ev-ml-api-container"
DNS_NAME_LABEL="ev-charging-ml-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}EV Charging ML - Azure Deployment${NC}"
echo "=================================="

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed${NC}"
    echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure (if not already logged in)
echo -e "${YELLOW}Step 1: Checking Azure login...${NC}"
if ! az account show &> /dev/null; then
    echo "Please login to Azure:"
    az login
fi

# Display current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "Current subscription: ${GREEN}$SUBSCRIPTION${NC}"
read -p "Continue with this subscription? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Create resource group
echo -e "\n${YELLOW}Step 2: Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION
echo -e "${GREEN}✓ Resource group created${NC}"

# Create Azure Container Registry
echo -e "\n${YELLOW}Step 3: Creating Azure Container Registry...${NC}"
az acr create --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true
echo -e "${GREEN}✓ Container registry created${NC}"

# Get ACR credentials
echo -e "\n${YELLOW}Step 4: Getting ACR credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
echo -e "${GREEN}✓ ACR credentials retrieved${NC}"

# Build and push Docker image
echo -e "\n${YELLOW}Step 5: Building and pushing Docker image...${NC}"
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

echo "Tagging image for ACR..."
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo "Logging in to ACR..."
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

echo "Pushing image to ACR..."
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
echo -e "${GREEN}✓ Docker image pushed to ACR${NC}"

# Create Azure Container Instance
echo -e "\n${YELLOW}Step 6: Creating Azure Container Instance...${NC}"
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG \
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

echo -e "${GREEN}✓ Container instance created${NC}"

# Get container details
echo -e "\n${YELLOW}Step 7: Getting deployment details...${NC}"
FQDN=$(az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --query ipAddress.fqdn -o tsv)
STATE=$(az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --query instanceView.state -o tsv)

echo -e "\n${GREEN}Deployment Complete!${NC}"
echo "==================="
echo -e "API URL: ${GREEN}http://$FQDN:8000${NC}"
echo -e "API Docs: ${GREEN}http://$FQDN:8000/docs${NC}"
echo -e "Container State: ${GREEN}$STATE${NC}"

# Test the deployment
echo -e "\n${YELLOW}Testing deployment...${NC}"
sleep 10  # Wait for container to fully start
curl -s http://$FQDN:8000/health | jq .

echo -e "\n${GREEN}Deployment successful!${NC}"
echo "To view logs: az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME"
echo "To delete: az group delete --name $RESOURCE_GROUP --yes" 