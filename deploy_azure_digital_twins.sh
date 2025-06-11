#!/bin/bash

# Azure Digital Twins Deployment Script for EV Charging Infrastructure
# This script sets up Azure Digital Twins integration with the existing system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚗⚡ EV Charging Infrastructure - Azure Digital Twins Setup${NC}"
echo "================================================================"

# Configuration
RESOURCE_GROUP="ev-digital-twins-rg"
LOCATION="eastus"
DT_INSTANCE_NAME="ev-charging-twins"
IOT_HUB_NAME="ev-charging-hub"
STORAGE_ACCOUNT="evchargingstorage$(date +%s)"
MODELS_DIR="azure_digital_twins_models"

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed${NC}"
    echo "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}Please login to Azure:${NC}"
    az login
fi

# Check if Digital Twins CLI extension is installed
if ! az extension list --query "[?name=='azure-iot']" -o tsv | grep -q azure-iot; then
    echo -e "${YELLOW}Installing Azure IoT CLI extension...${NC}"
    az extension add --name azure-iot
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# Step 2: Create Resource Group
echo -e "\n${YELLOW}Step 2: Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION
echo -e "${GREEN}✅ Resource group '$RESOURCE_GROUP' created${NC}"

# Step 3: Create Azure Digital Twins instance
echo -e "\n${YELLOW}Step 3: Creating Azure Digital Twins instance...${NC}"
az dt create --name $DT_INSTANCE_NAME --resource-group $RESOURCE_GROUP --location $LOCATION
echo -e "${GREEN}✅ Azure Digital Twins instance '$DT_INSTANCE_NAME' created${NC}"

# Step 4: Assign role to current user
echo -e "\n${YELLOW}Step 4: Assigning Digital Twins Data Owner role...${NC}"
USER_OBJECT_ID=$(az ad signed-in-user show --query objectId -o tsv)
az dt role-assignment create --dt-name $DT_INSTANCE_NAME --assignee $USER_OBJECT_ID --role "Azure Digital Twins Data Owner"
echo -e "${GREEN}✅ Role assigned to current user${NC}"

# Step 5: Upload Digital Twin models
echo -e "\n${YELLOW}Step 5: Uploading Digital Twin models...${NC}"

if [ -d "$MODELS_DIR" ]; then
    echo "Uploading models from $MODELS_DIR..."
    
    # Upload Battery model
    if [ -f "$MODELS_DIR/Battery.json" ]; then
        az dt model create --dt-name $DT_INSTANCE_NAME --models "$MODELS_DIR/Battery.json"
        echo -e "${GREEN}✅ Battery model uploaded${NC}"
    fi
    
    # Upload Vehicle model
    if [ -f "$MODELS_DIR/Vehicle.json" ]; then
        az dt model create --dt-name $DT_INSTANCE_NAME --models "$MODELS_DIR/Vehicle.json"
        echo -e "${GREEN}✅ Vehicle model uploaded${NC}"
    fi
    
    # Upload ChargingStation model
    if [ -f "$MODELS_DIR/ChargingStation.json" ]; then
        az dt model create --dt-name $DT_INSTANCE_NAME --models "$MODELS_DIR/ChargingStation.json"
        echo -e "${GREEN}✅ ChargingStation model uploaded${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Models directory not found. Please create models manually.${NC}"
fi

# Step 6: Create IoT Hub for device connectivity
echo -e "\n${YELLOW}Step 6: Creating IoT Hub...${NC}"
az iot hub create --name $IOT_HUB_NAME --resource-group $RESOURCE_GROUP --sku S1 --location $LOCATION
echo -e "${GREEN}✅ IoT Hub '$IOT_HUB_NAME' created${NC}"

# Step 7: Create sample digital twins
echo -e "\n${YELLOW}Step 7: Creating sample digital twins...${NC}"

# Create sample vehicle twin
az dt twin create --dt-name $DT_INSTANCE_NAME \
    --dtmi "dtmi:evcharging:Vehicle;1" \
    --twin-id "EV-001" \
    --properties '{
        "vehicleId": "EV-001",
        "make": "Tesla",
        "model": "Model 3",
        "year": 2024,
        "batteryCapacity": 75.0,
        "v2gCapable": true,
        "v2gEnabled": false,
        "maxDischargeRateKW": 50.0,
        "minSOCLimit": 20,
        "smartChargingEnabled": true,
        "isActive": true
    }'

# Create sample battery twin
az dt twin create --dt-name $DT_INSTANCE_NAME \
    --dtmi "dtmi:evcharging:Battery;1" \
    --twin-id "EV-001-Battery" \
    --properties '{
        "vehicleId": "EV-001",
        "batteryType": "Li-ion",
        "chemistry": "NMC",
        "nominalCapacity": 75.0,
        "voltage": 400.0,
        "current": 0.0,
        "temperature": 25.0,
        "soc": 80.0,
        "soh": 95.0,
        "thermalManagement": "Liquid"
    }'

# Create sample charging station twin
az dt twin create --dt-name $DT_INSTANCE_NAME \
    --dtmi "dtmi:evcharging:ChargingStation;1" \
    --twin-id "CP001" \
    --properties '{
        "chargePointId": "CP001",
        "vendor": "ABB",
        "model": "Terra 184",
        "serialNumber": "ABB001",
        "firmwareVersion": "1.2.3",
        "ocppVersion": "1.6",
        "maxPowerKW": 50.0,
        "numberOfConnectors": 2,
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "123 Main St, San Francisco, CA 94102",
        "status": "Available",
        "isOnline": false,
        "connectedVehicles": 0,
        "totalEnergyDelivered": 0.0
    }'

# Create relationships
az dt twin relationship create --dt-name $DT_INSTANCE_NAME \
    --source "EV-001" \
    --target "EV-001-Battery" \
    --relationship-id "EV-001-hasBattery-EV-001-Battery" \
    --relationship "hasBattery"

echo -e "${GREEN}✅ Sample digital twins created${NC}"

# Step 8: Set up Event Grid for real-time updates
echo -e "\n${YELLOW}Step 8: Setting up Event Grid...${NC}"
EVENT_GRID_TOPIC="ev-twins-events"

# Create Event Grid custom topic
az eventgrid topic create --name $EVENT_GRID_TOPIC --resource-group $RESOURCE_GROUP --location $LOCATION

# Create endpoint for Digital Twins events
DT_ENDPOINT="dt-eventgrid-endpoint"
az dt endpoint create eventgrid --dt-name $DT_INSTANCE_NAME --endpoint-name $DT_ENDPOINT --eventgrid-resource-group $RESOURCE_GROUP --eventgrid-topic $EVENT_GRID_TOPIC

echo -e "${GREEN}✅ Event Grid configured${NC}"

# Step 9: Create Azure Function for data processing (optional)
echo -e "\n${YELLOW}Step 9: Creating storage account for Azure Functions...${NC}"
az storage account create --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS
echo -e "${GREEN}✅ Storage account created${NC}"

# Step 10: Output connection information
echo -e "\n${BLUE}📋 Azure Digital Twins Setup Complete!${NC}"
echo "================================================================"

# Get Digital Twins URL
DT_HOST_NAME=$(az dt show --dt-name $DT_INSTANCE_NAME --query hostName -o tsv)
echo -e "${GREEN}Digital Twins URL:${NC} https://$DT_HOST_NAME"

# Get IoT Hub connection string
IOT_CONNECTION_STRING=$(az iot hub connection-string show --hub-name $IOT_HUB_NAME --policy-name iothubowner --query connectionString -o tsv)
echo -e "${GREEN}IoT Hub Connection String:${NC} $IOT_CONNECTION_STRING"

# Get Event Grid endpoint
EVENT_GRID_ENDPOINT=$(az eventgrid topic show --name $EVENT_GRID_TOPIC --resource-group $RESOURCE_GROUP --query endpoint -o tsv)
echo -e "${GREEN}Event Grid Endpoint:${NC} $EVENT_GRID_ENDPOINT"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Update your .env file with the following variables:"
echo "   AZURE_DIGITAL_TWINS_URL=https://$DT_HOST_NAME"
echo "   IOT_HUB_CONNECTION_STRING=\"$IOT_CONNECTION_STRING\""
echo "   EVENT_GRID_ENDPOINT=$EVENT_GRID_ENDPOINT"
echo ""
echo "2. Install Azure Digital Twins Python SDK:"
echo "   pip install azure-digitaltwins-core azure-identity azure-iot-device"
echo ""
echo "3. Start your existing EV charging infrastructure:"
echo "   python app/main.py"
echo ""
echo "4. Test the integration:"
echo "   curl http://localhost:8000/health/azure-dt"

# Step 11: Test connectivity
echo -e "\n${YELLOW}Step 11: Testing connectivity...${NC}"
az dt twin list --dt-name $DT_INSTANCE_NAME --query length
echo -e "${GREEN}✅ Digital Twins connectivity test passed${NC}"

echo -e "\n${GREEN}🎉 Azure Digital Twins integration setup complete!${NC}"
echo -e "${BLUE}Your EV charging infrastructure is now cloud-ready with enterprise-scale digital twins.${NC}" 