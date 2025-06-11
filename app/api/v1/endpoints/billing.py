from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uuid
from decimal import Decimal

router = APIRouter()

# Pydantic models for billing
class InvoiceItem(BaseModel):
    description: str
    amount: float
    quantity: float = 1.0
    unit: str = "kWh"

class Invoice(BaseModel):
    id: str
    date: str
    amount: str
    status: str
    payment_method: str
    payment_date: Optional[str] = None
    items: List[InvoiceItem]
    customer: str
    due_date: str

class ReimbursementRequest(BaseModel):
    id: str
    employee: str
    employee_id: str
    department: str
    date: str
    amount: str
    status: str
    approved_by: Optional[str] = None
    approved_date: Optional[str] = None
    description: str
    location: str
    vehicle: str

class PaymentMethod(BaseModel):
    id: int
    type: str
    details: str
    expiry_date: Optional[str] = None
    cardholder_name: Optional[str] = None
    billing_address: Optional[str] = None
    is_primary: bool = False
    last_used: Optional[str] = None

class BillingSummary(BaseModel):
    label: str
    value: str
    change: Optional[str] = None
    previous_value: Optional[str] = None
    due_date: Optional[str] = None

class UsageStats(BaseModel):
    total_consumption: str
    estimated_cost: str
    active_locations: int
    peak_demand: str
    off_peak_percentage: str
    cost_savings: str

class PaymentBreakdown(BaseModel):
    total_paid: str
    by_location: List[Dict[str, Any]]
    by_time_of_use: List[Dict[str, Any]]

# Mock data (in production, this would come from database)
def get_mock_invoices() -> List[Invoice]:
    return [
        Invoice(
            id='INV-2024-1205',
            date='2024-05-15',
            amount='$1,245.78',
            status='Paid',
            payment_method='Corporate Card (Visa •••• 3845)',
            payment_date='2024-05-16',
            items=[
                InvoiceItem(description='HQ Charging Hub - 5,430 kWh', amount=762.65),
                InvoiceItem(description='Downtown Depot - 2,824 kWh', amount=396.95),
                InvoiceItem(description='West Distribution Center - 613 kWh', amount=86.18)
            ],
            customer='GreenFleet Corp',
            due_date='2024-05-30'
        ),
        Invoice(
            id='INV-2024-1186',
            date='2024-05-01',
            amount='$987.45',
            status='Paid',
            payment_method='Bank Transfer (First National •••6712)',
            payment_date='2024-05-03',
            items=[
                InvoiceItem(description='HQ Charging Hub - 4,213 kWh', amount=592.53),
                InvoiceItem(description='Downtown Depot - 1,986 kWh', amount=279.22),
                InvoiceItem(description='West Distribution Center - 825 kWh', amount=115.70)
            ],
            customer='GreenFleet Corp',
            due_date='2024-05-15'
        ),
        Invoice(
            id='INV-2024-1238',
            date='2024-05-30',
            amount='$1,123.56',
            status='Pending',
            payment_method='Pending',
            payment_date=None,
            items=[
                InvoiceItem(description='HQ Charging Hub - 4,876 kWh', amount=685.68),
                InvoiceItem(description='Downtown Depot - 2,365 kWh', amount=332.68),
                InvoiceItem(description='West Distribution Center - 748 kWh', amount=105.20)
            ],
            customer='GreenFleet Corp',
            due_date='2024-06-14'
        )
    ]

def get_mock_reimbursements() -> List[ReimbursementRequest]:
    return [
        ReimbursementRequest(
            id='REIMB-2024-048',
            employee='John Smith',
            employee_id='EMP-234',
            department='Delivery Operations',
            date='2024-05-20',
            amount='$37.50',
            status='Approved',
            approved_by='Sarah Johnson',
            approved_date='2024-05-22',
            description='Charging at third-party station during client visit',
            location='ElectroCharge, 456 Main St, Bellevue, WA',
            vehicle='Tesla Model Y (Fleet #723)'
        ),
        ReimbursementRequest(
            id='REIMB-2024-045',
            employee='Sarah Johnson',
            employee_id='EMP-146',
            department='Field Services',
            date='2024-05-18',
            amount='$42.25',
            status='Review',
            description='Emergency charging during delivery route',
            location='QuickCharge Station, 789 Oak Ave, Seattle, WA',
            vehicle='Ford F-150 Lightning (Fleet #156)'
        )
    ]

@router.get("/summary", response_model=List[BillingSummary])
async def get_billing_summary():
    """Get billing summary statistics"""
    return [
        BillingSummary(
            label="Monthly Average",
            value="$1,256.32",
            change="+3.2%",
            previous_value="$1,217.36"
        ),
        BillingSummary(
            label="YTD Total",
            value="$6,245.89",
            change="-5.1%",
            previous_value="$6,581.12 (same period last year)"
        ),
        BillingSummary(
            label="Cost per kWh",
            value="$0.142",
            change="-8.3%",
            previous_value="$0.155"
        ),
        BillingSummary(
            label="Pending Invoices",
            value="$1,123.56",
            due_date="Due in 10 days"
        )
    ]

@router.get("/invoices", response_model=List[Invoice])
async def get_invoices(
    timeframe: Optional[str] = Query("3months", description="Timeframe for invoices"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: Optional[int] = Query(10, description="Number of invoices to return")
):
    """Get invoices with optional filtering"""
    invoices = get_mock_invoices()
    
    if status:
        invoices = [inv for inv in invoices if inv.status.lower() == status.lower()]
    
    return invoices[:limit]

@router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str):
    """Get a specific invoice by ID"""
    invoices = get_mock_invoices()
    for invoice in invoices:
        if invoice.id == invoice_id:
            return invoice
    raise HTTPException(status_code=404, detail="Invoice not found")

@router.get("/reimbursements", response_model=List[ReimbursementRequest])
async def get_reimbursements(
    status: Optional[str] = Query(None, description="Filter by status"),
    employee_id: Optional[str] = Query(None, description="Filter by employee"),
    limit: Optional[int] = Query(10, description="Number of requests to return")
):
    """Get reimbursement requests with optional filtering"""
    reimbursements = get_mock_reimbursements()
    
    if status:
        reimbursements = [r for r in reimbursements if r.status.lower() == status.lower()]
    
    if employee_id:
        reimbursements = [r for r in reimbursements if r.employee_id == employee_id]
    
    return reimbursements[:limit]

@router.get("/reimbursements/{request_id}", response_model=ReimbursementRequest)
async def get_reimbursement(request_id: str):
    """Get a specific reimbursement request by ID"""
    reimbursements = get_mock_reimbursements()
    for request in reimbursements:
        if request.id == request_id:
            return request
    raise HTTPException(status_code=404, detail="Reimbursement request not found")

@router.get("/payment-methods", response_model=List[PaymentMethod])
async def get_payment_methods():
    """Get available payment methods"""
    return [
        PaymentMethod(
            id=1,
            type="Corporate Card",
            details="Visa •••• •••• •••• 3845",
            expiry_date="11/25",
            cardholder_name="GreenFleet Corp",
            billing_address="123 Green Street, Seattle, WA 98101",
            is_primary=True,
            last_used="2024-05-16"
        ),
        PaymentMethod(
            id=2,
            type="Bank Account",
            details="First National Bank - •••••6712",
            cardholder_name="GreenFleet Operations",
            expiry_date=None,
            is_primary=False,
            last_used="2024-05-03"
        )
    ]

@router.get("/usage/current-month", response_model=UsageStats)
async def get_current_month_usage():
    """Get current month usage statistics"""
    return UsageStats(
        total_consumption="13,120 kWh",
        estimated_cost="$1,862.56",
        active_locations=3,
        peak_demand="124 kW",
        off_peak_percentage="68%",
        cost_savings="$214.38 (through off-peak charging)"
    )

@router.get("/payment-breakdown", response_model=PaymentBreakdown)
async def get_payment_breakdown():
    """Get payment breakdown analytics"""
    return PaymentBreakdown(
        total_paid="$3,579.15",
        by_location=[
            {"name": "HQ Charging Hub", "amount": "$2,180.99", "percentage": 61},
            {"name": "Downtown Depot", "amount": "$1,089.93", "percentage": 30},
            {"name": "West Distribution Center", "amount": "$308.23", "percentage": 9}
        ],
        by_time_of_use=[
            {"name": "Off-Peak (9PM-6AM)", "amount": "$1,396.87", "percentage": 39},
            {"name": "Mid-Peak (6AM-12PM, 7PM-9PM)", "amount": "$1,218.91", "percentage": 34},
            {"name": "Peak (12PM-7PM)", "amount": "$963.37", "percentage": 27}
        ]
    )

@router.post("/invoices")
async def create_invoice(
    energy_usage: float,
    billing_period: str,
    customer_id: Optional[str] = None
):
    """Generate a new invoice"""
    # Calculate cost based on usage
    cost_per_kwh = 0.142
    total_amount = energy_usage * cost_per_kwh
    
    invoice_id = f"INV-2024-{uuid.uuid4().hex[:4].upper()}"
    
    return {
        "id": invoice_id,
        "amount": f"${total_amount:.2f}",
        "energy_usage": f"{energy_usage} kWh",
        "billing_period": billing_period,
        "status": "Generated",
        "created_at": datetime.now().isoformat()
    }

@router.post("/reimbursements")
async def create_reimbursement_request(
    employee_id: str,
    amount: float,
    description: str,
    location: str,
    vehicle: str,
    receipt_url: Optional[str] = None
):
    """Create a new reimbursement request"""
    request_id = f"REIMB-2024-{uuid.uuid4().hex[:3].upper()}"
    
    return {
        "id": request_id,
        "employee_id": employee_id,
        "amount": f"${amount:.2f}",
        "description": description,
        "location": location,
        "vehicle": vehicle,
        "status": "Submitted",
        "created_at": datetime.now().isoformat()
    }

@router.put("/reimbursements/{request_id}/approve")
async def approve_reimbursement(request_id: str, approver_id: str):
    """Approve a reimbursement request"""
    return {
        "id": request_id,
        "status": "Approved",
        "approved_by": approver_id,
        "approved_at": datetime.now().isoformat()
    }

@router.get("/analytics/cost-trends")
async def get_cost_trends(
    period: str = Query("6months", description="Time period for trends")
):
    """Get cost trend analytics"""
    # Mock trend data
    return {
        "period": period,
        "total_cost": "$7,453.21",
        "average_monthly": "$1,242.20",
        "trend": "decreasing",
        "cost_per_kwh_trend": [
            {"month": "2024-01", "cost": 0.158},
            {"month": "2024-02", "cost": 0.152},
            {"month": "2024-03", "cost": 0.147},
            {"month": "2024-04", "cost": 0.145},
            {"month": "2024-05", "cost": 0.142},
            {"month": "2024-06", "cost": 0.139}
        ],
        "savings_opportunities": [
            {"category": "Off-peak charging optimization", "potential_savings": "$185.42"},
            {"category": "Bulk energy contracts", "potential_savings": "$247.18"},
            {"category": "Demand charge management", "potential_savings": "$156.89"}
        ]
    } 