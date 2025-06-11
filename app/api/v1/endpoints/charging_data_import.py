import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks
from typing import Optional, Dict
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_superuser
from app.models.user import User
from app.services.charging_data_import import ChargingDataImporter
from app.core.logging import logger

router = APIRouter()


@router.post("/import", status_code=status.HTTP_202_ACCEPTED)
async def import_charging_data(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    organization_id: int = Form(...),
    current_user: User = Depends(get_current_active_superuser),  # Only admins can import data
    background_tasks: BackgroundTasks
):
    """
    Import charging stations data from a CSV or JSON file.
    
    This endpoint accepts:
    - CSV files with charging station data
    - JSON/GeoJSON files with charging station data
    
    The data will be processed and imported into the database.
    Existing stations (matched by external ID) will be updated.
    """
    try:
        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        # Determine file type
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        # Initialize the importer
        importer = ChargingDataImporter(db)
        
        # Process based on file type
        if file_ext == '.csv':
            result = importer.import_from_csv(temp_path, organization_id)
        elif file_ext in ['.json', '.geojson']:
            result = importer.import_from_json(temp_path, organization_id)
        else:
            # Cleanup the temp file
            os.unlink(temp_path)
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a CSV or JSON file."
            )
        
        # Cleanup the temp file
        os.unlink(temp_path)
        
        return {
            "message": "Data import successful",
            "stats": result
        }
    except Exception as e:
        logger.error(f"Error in import_charging_data: {str(e)}")
        # Ensure the temp file is cleaned up even on error
        try:
            if 'temp_path' in locals():
                os.unlink(temp_path)
        except:
            pass
            
        raise HTTPException(
            status_code=500,
            detail=f"Data import failed: {str(e)}"
        )


@router.get("/import/stats")
async def get_import_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
):
    """
    Get statistics about imported charging stations.
    """
    try:
        # Query the database for statistics about charging networks and stations
        from sqlalchemy import func
        from app.models.charging_station import ChargingStation
        from app.models.charging_network import ChargingNetwork
        
        # Get counts by network
        network_stats = db.query(
            ChargingNetwork.name, 
            func.count(ChargingStation.id).label('station_count')
        ).outerjoin(
            ChargingStation, ChargingNetwork.id == ChargingStation.network_id
        ).group_by(
            ChargingNetwork.name
        ).all()
        
        # Get HPC station count
        hpc_count = db.query(func.count(ChargingStation.id)).filter(
            ChargingStation.is_hpc == True
        ).scalar()
        
        # Get total station count
        total_count = db.query(func.count(ChargingStation.id)).scalar()
        
        # Get station count by state
        state_stats = db.query(
            ChargingStation.state,
            func.count(ChargingStation.id).label('station_count')
        ).group_by(
            ChargingStation.state
        ).all()
        
        return {
            "total_stations": total_count,
            "hpc_stations": hpc_count,
            "by_network": {network: count for network, count in network_stats},
            "by_state": {state: count for state, count in state_stats}
        }
    except Exception as e:
        logger.error(f"Error in get_import_stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve import statistics: {str(e)}"
        ) 