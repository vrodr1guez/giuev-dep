@router.get("/vehicles/{vehicle_id}/cell-monitoring")
async def get_enhanced_cell_monitoring(vehicle_id: str):
    """API endpoint showcasing 10x data granularity"""
    
    # Get all cell twins for the vehicle
    cell_twins = await cell_service.get_all_cell_twins(vehicle_id)
    
    enhanced_monitoring_data = {
        "vehicle_id": vehicle_id,
        "monitoring_frequency": "500ms",
        "data_points_per_second": len(cell_twins) * 30,  # 30 params per cell
        "competitor_comparison": {
            "industry_standard_points": 5,
            "our_data_points": len(cell_twins) * 30,
            "advantage_multiplier": (len(cell_twins) * 30) / 5
        },
        "cell_level_data": [
            {
                "cell_id": cell.id,
                "position": cell.position,
                "enhanced_metrics": await get_enhanced_cell_metrics(cell.id),
                "safety_status": await get_cell_safety_status(cell.id),
                "predictive_insights": await get_cell_predictions(cell.id)
            }
            for cell in cell_twins
        ],
        "fleet_insights": await get_fleet_level_insights(vehicle_id)
    }
    
    return enhanced_monitoring_data 