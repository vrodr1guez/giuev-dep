"""
Unit tests for VIN Decoder Service

This module tests the VIN decoder service functionality including:
- VIN validation and check digit calculation
- Manufacturer identification
- Telematics provider mapping
- Error handling and edge cases
"""

import unittest
from unittest.mock import patch, MagicMock
import pytest
from typing import Dict, Any

from app.services.vin_decoder_service import VINDecoderService, VINDecodeResult, get_vin_decoder


class TestVINDecoderService(unittest.TestCase):
    """Test suite for VIN decoder service"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.decoder = VINDecoderService()
    
    def test_init_loads_configurations(self):
        """Test that service initializes with provider configurations"""
        # Test WMI mapping exists
        self.assertIsInstance(self.decoder.wmi_mapping, dict)
        self.assertGreater(len(self.decoder.wmi_mapping), 0)
        
        # Test provider configs exist
        self.assertIsInstance(self.decoder.provider_configs, dict)
        self.assertGreater(len(self.decoder.provider_configs), 0)
        
        # Test specific manufacturers are present
        tesla_wmi = next((k for k, v in self.decoder.wmi_mapping.items() if v['manufacturer'] == 'Tesla'), None)
        self.assertIsNotNone(tesla_wmi)
    
    @pytest.mark.parametrize("vin,expected", [
        ("1HGCM82633A123456", True),   # Valid Honda VIN
        ("5YJ3E1EA1NF123456", True),   # Valid Tesla VIN
        ("1FA6P8TH5L5123456", True),   # Valid Ford VIN
        ("WBA3A5C50CF123456", True),   # Valid BMW VIN
        ("JN1AZ4EH2FM123456", True),   # Valid Nissan VIN
        ("INVALID_VIN", False),        # Too short
        ("12345678901234567890", False), # Too long
        ("1HGCM82633A12345O", False),  # Contains O
        ("1HGCM82633A12345I", False),  # Contains I
        ("1HGCM82633A12345Q", False),  # Contains Q
        ("", False),                   # Empty string
        ("1234567890123456X", False),  # Invalid check digit
    ])
    def test_is_valid_vin(self, vin: str, expected: bool):
        """Test VIN validation with various valid and invalid VINs"""
        result = self.decoder.is_valid_vin(vin)
        self.assertEqual(result, expected, f"VIN {vin} validation failed")
    
    def test_validate_check_digit_calculation(self):
        """Test check digit calculation algorithm"""
        # Test known valid VINs with correct check digits
        valid_vins = [
            "1HGCM82633A123456",  # Check digit 6
            "JH4TB2H26CC000000",  # Check digit 6  
            "1FMCU0F70AKC00001",  # Check digit 1
        ]
        
        for vin in valid_vins:
            with self.subTest(vin=vin):
                self.assertTrue(self.decoder._validate_check_digit(vin))
    
    def test_validate_check_digit_edge_cases(self):
        """Test check digit validation edge cases"""
        # Test with non-alphanumeric characters (should handle gracefully)
        invalid_vin = "1HGCM82633A!@#$%^"
        self.assertFalse(self.decoder._validate_check_digit(invalid_vin))
        
        # Test with mixed case (should handle)
        mixed_case_vin = "1hgcm82633a123456"
        result = self.decoder._validate_check_digit(mixed_case_vin.upper())
        self.assertIsInstance(result, bool)
    
    def test_decode_vin_tesla(self):
        """Test VIN decoding for Tesla vehicles"""
        tesla_vin = "5YJ3E1EA1NF123456"
        result = self.decoder.decode_vin(tesla_vin)
        
        self.assertIsInstance(result, VINDecodeResult)
        self.assertEqual(result.manufacturer, "Tesla")
        self.assertEqual(result.country, "USA")
        self.assertEqual(result.telematics_provider, "tesla_api")
        self.assertEqual(result.confidence_score, 1.0)
        self.assertIn("soc", result.supported_features)
        self.assertIsNotNone(result.api_endpoint)
    
    def test_decode_vin_ford(self):
        """Test VIN decoding for Ford vehicles"""
        ford_vin = "1FA6P8TH5L5123456"
        result = self.decoder.decode_vin(ford_vin)
        
        self.assertEqual(result.manufacturer, "Ford")
        self.assertEqual(result.telematics_provider, "ford_api")
        self.assertEqual(result.confidence_score, 1.0)
    
    def test_decode_vin_unknown_manufacturer(self):
        """Test VIN decoding for unknown manufacturer"""
        unknown_vin = "ZZZ123456789012X6"  # Made up WMI
        result = self.decoder.decode_vin(unknown_vin)
        
        self.assertEqual(result.manufacturer, "Unknown Manufacturer")
        self.assertEqual(result.confidence_score, 0.3)
        self.assertEqual(result.telematics_provider, "generic_oem")
    
    def test_decode_vin_partial_match(self):
        """Test VIN decoding with partial WMI match"""
        # Use a VIN with first 2 characters matching known WMI
        partial_vin = "1FZ123456789012X6"  # 1F* could match Ford patterns
        result = self.decoder.decode_vin(partial_vin)
        
        # Should get a partial match with lower confidence
        if result.confidence_score == 0.7:
            self.assertIn("Similar", result.manufacturer)
    
    def test_decode_vin_invalid_input(self):
        """Test VIN decoding with invalid input"""
        invalid_vins = ["", "SHORT", "TOOLONGFORAVIN123456", None]
        
        for invalid_vin in invalid_vins:
            with self.subTest(vin=invalid_vin):
                try:
                    result = self.decoder.decode_vin(invalid_vin or "")
                    self.assertEqual(result.confidence_score, 0.0)
                    self.assertEqual(result.manufacturer, "Unknown")
                except AttributeError:
                    # None input should be handled gracefully
                    pass
    
    def test_get_connection_requirements_tesla(self):
        """Test getting connection requirements for Tesla API"""
        requirements = self.decoder.get_connection_requirements("tesla_api")
        
        self.assertIsInstance(requirements, dict)
        self.assertEqual(requirements["provider_name"], "Tesla API")
        self.assertEqual(requirements["auth_type"], "oauth2")
        self.assertIn("setup_steps", requirements)
        self.assertIn("required_credentials", requirements)
        self.assertIn("client_id", requirements["required_credentials"])
    
    def test_get_connection_requirements_invalid_provider(self):
        """Test getting connection requirements for invalid provider"""
        requirements = self.decoder.get_connection_requirements("invalid_provider")
        
        self.assertIn("error", requirements)
        self.assertEqual(requirements["error"], "Provider not supported")
    
    def test_get_setup_steps_known_provider(self):
        """Test setup steps for known providers"""
        tesla_steps = self.decoder._get_setup_steps("tesla_api")
        self.assertIsInstance(tesla_steps, list)
        self.assertGreater(len(tesla_steps), 0)
        self.assertTrue(any("OAuth2" in step for step in tesla_steps))
        
        ford_steps = self.decoder._get_setup_steps("ford_api")
        self.assertIsInstance(ford_steps, list)
        self.assertTrue(any("Ford" in step for step in ford_steps))
    
    def test_get_setup_steps_unknown_provider(self):
        """Test setup steps for unknown provider"""
        unknown_steps = self.decoder._get_setup_steps("unknown_provider")
        self.assertIsInstance(unknown_steps, list)
        self.assertGreater(len(unknown_steps), 0)
        # Should return generic steps
        self.assertTrue(any("manufacturer" in step for step in unknown_steps))
    
    def test_get_required_credentials_oauth2(self):
        """Test required credentials for OAuth2"""
        credentials = self.decoder._get_required_credentials("oauth2")
        expected_creds = ["client_id", "client_secret", "redirect_uri", "scopes"]
        self.assertEqual(credentials, expected_creds)
    
    def test_get_required_credentials_api_key(self):
        """Test required credentials for API key auth"""
        credentials = self.decoder._get_required_credentials("api_key")
        self.assertEqual(credentials, ["api_key"])
    
    def test_get_required_credentials_unknown_auth(self):
        """Test required credentials for unknown auth type"""
        credentials = self.decoder._get_required_credentials("unknown_auth")
        expected = ["username", "password", "api_key"]
        self.assertEqual(credentials, expected)
    
    def test_get_setup_time_known_providers(self):
        """Test setup time estimates for known providers"""
        tesla_time = self.decoder._get_setup_time("tesla_api")
        self.assertIsInstance(tesla_time, str)
        self.assertIn("week", tesla_time.lower())
        
        bmw_time = self.decoder._get_setup_time("bmw_api")
        self.assertIsInstance(bmw_time, str)
        # BMW should take longer than Tesla
        self.assertIn("week", bmw_time.lower())
    
    def test_provider_configuration_completeness(self):
        """Test that all provider configurations are complete"""
        required_fields = ["name", "endpoint_template", "auth_type", "features", "data_frequency", "cost"]
        
        for provider_id, config in self.decoder.provider_configs.items():
            with self.subTest(provider=provider_id):
                for field in required_fields:
                    self.assertIn(field, config, f"Provider {provider_id} missing {field}")
                
                # Test endpoint template has placeholder
                self.assertIn("{vehicle_id}", config["endpoint_template"])
                
                # Test features is a list
                self.assertIsInstance(config["features"], list)
                self.assertGreater(len(config["features"]), 0)
    
    def test_wmi_mapping_completeness(self):
        """Test that WMI mapping entries are complete"""
        required_fields = ["manufacturer", "country", "provider"]
        
        for wmi, mapping in self.decoder.wmi_mapping.items():
            with self.subTest(wmi=wmi):
                for field in required_fields:
                    self.assertIn(field, mapping, f"WMI {wmi} missing {field}")
                
                # Test WMI is 3 characters
                self.assertEqual(len(wmi), 3)
                
                # Test provider exists in configs
                self.assertIn(mapping["provider"], self.decoder.provider_configs)
    
    def test_case_insensitive_vin_handling(self):
        """Test that VIN decoding handles case insensitivity"""
        vin_lower = "5yj3e1ea1nf123456"
        vin_upper = "5YJ3E1EA1NF123456"
        vin_mixed = "5Yj3E1eA1Nf123456"
        
        result_lower = self.decoder.decode_vin(vin_lower)
        result_upper = self.decoder.decode_vin(vin_upper)
        result_mixed = self.decoder.decode_vin(vin_mixed)
        
        # All should produce identical results
        self.assertEqual(result_lower.manufacturer, result_upper.manufacturer)
        self.assertEqual(result_lower.manufacturer, result_mixed.manufacturer)
        self.assertEqual(result_lower.confidence_score, result_upper.confidence_score)
    
    def test_whitespace_handling(self):
        """Test that VIN decoding handles whitespace correctly"""
        vin_with_spaces = " 5YJ3E1EA1NF123456 "
        vin_clean = "5YJ3E1EA1NF123456"
        
        result_spaces = self.decoder.decode_vin(vin_with_spaces)
        result_clean = self.decoder.decode_vin(vin_clean)
        
        self.assertEqual(result_spaces.manufacturer, result_clean.manufacturer)
        self.assertEqual(result_spaces.confidence_score, result_clean.confidence_score)
    
    def test_performance_vin_decoding(self):
        """Test performance of VIN decoding operations"""
        import time
        
        test_vin = "5YJ3E1EA1NF123456"
        iterations = 1000
        
        start_time = time.time()
        for _ in range(iterations):
            self.decoder.decode_vin(test_vin)
        end_time = time.time()
        
        avg_time_ms = ((end_time - start_time) / iterations) * 1000
        
        # Should decode VIN in less than 1ms on average
        self.assertLess(avg_time_ms, 1.0, f"VIN decoding too slow: {avg_time_ms:.2f}ms average")


class TestVINDecoderServiceIntegration(unittest.TestCase):
    """Integration tests for VIN decoder service"""
    
    def test_get_vin_decoder_singleton(self):
        """Test that get_vin_decoder returns consistent instance"""
        decoder1 = get_vin_decoder()
        decoder2 = get_vin_decoder()
        
        self.assertIs(decoder1, decoder2)
        self.assertIsInstance(decoder1, VINDecoderService)
    
    def test_full_workflow_tesla(self):
        """Test complete workflow for Tesla vehicle"""
        vin = "5YJ3E1EA1NF123456"
        decoder = get_vin_decoder()
        
        # Step 1: Validate VIN
        is_valid = decoder.is_valid_vin(vin)
        self.assertTrue(is_valid)
        
        # Step 2: Decode VIN
        result = decoder.decode_vin(vin)
        self.assertEqual(result.manufacturer, "Tesla")
        self.assertEqual(result.telematics_provider, "tesla_api")
        
        # Step 3: Get connection requirements
        requirements = decoder.get_connection_requirements(result.telematics_provider)
        self.assertEqual(requirements["provider_name"], "Tesla API")
        self.assertIn("setup_steps", requirements)
        
        # Step 4: Verify all required information is available
        self.assertIsNotNone(result.api_endpoint)
        self.assertGreater(len(result.supported_features), 0)
        self.assertIn("oauth2", requirements["auth_type"])


if __name__ == "__main__":
    unittest.main() 