from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, Path
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
import math

from app.api import deps
from app.schemas.user import User
from app.schemas.energy_marketplace import (
    EnergyOfferCreate, EnergyOfferUpdate, EnergyOffer, 
    EnergyPurchaseCreate, EnergyPurchase,
    CarbonCredit, EnergyMarketplaceStats, EnergyOffersList,
    EnergySourceType, EnergyOfferStatus, CarbonCreditStatus
)
from app.models.energy_marketplace import (
    EnergyOffer as EnergyOfferModel,
    EnergyPurchase as EnergyPurchaseModel,
    CarbonCredit as CarbonCreditModel,
    MarketplaceActivity
)
from app.core.notifications import NotificationService, NotificationType, NotificationChannel
from app.services.geospatial import calculate_distance

router = APIRouter()

# --- Energy Marketplace API Endpoints ---

@router.get("/stats", response_model=EnergyMarketplaceStats)
async def get_marketplace_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get current energy marketplace statistics."""
    # Calculate current stats
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    
    # Active offers count and total energy
    active_offers_query = db.query(
        func.count(EnergyOfferModel.id),
        func.sum(EnergyOfferModel.remaining_kwh)
    ).filter(
        EnergyOfferModel.status == EnergyOfferStatus.ACTIVE.value,
        EnergyOfferModel.availability_end > now
    ).first()
    
    total_active_offers = active_offers_query[0] or 0
    total_energy_available = active_offers_query[1] or 0
    
    # Average price
    avg_price_query = db.query(
        func.avg(EnergyOfferModel.price_per_kwh)
    ).filter(
        EnergyOfferModel.status == EnergyOfferStatus.ACTIVE.value,
        EnergyOfferModel.availability_end > now
    ).scalar()
    
    average_price = avg_price_query or 0
    
    # Renewable percentage
    renewable_query = db.query(
        (func.sum(EnergyOfferModel.remaining_kwh).filter(EnergyOfferModel.is_renewable == True) / 
         func.sum(EnergyOfferModel.remaining_kwh) * 100)
    ).filter(
        EnergyOfferModel.status == EnergyOfferStatus.ACTIVE.value,
        EnergyOfferModel.availability_end > now
    ).scalar()
    
    renewable_percentage = renewable_query or 0
    
    # 24h transactions
    transactions_24h = db.query(
        func.count(EnergyPurchaseModel.id),
        func.sum(CarbonCreditModel.amount)
    ).outerjoin(
        CarbonCreditModel, 
        CarbonCreditModel.source_transaction_id == EnergyPurchaseModel.id
    ).filter(
        EnergyPurchaseModel.created_at > day_ago
    ).first()
    
    total_transactions_24h = transactions_24h[0] or 0
    carbon_credits_24h = transactions_24h[1] or 0
    
    # Peak trading hours
    peak_hours_query = db.query(
        func.extract('hour', EnergyPurchaseModel.created_at).label('hour'),
        func.count(EnergyPurchaseModel.id).label('count')
    ).filter(
        EnergyPurchaseModel.created_at > day_ago
    ).group_by(
        func.extract('hour', EnergyPurchaseModel.created_at)
    ).order_by(
        func.count(EnergyPurchaseModel.id).desc()
    ).limit(6).all()
    
    peak_hours = [int(row[0]) for row in peak_hours_query]
    
    return {
        "total_active_offers": total_active_offers,
        "total_energy_available_kwh": float(total_energy_available),
        "average_price_per_kwh": float(average_price),
        "renewable_percentage": float(renewable_percentage),
        "total_transactions_24h": total_transactions_24h,
        "carbon_credits_generated_24h": float(carbon_credits_24h),
        "peak_trading_hours": peak_hours
    }


@router.get("/offers", response_model=EnergyOffersList)
async def get_energy_offers(
    status: Optional[EnergyOfferStatus] = Query(None, description="Filter by offer status"),
    source_type: Optional[EnergySourceType] = Query(None, description="Filter by energy source"),
    min_price: Optional[float] = Query(None, description="Minimum price per kWh"),
    max_price: Optional[float] = Query(None, description="Maximum price per kWh"),
    renewable_only: bool = Query(False, description="Show only renewable energy offers"),
    latitude: Optional[float] = Query(None, description="Filter by proximity - latitude"),
    longitude: Optional[float] = Query(None, description="Filter by proximity - longitude"),
    max_distance: Optional[float] = Query(None, description="Maximum distance in km"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all active energy offers with filtering options."""
    now = datetime.utcnow()
    
    # Base query
    query = db.query(EnergyOfferModel).filter(
        EnergyOfferModel.availability_end > now,
        EnergyOfferModel.remaining_kwh > 0
    )
    
    # Apply filters
    if status:
        query = query.filter(EnergyOfferModel.status == status)
    else:
        query = query.filter(EnergyOfferModel.status == EnergyOfferStatus.ACTIVE.value)
        
    if source_type:
        query = query.filter(EnergyOfferModel.source_type == source_type)
        
    if min_price is not None:
        query = query.filter(EnergyOfferModel.price_per_kwh >= min_price)
        
    if max_price is not None:
        query = query.filter(EnergyOfferModel.price_per_kwh <= max_price)
        
    if renewable_only:
        query = query.filter(EnergyOfferModel.is_renewable == True)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting - prioritize offers by proximity if coordinates are provided
    if latitude is not None and longitude is not None:
        # In a production environment, this would use PostGIS or similar for efficient spatial queries
        # For simplicity, we'll sort after retrieving the data
        offers = query.offset(offset).limit(limit).all()
        
        # Calculate distance for each offer
        for offer in offers:
            offer.distance = calculate_distance(
                latitude, longitude, 
                offer.location_latitude, offer.location_longitude
            )
            
        # Filter by max distance if specified
        if max_distance is not None:
            offers = [o for o in offers if o.distance <= max_distance]
            
        # Sort by distance
        offers.sort(key=lambda x: x.distance)
    else:
        # Default sorting by price and availability
        offers = query.order_by(
            EnergyOfferModel.price_per_kwh, 
            EnergyOfferModel.availability_end
        ).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "offers": offers
    }


@router.post("/offers", response_model=EnergyOffer)
async def create_energy_offer(
    offer: EnergyOfferCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Create a new energy offer in the marketplace."""
    if offer.availability_start < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Availability start time must be in the future")
        
    new_offer = EnergyOfferModel(
        seller_id=current_user.id,
        source_type=offer.source_type,
        energy_amount_kwh=offer.energy_amount_kwh,
        price_per_kwh=offer.price_per_kwh,
        availability_start=offer.availability_start,
        availability_end=offer.availability_end,
        location_latitude=offer.location_latitude,
        location_longitude=offer.location_longitude,
        min_purchase_kwh=offer.min_purchase_kwh,
        max_distance_km=offer.max_distance_km,
        carbon_intensity=offer.carbon_intensity,
        is_renewable=offer.is_renewable,
        status=EnergyOfferStatus.ACTIVE.value,
        remaining_kwh=offer.energy_amount_kwh
    )
    
    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)
    
    # Send notification
    background_tasks.add_task(
        notification_service.send_notification,
        recipient_id=current_user.id,
        notification_type=NotificationType.ENERGY_OFFER_CREATED,
        title="Energy Offer Created",
        message=f"Your offer to sell {offer.energy_amount_kwh} kWh of {offer.source_type} energy has been created.",
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH]
    )
    
    return new_offer


@router.get("/offers/{offer_id}", response_model=EnergyOffer)
async def get_energy_offer(
    offer_id: int = Path(..., description="The ID of the energy offer to get"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get a specific energy offer by ID."""
    offer = db.query(EnergyOfferModel).filter(EnergyOfferModel.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Energy offer not found")
    return offer


@router.put("/offers/{offer_id}", response_model=EnergyOffer)
async def update_energy_offer(
    offer_id: int,
    offer_update: EnergyOfferUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update an existing energy offer."""
    offer = db.query(EnergyOfferModel).filter(
        EnergyOfferModel.id == offer_id,
        EnergyOfferModel.seller_id == current_user.id
    ).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Energy offer not found or you don't have permission")
        
    # Update fields
    for key, value in offer_update.dict(exclude_unset=True).items():
        setattr(offer, key, value)
        
    db.commit()
    db.refresh(offer)
    return offer


@router.delete("/offers/{offer_id}")
async def delete_energy_offer(
    offer_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Cancel/delete an energy offer."""
    offer = db.query(EnergyOfferModel).filter(
        EnergyOfferModel.id == offer_id,
        EnergyOfferModel.seller_id == current_user.id
    ).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Energy offer not found or you don't have permission")
        
    # Set status to cancelled instead of deleting
    offer.status = EnergyOfferStatus.CANCELLED.value
    db.commit()
    
    return {"success": True, "message": "Offer cancelled successfully"}


@router.post("/purchase", response_model=EnergyPurchase)
async def purchase_energy(
    purchase: EnergyPurchaseCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    notification_service: NotificationService = Depends(deps.get_notification_service)
):
    """Purchase energy from an offer."""
    # Get the offer
    offer = db.query(EnergyOfferModel).filter(
        EnergyOfferModel.id == purchase.offer_id,
        EnergyOfferModel.status == EnergyOfferStatus.ACTIVE.value,
        EnergyOfferModel.availability_end > datetime.utcnow(),
        EnergyOfferModel.remaining_kwh > 0
    ).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Energy offer not found, expired, or sold out")
    
    # Check if purchase amount is valid
    if purchase.energy_amount_kwh > offer.remaining_kwh:
        raise HTTPException(status_code=400, detail=f"Not enough energy available. Maximum available: {offer.remaining_kwh} kWh")
        
    if purchase.energy_amount_kwh < offer.min_purchase_kwh:
        raise HTTPException(status_code=400, detail=f"Minimum purchase amount is {offer.min_purchase_kwh} kWh")
    
    # Check distance if applicable
    if purchase.delivery_location_latitude and purchase.delivery_location_longitude:
        distance = calculate_distance(
            offer.location_latitude, offer.location_longitude,
            purchase.delivery_location_latitude, purchase.delivery_location_longitude
        )
        
        if distance > offer.max_distance_km:
            raise HTTPException(status_code=400, detail=f"Delivery location is too far. Maximum distance: {offer.max_distance_km} km")
    
    # Create purchase record
    new_purchase = EnergyPurchaseModel(
        offer_id=purchase.offer_id,
        buyer_id=current_user.id,
        energy_amount_kwh=purchase.energy_amount_kwh,
        purchase_price_per_kwh=offer.price_per_kwh,
        delivery_time=purchase.delivery_time,
        delivery_location_latitude=purchase.delivery_location_latitude,
        delivery_location_longitude=purchase.delivery_location_longitude,
        vehicle_id=purchase.vehicle_id,
        offer_source_type=offer.source_type,
        seller_id=offer.seller_id
    )
    
    # Update offer remaining energy
    offer.remaining_kwh -= purchase.energy_amount_kwh
    offer.total_sold_kwh += purchase.energy_amount_kwh
    
    # Update offer status if sold out
    if offer.remaining_kwh <= 0:
        offer.status = EnergyOfferStatus.FULFILLED.value
    
    # Generate carbon credits if applicable
    if offer.is_renewable:
        # Calculate carbon credits based on energy amount and source type
        # This is a simplified calculation - in reality would be more complex
        carbon_credit_multiplier = {
            EnergySourceType.SOLAR.value: 0.3,
            EnergySourceType.WIND.value: 0.28,
            EnergySourceType.HYDRO.value: 0.25,
            EnergySourceType.GEOTHERMAL.value: 0.22,
            EnergySourceType.BIOMASS.value: 0.15,
            EnergySourceType.EV_BATTERY.value: 0.2,
            EnergySourceType.HOME_BATTERY.value: 0.2,
            EnergySourceType.MIXED.value: 0.18,
        }.get(offer.source_type, 0.1)
        
        carbon_credits = purchase.energy_amount_kwh * carbon_credit_multiplier
        
        # Record carbon credits
        new_purchase.carbon_credits_earned = carbon_credits
        
        # Create carbon credit record
        carbon_credit = CarbonCreditModel(
            user_id=current_user.id,
            source_transaction_id=None,  # Will be set after purchase is committed
            source_type="renewable_energy_purchase",
            amount=carbon_credits,
            status=CarbonCreditStatus.PENDING.value,
            expires_at=datetime.utcnow() + timedelta(days=365)  # Credits expire after 1 year
        )
        
        db.add(carbon_credit)
    
    # Commit all changes
    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)
    
    # Update carbon credit with transaction ID
    if offer.is_renewable and carbon_credits > 0:
        carbon_credit.source_transaction_id = new_purchase.id
        db.commit()
    
    # Send notifications to both buyer and seller
    background_tasks.add_task(
        notification_service.send_notification,
        recipient_id=current_user.id,
        notification_type=NotificationType.ENERGY_PURCHASE_CONFIRMED,
        title="Energy Purchase Confirmed",
        message=f"Your purchase of {purchase.energy_amount_kwh} kWh of {offer.source_type} energy has been confirmed.",
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH]
    )
    
    background_tasks.add_task(
        notification_service.send_notification,
        recipient_id=offer.seller_id,
        notification_type=NotificationType.ENERGY_OFFER_SOLD,
        title="Energy Offer Sold",
        message=f"Someone purchased {purchase.energy_amount_kwh} kWh of your {offer.source_type} energy.",
        channels=[NotificationChannel.IN_APP, NotificationChannel.PUSH, NotificationChannel.EMAIL]
    )
    
    return new_purchase


@router.get("/purchases", response_model=List[EnergyPurchase])
async def get_user_purchases(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get energy purchases made by the current user."""
    purchases = db.query(EnergyPurchaseModel).filter(
        EnergyPurchaseModel.buyer_id == current_user.id
    ).order_by(
        EnergyPurchaseModel.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return purchases


@router.get("/sales", response_model=List[EnergyPurchase])
async def get_user_sales(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get energy sales made by the current user."""
    sales = db.query(EnergyPurchaseModel).filter(
        EnergyPurchaseModel.seller_id == current_user.id
    ).order_by(
        EnergyPurchaseModel.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return sales


@router.get("/carbon-credits", response_model=List[CarbonCredit])
async def get_carbon_credits(
    status: Optional[CarbonCreditStatus] = Query(None, description="Filter by credit status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get carbon credits earned by the current user."""
    query = db.query(CarbonCreditModel).filter(
        CarbonCreditModel.user_id == current_user.id
    )
    
    if status:
        query = query.filter(CarbonCreditModel.status == status)
    
    credits = query.order_by(
        CarbonCreditModel.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return credits 