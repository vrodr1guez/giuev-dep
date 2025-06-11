"""
CROSS-INDUSTRY PLATFORM INTEGRATION API
RESTful API for Privacy-Preserved Data Sharing and Federated Learning

This API provides endpoints for:
- Industry participant registration
- Cross-industry data sharing with privacy preservation
- Federated learning network coordination
- Network effects analytics
- Real-time collaboration insights
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional, Set
from datetime import datetime
import asyncio
import logging
import json
import hashlib

# Import our platform integration modules
from ..services.platform_integration import (
    CrossIndustryDataHub, 
    PlatformIntegrationOrchestrator,
    IndustryType, 
    PrivacyLevel,
    DataSchema,
    SharedDataPacket
)
from ..services.ecosystem_network import (
    EcosystemNetworkOrchestrator,
    NetworkSegment,
    LearningMode,
    NetworkNode,
    LearningTask
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="Cross-Industry Platform Integration API",
    description="Privacy-Preserved Data Sharing and Federated Learning Network",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Global orchestrators
platform_orchestrator = PlatformIntegrationOrchestrator()
ecosystem_orchestrator = EcosystemNetworkOrchestrator()

# Pydantic models for request/response
class IndustryRegistrationRequest(BaseModel):
    participant_id: str = Field(..., description="Unique identifier for the participant")
    industry: str = Field(..., description="Industry type")
    capabilities: List[str] = Field(..., description="List of capabilities")
    data_sharing_level: str = Field(..., description="Privacy level for data sharing")
    contact_info: Optional[Dict[str, str]] = Field(None, description="Contact information")

class DataSharingRequest(BaseModel):
    sender_id: str = Field(..., description="ID of the data sender")
    data: Dict[str, Any] = Field(..., description="Data to be shared")
    target_industries: List[str] = Field(..., description="Target industries")
    privacy_level: str = Field(..., description="Privacy protection level")
    purpose: str = Field(..., description="Purpose of data sharing")
    retention_days: Optional[int] = Field(365, description="Data retention period in days")

class DataAccessRequest(BaseModel):
    requestor_id: str = Field(..., description="ID of the data requestor")
    filters: Dict[str, Any] = Field(..., description="Data access filters")
    purpose: str = Field(..., description="Purpose of data access")

class FederatedLearningRequest(BaseModel):
    task_type: str = Field(..., description="Type of learning task")
    objective: str = Field(..., description="Learning objective")
    participating_segments: List[str] = Field(..., description="Network segments to participate")
    model_config: Optional[Dict[str, Any]] = Field(None, description="Model configuration")

class NetworkNodeRegistration(BaseModel):
    node_id: str = Field(..., description="Unique node identifier")
    segment: str = Field(..., description="Network segment")
    capabilities: List[str] = Field(..., description="Node capabilities")
    learning_modes: List[str] = Field(..., description="Supported learning modes")

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify authentication token"""
    # In production, implement proper JWT token verification
    if not credentials.credentials or len(credentials.credentials) < 10:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return {"user_id": "authenticated_user", "token": credentials.credentials}

# Platform Integration Endpoints

@app.post("/api/v1/platform/register-participant")
async def register_industry_participant(
    request: IndustryRegistrationRequest,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Register a new industry participant in the cross-industry platform"""
    
    try:
        # Validate industry type
        try:
            industry_enum = IndustryType(request.industry.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid industry type: {request.industry}")
        
        # Validate privacy level
        try:
            privacy_enum = PrivacyLevel(request.data_sharing_level.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid privacy level: {request.data_sharing_level}")
        
        # Register participant
        result = platform_orchestrator.data_hub.register_industry_participant(
            request.participant_id,
            industry_enum,
            request.capabilities,
            privacy_enum
        )
        
        logger.info(f"Registered industry participant: {request.participant_id} in {request.industry}")
        
        return {
            "success": True,
            "message": "Industry participant registered successfully",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error registering industry participant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/v1/platform/share-data")
async def share_cross_industry_data(
    request: DataSharingRequest,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Share data across industries with privacy preservation"""
    
    try:
        # Validate target industries
        target_industries_enum = set()
        for industry in request.target_industries:
            try:
                target_industries_enum.add(IndustryType(industry.lower()))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid target industry: {industry}")
        
        # Validate privacy level
        try:
            privacy_enum = PrivacyLevel(request.privacy_level.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid privacy level: {request.privacy_level}")
        
        # Share data
        result = platform_orchestrator.data_hub.share_data(
            request.sender_id,
            request.data,
            target_industries_enum,
            privacy_enum
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        logger.info(f"Data shared by {request.sender_id} to {len(request.target_industries)} industries")
        
        return {
            "success": True,
            "message": "Data shared successfully with privacy preservation",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data sharing failed: {str(e)}")

@app.post("/api/v1/platform/access-data")
async def access_shared_data(
    request: DataAccessRequest,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Access shared data based on permissions and filters"""
    
    try:
        result = platform_orchestrator.data_hub.access_shared_data(
            request.requestor_id,
            request.filters
        )
        
        if "error" in result:
            raise HTTPException(status_code=403, detail=result["error"])
        
        logger.info(f"Data accessed by {request.requestor_id}: {result['accessible_packets']} packets")
        
        return {
            "success": True,
            "message": "Data access granted",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accessing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data access failed: {str(e)}")

@app.get("/api/v1/platform/network-analytics")
async def get_platform_network_analytics(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive platform network analytics"""
    
    try:
        analytics = platform_orchestrator.data_hub.get_network_analytics()
        
        return {
            "success": True,
            "message": "Network analytics retrieved successfully",
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving network analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics retrieval failed: {str(e)}")

# Federated Learning Network Endpoints

@app.post("/api/v1/ecosystem/register-node")
async def register_federated_learning_node(
    request: NetworkNodeRegistration,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Register a node in the federated learning network"""
    
    try:
        # Validate network segment
        try:
            segment_enum = NetworkSegment(request.segment.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid network segment: {request.segment}")
        
        # Validate learning modes
        learning_modes_enum = set()
        for mode in request.learning_modes:
            try:
                learning_modes_enum.add(LearningMode(mode.lower()))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid learning mode: {mode}")
        
        # Register node
        result = ecosystem_orchestrator.fl_coordinator.register_node(
            request.node_id,
            segment_enum,
            set(request.capabilities),
            learning_modes_enum
        )
        
        logger.info(f"Registered FL node: {request.node_id} in {request.segment}")
        
        return {
            "success": True,
            "message": "Federated learning node registered successfully",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering FL node: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Node registration failed: {str(e)}")

@app.post("/api/v1/ecosystem/create-learning-task")
async def create_federated_learning_task(
    request: FederatedLearningRequest,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Create a new federated learning task"""
    
    try:
        # Validate learning mode
        try:
            task_type_enum = LearningMode(request.task_type.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid task type: {request.task_type}")
        
        # Validate participating segments
        segments_enum = set()
        for segment in request.participating_segments:
            try:
                segments_enum.add(NetworkSegment(segment.lower()))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid segment: {segment}")
        
        # Create learning task
        result = ecosystem_orchestrator.fl_coordinator.create_learning_task(
            task_type_enum,
            request.objective,
            segments_enum
        )
        
        logger.info(f"Created FL task: {request.objective} for {len(request.participating_segments)} segments")
        
        return {
            "success": True,
            "message": "Federated learning task created successfully",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating FL task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Task creation failed: {str(e)}")

@app.post("/api/v1/ecosystem/execute-learning-round/{task_id}")
async def execute_federated_learning_round(
    task_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Execute a federated learning round for a specific task"""
    
    try:
        # Execute federated learning round
        result = ecosystem_orchestrator.fl_coordinator.execute_federated_round(task_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        logger.info(f"Executed FL round for task {task_id}: {result['participating_nodes']} nodes")
        
        return {
            "success": True,
            "message": "Federated learning round executed successfully",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing FL round: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Learning round execution failed: {str(e)}")

@app.get("/api/v1/ecosystem/network-analytics")
async def get_ecosystem_network_analytics(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive ecosystem network analytics"""
    
    try:
        analytics = ecosystem_orchestrator.get_ecosystem_analytics()
        
        return {
            "success": True,
            "message": "Ecosystem analytics retrieved successfully",
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving ecosystem analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics retrieval failed: {str(e)}")

# Combined Platform Endpoints

@app.post("/api/v1/platform/initialize")
async def initialize_complete_platform(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Initialize the complete cross-industry platform with federated learning"""
    
    try:
        # Initialize platform integration
        platform_result = platform_orchestrator.initialize_cross_industry_platform()
        
        # Initialize ecosystem network
        ecosystem_result = ecosystem_orchestrator.initialize_ecosystem_network()
        
        # Create integration between platform and ecosystem
        integration_result = await create_platform_ecosystem_integration()
        
        logger.info("Complete cross-industry platform initialized successfully")
        
        return {
            "success": True,
            "message": "Complete cross-industry platform initialized",
            "data": {
                "platform_integration": platform_result,
                "ecosystem_network": ecosystem_result,
                "integration_layer": integration_result
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error initializing platform: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Platform initialization failed: {str(e)}")

@app.post("/api/v1/platform/demonstrate")
async def demonstrate_complete_platform(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Demonstrate the complete platform capabilities"""
    
    try:
        # Demonstrate cross-industry sharing
        sharing_demo = platform_orchestrator.demonstrate_cross_industry_sharing()
        
        # Demonstrate multi-segment learning
        learning_demo = ecosystem_orchestrator.demonstrate_multi_segment_learning()
        
        # Calculate combined network effects
        combined_effects = calculate_combined_network_effects(sharing_demo, learning_demo)
        
        logger.info("Complete platform demonstration completed successfully")
        
        return {
            "success": True,
            "message": "Platform demonstration completed",
            "data": {
                "cross_industry_sharing": sharing_demo,
                "multi_segment_learning": learning_demo,
                "combined_network_effects": combined_effects
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error demonstrating platform: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Platform demonstration failed: {str(e)}")

@app.get("/api/v1/platform/status")
async def get_platform_status(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get comprehensive platform status and health metrics"""
    
    try:
        # Platform metrics
        platform_analytics = platform_orchestrator.data_hub.get_network_analytics()
        
        # Ecosystem metrics
        ecosystem_analytics = ecosystem_orchestrator.get_ecosystem_analytics()
        
        # System health metrics
        health_metrics = {
            "platform_registered_participants": platform_analytics["network_size"],
            "ecosystem_registered_nodes": ecosystem_analytics["network_topology"]["total_nodes"],
            "total_data_packets_shared": platform_analytics["shared_data_packets"],
            "total_learning_rounds": ecosystem_analytics["learning_analytics"]["completed_learning_rounds"],
            "network_stability": ecosystem_analytics["ecosystem_health"]["network_stability"],
            "average_collaboration_score": platform_analytics["average_collaboration_score"],
            "system_uptime": "operational",
            "last_activity": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": "Platform status retrieved successfully",
            "data": {
                "health_metrics": health_metrics,
                "platform_analytics": platform_analytics,
                "ecosystem_analytics": ecosystem_analytics
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving platform status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")

# WebSocket endpoint for real-time updates
@app.websocket("/api/v1/platform/realtime")
async def realtime_platform_updates(websocket):
    """WebSocket endpoint for real-time platform updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send periodic updates
            platform_status = {
                "type": "status_update",
                "platform_participants": len(platform_orchestrator.data_hub.registered_industries),
                "ecosystem_nodes": len(ecosystem_orchestrator.fl_coordinator.nodes),
                "active_learning_tasks": len(ecosystem_orchestrator.fl_coordinator.active_tasks),
                "network_activity": "active",
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send_json(platform_status)
            await asyncio.sleep(30)  # Send updates every 30 seconds
            
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()

# Helper functions

async def create_platform_ecosystem_integration() -> Dict[str, Any]:
    """Create integration layer between platform and ecosystem"""
    
    # Map industry participants to ecosystem nodes
    integration_mappings = []
    
    for participant_id, industry in platform_orchestrator.data_hub.registered_industries.items():
        # Find corresponding ecosystem nodes
        corresponding_nodes = []
        for node_id, node in ecosystem_orchestrator.fl_coordinator.nodes.items():
            if industry.value == node.segment.value:
                corresponding_nodes.append(node_id)
        
        if corresponding_nodes:
            integration_mappings.append({
                "participant_id": participant_id,
                "industry": industry.value,
                "ecosystem_nodes": corresponding_nodes
            })
    
    return {
        "integration_mappings": integration_mappings,
        "total_mappings": len(integration_mappings),
        "integration_coverage": len(integration_mappings) / max(1, len(platform_orchestrator.data_hub.registered_industries)),
        "status": "active"
    }

def calculate_combined_network_effects(sharing_demo: Dict[str, Any], learning_demo: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate combined network effects from both platform and ecosystem"""
    
    # Platform network effects
    platform_value = sharing_demo.get("network_analytics", {}).get("network_metrics", {}).get("metcalfe_effect", 0)
    
    # Ecosystem network effects  
    ecosystem_value = learning_demo.get("ecosystem_metrics", {}).get("network_value", {}).get("total_value", 0)
    
    # Combined synergy (more than sum of parts)
    synergy_multiplier = 1.3  # 30% synergy bonus
    combined_value = (platform_value + ecosystem_value) * synergy_multiplier
    
    # Network amplification from both systems
    platform_amplification = sharing_demo.get("network_analytics", {}).get("network_value_multiplier", 1.0)
    ecosystem_amplification = learning_demo.get("network_amplification_factor", 1.0)
    combined_amplification = (platform_amplification + ecosystem_amplification) / 2 * synergy_multiplier
    
    return {
        "platform_network_value": platform_value,
        "ecosystem_network_value": ecosystem_value,
        "combined_network_value": combined_value,
        "synergy_bonus": (combined_value - platform_value - ecosystem_value),
        "platform_amplification": platform_amplification,
        "ecosystem_amplification": ecosystem_amplification,
        "combined_amplification": combined_amplification,
        "network_effect_strength": "High" if combined_amplification > 1.5 else "Medium" if combined_amplification > 1.2 else "Low"
    }

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "Cross-Industry Platform Integration API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

# API Information endpoint
@app.get("/api/v1/info")
async def api_info():
    """Get API information and capabilities"""
    return {
        "service_name": "Cross-Industry Platform Integration API",
        "version": "2.0.0",
        "description": "Privacy-Preserved Data Sharing and Federated Learning Network",
        "capabilities": [
            "Cross-industry data sharing with privacy preservation",
            "Federated learning network coordination",
            "Network effects analytics",
            "Real-time collaboration insights",
            "Multi-segment ecosystem orchestration"
        ],
        "supported_industries": [industry.value for industry in IndustryType],
        "supported_learning_modes": [mode.value for mode in LearningMode],
        "privacy_levels": [level.value for level in PrivacyLevel],
        "endpoints": {
            "platform": "/api/v1/platform/*",
            "ecosystem": "/api/v1/ecosystem/*",
            "documentation": "/api/docs",
            "health": "/api/v1/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 