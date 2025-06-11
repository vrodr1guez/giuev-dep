import math
from typing import Tuple, List, Dict, Any, Optional

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    
    Args:
        lat1: Latitude of point 1
        lon1: Longitude of point 1
        lat2: Latitude of point 2
        lon2: Longitude of point 2
        
    Returns:
        Distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

def find_nearest_locations(latitude: float, longitude: float, 
                         locations: List[Dict[str, Any]], 
                         max_distance: Optional[float] = None,
                         limit: int = 10) -> List[Dict[str, Any]]:
    """
    Find the nearest locations from a list based on coordinates
    
    Args:
        latitude: Query point latitude
        longitude: Query point longitude
        locations: List of location dictionaries, each containing 'latitude' and 'longitude' keys
        max_distance: Maximum distance in kilometers (optional)
        limit: Maximum number of results to return
        
    Returns:
        List of locations with distances, sorted by proximity
    """
    # Calculate distances and add to locations
    for location in locations:
        location['distance'] = calculate_distance(
            latitude, longitude,
            location['latitude'], location['longitude']
        )
    
    # Filter by max distance if specified
    if max_distance is not None:
        locations = [loc for loc in locations if loc['distance'] <= max_distance]
    
    # Sort by distance
    locations.sort(key=lambda x: x['distance'])
    
    # Return top N results
    return locations[:limit]

def is_point_in_radius(latitude: float, longitude: float, 
                     center_lat: float, center_lon: float, 
                     radius_km: float) -> bool:
    """
    Check if a point is within a radius of another point
    
    Args:
        latitude: Point latitude to check
        longitude: Point longitude to check
        center_lat: Center point latitude
        center_lon: Center point longitude
        radius_km: Radius in kilometers
        
    Returns:
        True if point is within radius, False otherwise
    """
    distance = calculate_distance(latitude, longitude, center_lat, center_lon)
    return distance <= radius_km

def get_bounding_box(latitude: float, longitude: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Calculate a bounding box for a point with a given radius
    Useful for preliminary filtering in SQL queries before doing exact distance calculations
    
    Args:
        latitude: Center point latitude
        longitude: Center point longitude
        radius_km: Radius in kilometers
        
    Returns:
        Tuple of (min_lat, min_lon, max_lat, max_lon)
    """
    # Earth's radius in km
    earth_radius = 6371.0
    
    # Latitude: 1 deg ~ 110.574 km
    # Longitude: 1 deg ~ 111.320*cos(latitude) km
    lat_offset = radius_km / 110.574
    lon_offset = radius_km / (111.320 * math.cos(math.radians(latitude)))
    
    min_lat = latitude - lat_offset
    max_lat = latitude + lat_offset
    min_lon = longitude - lon_offset
    max_lon = longitude + lon_offset
    
    return (min_lat, min_lon, max_lat, max_lon) 