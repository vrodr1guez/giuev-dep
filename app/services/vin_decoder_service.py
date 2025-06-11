"""
VIN Decoder and Telematics Provider Mapping Service

Automatically identifies vehicle manufacturer from VIN and maps to appropriate 
telematics provider for seamless battery data integration.
"""

import re
import logging
from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class VINDecodeResult:
    """Result of VIN decoding with manufacturer and telematics info"""
    manufacturer: str
    country: str
    telematics_provider: Optional[str]
    api_endpoint: Optional[str]
    supported_features: List[str]
    confidence_score: float

class VINDecoderService:
    """Service for decoding VINs and mapping to telematics providers"""
    
    def __init__(self):
        # WMI (World Manufacturer Identifier) mapping
        self.wmi_mapping = {
            # Tesla
            '5YJ': {'manufacturer': 'Tesla', 'country': 'USA', 'provider': 'tesla_api'},
            '7SA': {'manufacturer': 'Tesla', 'country': 'Austria', 'provider': 'tesla_api'},
            'LRW': {'manufacturer': 'Tesla', 'country': 'China', 'provider': 'tesla_api'},
            
            # Ford
            '1FA': {'manufacturer': 'Ford', 'country': 'USA', 'provider': 'ford_api'},
            '1FM': {'manufacturer': 'Ford', 'country': 'USA', 'provider': 'ford_api'},
            '3FA': {'manufacturer': 'Ford', 'country': 'Mexico', 'provider': 'ford_api'},
            
            # General Motors
            '1G1': {'manufacturer': 'Chevrolet', 'country': 'USA', 'provider': 'gm_api'},
            '1G6': {'manufacturer': 'Cadillac', 'country': 'USA', 'provider': 'gm_api'},
            'KL8': {'manufacturer': 'Chevrolet', 'country': 'South Korea', 'provider': 'gm_api'},
            
            # BMW
            'WBA': {'manufacturer': 'BMW', 'country': 'Germany', 'provider': 'bmw_api'},
            'WBY': {'manufacturer': 'BMW', 'country': 'Germany', 'provider': 'bmw_api'},
            '5UX': {'manufacturer': 'BMW', 'country': 'USA', 'provider': 'bmw_api'},
            
            # Volkswagen Group
            'WVW': {'manufacturer': 'Volkswagen', 'country': 'Germany', 'provider': 'vw_api'},
            'WAU': {'manufacturer': 'Audi', 'country': 'Germany', 'provider': 'vw_api'},
            'WP0': {'manufacturer': 'Porsche', 'country': 'Germany', 'provider': 'vw_api'},
            
            # Nissan
            '1N4': {'manufacturer': 'Nissan', 'country': 'USA', 'provider': 'nissan_api'},
            'JN1': {'manufacturer': 'Nissan', 'country': 'Japan', 'provider': 'nissan_api'},
            'JN8': {'manufacturer': 'Nissan', 'country': 'Japan', 'provider': 'nissan_api'},
            
            # Hyundai/Kia
            'KMH': {'manufacturer': 'Hyundai', 'country': 'South Korea', 'provider': 'hyundai_api'},
            'KNM': {'manufacturer': 'Kia', 'country': 'South Korea', 'provider': 'hyundai_api'},
            'KNA': {'manufacturer': 'Kia', 'country': 'South Korea', 'provider': 'hyundai_api'},
            
            # Mercedes-Benz
            'WDD': {'manufacturer': 'Mercedes-Benz', 'country': 'Germany', 'provider': 'mercedes_api'},
            '4JG': {'manufacturer': 'Mercedes-Benz', 'country': 'USA', 'provider': 'mercedes_api'},
            
            # Stellantis (Chrysler, Jeep, Ram, Fiat)
            '1C3': {'manufacturer': 'Chrysler', 'country': 'USA', 'provider': 'stellantis_api'},
            '1C4': {'manufacturer': 'Jeep', 'country': 'USA', 'provider': 'stellantis_api'},
            '3C4': {'manufacturer': 'Ram', 'country': 'USA', 'provider': 'stellantis_api'},
        }
        
        # Telematics provider configurations
        self.provider_configs = {
            'tesla_api': {
                'name': 'Tesla API',
                'endpoint_template': 'https://owner-api.teslamotors.com/api/1/vehicles/{vehicle_id}/vehicle_data',
                'auth_type': 'oauth2',
                'features': ['soc', 'soh', 'location', 'charging_status', 'climate', 'range'],
                'data_frequency': 'real_time',
                'cost': 'free'
            },
            'ford_api': {
                'name': 'FordPass Connect',
                'endpoint_template': 'https://api.mps.ford.com/api/fordconnect/vehicles/v1/{vehicle_id}/status',
                'auth_type': 'oauth2',
                'features': ['soc', 'location', 'charging_status', 'range', 'odometer'],
                'data_frequency': 'every_15_min',
                'cost': 'free'
            },
            'gm_api': {
                'name': 'OnStar API',
                'endpoint_template': 'https://api.gm.com/v1/account/vehicles/{vehicle_id}/commands/diagnostics',
                'auth_type': 'oauth2',
                'features': ['soc', 'location', 'charging_status', 'diagnostics'],
                'data_frequency': 'on_demand',
                'cost': 'subscription'
            },
            'bmw_api': {
                'name': 'BMW ConnectedDrive',
                'endpoint_template': 'https://b2vapi.bmwgroup.com/webapi/v1/user/vehicles/{vehicle_id}/status',
                'auth_type': 'oauth2',
                'features': ['soc', 'soh', 'location', 'charging_status', 'range', 'efficiency'],
                'data_frequency': 'every_hour',
                'cost': 'premium'
            },
            'vw_api': {
                'name': 'Volkswagen We Connect',
                'endpoint_template': 'https://msg.volkswagen.de/fs-car/bs/vsr/v1/{brand}/vehicles/{vehicle_id}/status',
                'auth_type': 'oauth2',
                'features': ['soc', 'location', 'charging_status', 'range', 'climatisation'],
                'data_frequency': 'every_30_min',
                'cost': 'free_basic'
            },
            'nissan_api': {
                'name': 'NissanConnect',
                'endpoint_template': 'https://icm-api.nissan.com/v1/vehicles/{vehicle_id}/battery-status',
                'auth_type': 'oauth2',
                'features': ['soc', 'charging_status', 'range', 'climate_control'],
                'data_frequency': 'on_demand',
                'cost': 'free'
            },
            'hyundai_api': {
                'name': 'Hyundai Bluelink / Kia UVO',
                'endpoint_template': 'https://api.hyundaiusa.com/v2/vehicles/{vehicle_id}/status',
                'auth_type': 'oauth2',
                'features': ['soc', 'location', 'charging_status', 'range', 'climate'],
                'data_frequency': 'every_hour',
                'cost': 'subscription'
            },
            'mercedes_api': {
                'name': 'Mercedes me connect',
                'endpoint_template': 'https://api.mercedes-benz.com/vehicledata/v2/vehicles/{vehicle_id}/containers/electricvehicle',
                'auth_type': 'oauth2',
                'features': ['soc', 'soh', 'location', 'charging_status', 'range', 'pre_conditioning'],
                'data_frequency': 'real_time',
                'cost': 'premium'
            },
            'stellantis_api': {
                'name': 'Uconnect Services',
                'endpoint_template': 'https://channels.stellantisiot.com/v4/accounts/vehicles/{vehicle_id}/status',
                'auth_type': 'oauth2',
                'features': ['soc', 'location', 'charging_status', 'diagnostics'],
                'data_frequency': 'every_15_min',
                'cost': 'subscription'
            }
        }
    
    def is_valid_vin(self, vin: str) -> bool:
        """Validate VIN format and check digit"""
        if not vin or len(vin) != 17:
            return False
        
        # Check for invalid characters (I, O, Q are not allowed)
        if re.search(r'[IOQ]', vin.upper()):
            return False
        
        # Validate check digit (9th position)
        return self._validate_check_digit(vin.upper())
    
    def _validate_check_digit(self, vin: str) -> bool:
        """Validate VIN check digit (simplified validation)"""
        # VIN validation weights
        weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
        
        # Character to number mapping
        char_map = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9, 'S': 2,
            'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
        }
        
        try:
            total = 0
            for i, char in enumerate(vin):
                if char.isdigit():
                    value = int(char)
                else:
                    value = char_map.get(char, 0)
                total += value * weights[i]
            
            remainder = total % 11
            check_digit = 'X' if remainder == 10 else str(remainder)
            
            return vin[8] == check_digit
        except:
            return False
    
    def decode_vin(self, vin: str) -> VINDecodeResult:
        """Decode VIN and return manufacturer and telematics provider info"""
        vin = vin.upper().strip()
        
        if not self.is_valid_vin(vin):
            return VINDecodeResult(
                manufacturer="Unknown",
                country="Unknown", 
                telematics_provider=None,
                api_endpoint=None,
                supported_features=[],
                confidence_score=0.0
            )
        
        # Extract WMI (first 3 characters)
        wmi = vin[:3]
        
        # Try exact match first
        wmi_info = self.wmi_mapping.get(wmi)
        if wmi_info:
            provider_config = self.provider_configs.get(wmi_info['provider'], {})
            return VINDecodeResult(
                manufacturer=wmi_info['manufacturer'],
                country=wmi_info['country'],
                telematics_provider=wmi_info['provider'],
                api_endpoint=provider_config.get('endpoint_template'),
                supported_features=provider_config.get('features', []),
                confidence_score=1.0
            )
        
        # Try partial matches for unknown WMIs
        for known_wmi, info in self.wmi_mapping.items():
            if wmi.startswith(known_wmi[:2]):  # Match first 2 characters
                provider_config = self.provider_configs.get(info['provider'], {})
                return VINDecodeResult(
                    manufacturer=info['manufacturer'] + " (Similar)",
                    country=info['country'],
                    telematics_provider=info['provider'],
                    api_endpoint=provider_config.get('endpoint_template'),
                    supported_features=provider_config.get('features', []),
                    confidence_score=0.7
                )
        
        # No match found
        return VINDecodeResult(
            manufacturer="Unknown Manufacturer",
            country="Unknown",
            telematics_provider='generic_oem',
            api_endpoint=self.provider_configs.get('generic_oem', {}).get('endpoint_template'),
            supported_features=['basic_telemetry'],
            confidence_score=0.3
        )
    
    def get_connection_requirements(self, provider: str) -> Dict[str, any]:
        """Get requirements to connect to a specific telematics provider"""
        if provider not in self.provider_configs:
            return {"error": "Provider not supported"}
        
        config = self.provider_configs[provider]
        
        return {
            "provider_name": config['name'],
            "auth_type": config['auth_type'],
            "setup_steps": self._get_setup_steps(provider),
            "required_credentials": self._get_required_credentials(config['auth_type']),
            "supported_features": config['features'],
            "data_frequency": config['data_frequency'],
            "cost": config['cost'],
            "estimated_setup_time": self._get_setup_time(provider)
        }
    
    def _get_setup_steps(self, provider: str) -> List[str]:
        """Get setup steps for each provider"""
        steps_map = {
            'tesla_api': [
                "1. Create Tesla developer account",
                "2. Register your application",
                "3. Obtain OAuth2 client credentials",
                "4. Implement OAuth2 flow for user consent",
                "5. Exchange tokens for vehicle access"
            ],
            'ford_api': [
                "1. Join Ford Developer Program",
                "2. Create FordPass Connect app",
                "3. Get API key and secret",
                "4. Implement FordPass user authorization",
                "5. Test with Ford-approved VINs"
            ],
            'gm_api': [
                "1. Apply for OnStar API access",
                "2. Complete business verification",
                "3. Sign usage agreements",
                "4. Obtain production credentials",
                "5. Implement real-time data streaming"
            ],
            'bmw_api': [
                "1. Register with BMW ConnectedDrive",
                "2. Submit application for commercial use",
                "3. Complete technical integration",
                "4. Pass security audit",
                "5. Go live with approved vehicles"
            ]
        }
        
        return steps_map.get(provider, [
            "1. Contact manufacturer for API access",
            "2. Complete registration process",
            "3. Obtain required credentials",
            "4. Implement OAuth2 integration",
            "5. Test and validate connection"
        ])
    
    def _get_required_credentials(self, auth_type: str) -> List[str]:
        """Get required credentials based on auth type"""
        if auth_type == 'oauth2':
            return ['client_id', 'client_secret', 'redirect_uri', 'scopes']
        elif auth_type == 'api_key':
            return ['api_key']
        elif auth_type == 'bearer_token':
            return ['access_token', 'refresh_token']
        else:
            return ['username', 'password', 'api_key']
    
    def _get_setup_time(self, provider: str) -> str:
        """Get estimated setup time for each provider"""
        time_map = {
            'tesla_api': '2-4 weeks',
            'ford_api': '3-6 weeks', 
            'gm_api': '4-8 weeks',
            'bmw_api': '6-12 weeks',
            'vw_api': '4-8 weeks',
            'nissan_api': '2-4 weeks',
            'hyundai_api': '4-6 weeks',
            'mercedes_api': '6-10 weeks',
            'stellantis_api': '4-8 weeks'
        }
        
        return time_map.get(provider, '4-8 weeks')

# Global instance
vin_decoder_service = VINDecoderService()

def get_vin_decoder() -> VINDecoderService:
    """Get the VIN decoder service instance"""
    return vin_decoder_service 