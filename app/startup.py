#!/usr/bin/env python3
"""
Startup script for EV Charging Infrastructure with OCPP support
Initializes database tables and creates sample data
"""

import asyncio
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.db.session import create_tables, SessionLocal
from app.models.ocpp_models import (
    OCPPChargePoint, OCPPConnector, OCPPRFIDCard,
    ChargePointStatus, AuthorizationStatus
)
from app.core.logging import logger
from datetime import datetime, timezone, timedelta

def create_sample_data():
    """Create sample OCPP data for demonstration"""
    db = SessionLocal()
    
    try:
        logger.info("Creating sample OCPP data...")
        
        # Check if data already exists
        existing_cp = db.query(OCPPChargePoint).first()
        if existing_cp:
            logger.info("Sample data already exists, skipping...")
            return
        
        # Create sample charge points
        charge_points_data = [
            {
                "charge_point_id": "CP001",
                "vendor": "ABB",
                "model": "Terra 184",
                "serial_number": "ABB001",
                "firmware_version": "1.2.3",
                "ocpp_version": "1.6",
                "number_of_connectors": 2,
                "max_power_kw": 50.0,
                "latitude": 37.7749,
                "longitude": -122.4194,
                "address": "123 Main St, San Francisco, CA 94102",
                "status": ChargePointStatus.UNAVAILABLE
            },
            {
                "charge_point_id": "CP002", 
                "vendor": "ChargePoint",
                "model": "Express 250",
                "serial_number": "CP002",
                "firmware_version": "2.1.0",
                "ocpp_version": "1.6",
                "number_of_connectors": 1,
                "max_power_kw": 62.5,
                "latitude": 37.7849,
                "longitude": -122.4094,
                "address": "456 Electric Ave, San Francisco, CA 94103",
                "status": ChargePointStatus.UNAVAILABLE
            },
            {
                "charge_point_id": "CP003",
                "vendor": "EVBox",
                "model": "Troniq 100",
                "serial_number": "EVB003",
                "firmware_version": "3.0.1",
                "ocpp_version": "2.0.1",
                "number_of_connectors": 2,
                "max_power_kw": 100.0,
                "latitude": 37.7649,
                "longitude": -122.4294,
                "address": "789 Power Blvd, San Francisco, CA 94104",
                "status": ChargePointStatus.UNAVAILABLE
            }
        ]
        
        # Create charge points and connectors
        for cp_data in charge_points_data:
            charge_point = OCPPChargePoint(**cp_data)
            db.add(charge_point)
            db.flush()  # Get the ID
            
            # Create connectors for each charge point
            for connector_num in range(1, cp_data["number_of_connectors"] + 1):
                connector = OCPPConnector(
                    charge_point_id=charge_point.id,
                    connector_id=connector_num,
                    connector_type="Type2" if connector_num == 1 else "CCS",
                    max_power_kw=cp_data["max_power_kw"] / cp_data["number_of_connectors"],
                    voltage=400.0,
                    amperage=125.0,
                    status=ChargePointStatus.AVAILABLE
                )
                db.add(connector)
        
        # Create sample RFID cards
        rfid_cards_data = [
            {
                "id_tag": "CARD001",
                "user_name": "John Doe",
                "user_email": "john.doe@example.com",
                "status": AuthorizationStatus.ACCEPTED,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=365),
                "max_daily_energy_kwh": 100.0,
                "max_daily_cost": 50.0
            },
            {
                "id_tag": "CARD002",
                "user_name": "Jane Smith", 
                "user_email": "jane.smith@example.com",
                "status": AuthorizationStatus.ACCEPTED,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=365),
                "max_daily_energy_kwh": 150.0,
                "max_daily_cost": 75.0
            },
            {
                "id_tag": "CARD003",
                "user_name": "Fleet Admin",
                "user_email": "fleet@company.com", 
                "status": AuthorizationStatus.ACCEPTED,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=365),
                "max_daily_energy_kwh": 500.0,
                "max_daily_cost": 200.0
            },
            {
                "id_tag": "CARD004",
                "user_name": "Test User",
                "user_email": "test@example.com",
                "status": AuthorizationStatus.BLOCKED,
                "expiry_date": datetime.now(timezone.utc) + timedelta(days=30)
            }
        ]
        
        for card_data in rfid_cards_data:
            rfid_card = OCPPRFIDCard(**card_data)
            db.add(rfid_card)
        
        db.commit()
        logger.info("Sample OCPP data created successfully!")
        
        # Print summary
        total_cps = db.query(OCPPChargePoint).count()
        total_connectors = db.query(OCPPConnector).count()
        total_cards = db.query(OCPPRFIDCard).count()
        
        logger.info(f"Created: {total_cps} charge points, {total_connectors} connectors, {total_cards} RFID cards")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def initialize_directories():
    """Create necessary directories"""
    directories = [
        "logs",
        "uploads",
        "uploads/firmware"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {directory}")

def main():
    """Main startup function"""
    logger.info("Starting EV Charging Infrastructure initialization...")
    
    try:
        # Create necessary directories
        initialize_directories()
        
        # Create database tables
        logger.info("Creating database tables...")
        create_tables()
        
        # Create sample data
        create_sample_data()
        
        logger.info("✅ Initialization completed successfully!")
        logger.info("")
        logger.info("🚀 You can now:")
        logger.info("   1. Start the main application: python -m uvicorn app.main:app --reload")
        logger.info("   2. View API docs at: http://localhost:8000/docs")
        logger.info("   3. View OCPP endpoints at: http://localhost:8000/api/ocpp")
        logger.info("   4. Connect charge points to: ws://localhost:9000/ocpp/{charge_point_id}")
        logger.info("")
        logger.info("📋 Sample data created:")
        logger.info("   - Charge Points: CP001, CP002, CP003")
        logger.info("   - RFID Cards: CARD001, CARD002, CARD003, CARD004")
        logger.info("   - Database: ev_charging.db")
        
    except Exception as e:
        logger.error(f"❌ Initialization failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 