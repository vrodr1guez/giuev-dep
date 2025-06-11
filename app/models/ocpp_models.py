from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()

class ChargePointStatus(enum.Enum):
    AVAILABLE = "Available"
    PREPARING = "Preparing"
    CHARGING = "Charging"
    SUSPENDED_EVSE = "SuspendedEVSE"
    SUSPENDED_EV = "SuspendedEV"
    FINISHING = "Finishing"
    RESERVED = "Reserved"
    UNAVAILABLE = "Unavailable"
    FAULTED = "Faulted"

class TransactionStatus(enum.Enum):
    ACTIVE = "Active"
    COMPLETED = "Completed"
    STOPPED = "Stopped"
    FAILED = "Failed"

class AuthorizationStatus(enum.Enum):
    ACCEPTED = "Accepted"
    BLOCKED = "Blocked"
    EXPIRED = "Expired"
    INVALID = "Invalid"
    CONCURRENT_TX = "ConcurrentTx"

class OCPPChargePoint(Base):
    """OCPP Charge Point (Charging Station) Model"""
    __tablename__ = "ocpp_charge_points"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_point_id = Column(String(255), unique=True, index=True, nullable=False)
    serial_number = Column(String(255), nullable=True)
    model = Column(String(255), nullable=True)
    vendor = Column(String(255), nullable=True)
    firmware_version = Column(String(255), nullable=True)
    ocpp_version = Column(String(10), nullable=False, default="1.6")  # 1.6 or 2.0.1
    
    # Network Information
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    is_online = Column(Boolean, default=False)
    
    # Station Configuration
    number_of_connectors = Column(Integer, default=1)
    max_power_kw = Column(Float, nullable=True)
    supported_protocols = Column(JSON, nullable=True)  # e.g., ["AC", "DC"]
    
    # Location Information
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    
    # Status
    status = Column(Enum(ChargePointStatus), default=ChargePointStatus.UNAVAILABLE)
    error_code = Column(String(255), nullable=True)
    info = Column(Text, nullable=True)
    vendor_error_code = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    connectors = relationship("OCPPConnector", back_populates="charge_point", cascade="all, delete-orphan")
    transactions = relationship("OCPPTransaction", back_populates="charge_point")
    
    def __repr__(self):
        return f"<OCPPChargePoint(id={self.charge_point_id}, status={self.status})>"

class OCPPConnector(Base):
    """OCPP Connector Model"""
    __tablename__ = "ocpp_connectors"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_point_id = Column(Integer, ForeignKey("ocpp_charge_points.id"), nullable=False)
    connector_id = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    
    # Connector Configuration
    connector_type = Column(String(50), nullable=True)  # Type2, CCS, CHAdeMO, etc.
    max_power_kw = Column(Float, nullable=True)
    voltage = Column(Float, nullable=True)
    amperage = Column(Float, nullable=True)
    
    # Current Status
    status = Column(Enum(ChargePointStatus), default=ChargePointStatus.AVAILABLE)
    error_code = Column(String(255), nullable=True)
    info = Column(Text, nullable=True)
    vendor_error_code = Column(String(255), nullable=True)
    
    # Current Transaction
    current_transaction_id = Column(Integer, ForeignKey("ocpp_transactions.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    charge_point = relationship("OCPPChargePoint", back_populates="connectors")
    transactions = relationship("OCPPTransaction", back_populates="connector", foreign_keys="OCPPTransaction.connector_id")
    current_transaction = relationship("OCPPTransaction", foreign_keys=[current_transaction_id])
    
    def __repr__(self):
        return f"<OCPPConnector(cp_id={self.charge_point_id}, connector_id={self.connector_id}, status={self.status})>"

class OCPPTransaction(Base):
    """OCPP Transaction Model"""
    __tablename__ = "ocpp_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(255), unique=True, index=True, nullable=False)
    
    # References
    charge_point_id = Column(Integer, ForeignKey("ocpp_charge_points.id"), nullable=False)
    connector_id = Column(Integer, ForeignKey("ocpp_connectors.id"), nullable=False)
    rfid_card_id = Column(Integer, ForeignKey("ocpp_rfid_cards.id"), nullable=True)
    
    # Transaction Details
    id_tag = Column(String(20), nullable=False)  # RFID tag or authorization token
    start_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    end_timestamp = Column(DateTime(timezone=True), nullable=True)
    
    # Energy Measurements
    meter_start = Column(Integer, default=0)  # Wh
    meter_stop = Column(Integer, nullable=True)  # Wh
    energy_delivered = Column(Float, nullable=True)  # kWh
    
    # Status and Reason
    status = Column(Enum(TransactionStatus), default=TransactionStatus.ACTIVE)
    stop_reason = Column(String(255), nullable=True)
    
    # Cost Calculation
    cost_per_kwh = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    currency = Column(String(3), default="USD")
    
    # Session Information
    session_duration_minutes = Column(Integer, nullable=True)
    max_power_kw = Column(Float, nullable=True)
    avg_power_kw = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    charge_point = relationship("OCPPChargePoint", back_populates="transactions")
    connector = relationship("OCPPConnector", back_populates="transactions", foreign_keys=[connector_id])
    rfid_card = relationship("OCPPRFIDCard", back_populates="transactions")
    meter_values = relationship("OCPPMeterValue", back_populates="transaction", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<OCPPTransaction(id={self.transaction_id}, status={self.status})>"

class OCPPRFIDCard(Base):
    """OCPP RFID Card/Tag Model"""
    __tablename__ = "ocpp_rfid_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    id_tag = Column(String(20), unique=True, index=True, nullable=False)
    parent_id_tag = Column(String(20), nullable=True)
    
    # Card Information
    card_number = Column(String(255), nullable=True)
    card_type = Column(String(50), nullable=True)  # RFID, NFC, etc.
    
    # Authorization
    status = Column(Enum(AuthorizationStatus), default=AuthorizationStatus.ACCEPTED)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # User Information
    user_id = Column(Integer, nullable=True)  # Link to user table if exists
    user_name = Column(String(255), nullable=True)
    user_email = Column(String(255), nullable=True)
    
    # Usage Limits
    max_daily_energy_kwh = Column(Float, nullable=True)
    max_daily_cost = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    transactions = relationship("OCPPTransaction", back_populates="rfid_card")
    
    def __repr__(self):
        return f"<OCPPRFIDCard(id_tag={self.id_tag}, status={self.status})>"

class OCPPMeterValue(Base):
    """OCPP Meter Values Model for energy measurements"""
    __tablename__ = "ocpp_meter_values"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("ocpp_transactions.id"), nullable=False)
    
    # Measurement Details
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    value = Column(Float, nullable=False)
    context = Column(String(50), nullable=True)  # Sample.Periodic, Sample.Clock, etc.
    format = Column(String(50), nullable=True)   # Raw, SignedData
    measurand = Column(String(50), default="Energy.Active.Import.Register")  # What is being measured
    phase = Column(String(50), nullable=True)    # L1, L2, L3, N, L1-N, etc.
    location = Column(String(50), nullable=True) # Cable, EV, Inlet, Outlet
    unit = Column(String(50), nullable=True)     # Wh, kWh, varh, kvarh, W, kW, VA, kVA, var, kvar, A, V, K, Celsius, Fahrenheit, Percent
    
    # Relationships
    transaction = relationship("OCPPTransaction", back_populates="meter_values")
    
    def __repr__(self):
        return f"<OCPPMeterValue(transaction_id={self.transaction_id}, value={self.value} {self.unit})>"

class OCPPConfiguration(Base):
    """OCPP Configuration Parameters for Charge Points"""
    __tablename__ = "ocpp_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_point_id = Column(Integer, ForeignKey("ocpp_charge_points.id"), nullable=False)
    
    key = Column(String(255), nullable=False)
    value = Column(Text, nullable=True)
    readonly = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<OCPPConfiguration(key={self.key}, value={self.value})>"

class OCPPFirmwareStatus(Base):
    """OCPP Firmware Update Status"""
    __tablename__ = "ocpp_firmware_status"
    
    id = Column(Integer, primary_key=True, index=True)
    charge_point_id = Column(Integer, ForeignKey("ocpp_charge_points.id"), nullable=False)
    
    # Firmware Information
    current_version = Column(String(255), nullable=True)
    target_version = Column(String(255), nullable=True)
    download_url = Column(Text, nullable=True)
    
    # Update Status
    status = Column(String(50), nullable=True)  # Downloaded, DownloadFailed, Installing, InstallationFailed, Installed
    install_timestamp = Column(DateTime(timezone=True), nullable=True)
    
    # Progress
    download_progress = Column(Integer, default=0)  # 0-100
    install_progress = Column(Integer, default=0)   # 0-100
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<OCPPFirmwareStatus(cp_id={self.charge_point_id}, status={self.status})>" 