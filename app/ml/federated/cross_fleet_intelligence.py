"""
Cross-Fleet Intelligence Sharing System

Advanced federated learning system that enables knowledge sharing across
different vehicle fleets while preserving privacy and competitive advantages:

- Privacy-preserving knowledge distillation
- Fleet-specific insights aggregation  
- Competitive advantage protection
- Cross-modal pattern discovery
- Network effect amplification
"""

import numpy as np
import torch
import torch.nn as nn
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import logging
from pathlib import Path
import hashlib
import hmac
from enum import Enum
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FleetType(Enum):
    """Different types of vehicle fleets"""
    SCHOOL_BUS = "school_bus"
    DELIVERY = "delivery"
    TRANSIT = "transit"
    CORPORATE = "corporate"
    RIDE_SHARE = "ride_share"
    LOGISTICS = "logistics"
    EMERGENCY = "emergency"

class PrivacyLevel(Enum):
    """Privacy levels for cross-fleet sharing"""
    PUBLIC = "public"          # Fully shareable insights
    FEDERATED = "federated"    # Aggregated insights only
    PROTECTED = "protected"    # Fleet-specific competitive data
    CONFIDENTIAL = "confidential"  # No sharing

@dataclass
class FleetProfile:
    """Profile of a vehicle fleet participating in cross-fleet learning"""
    fleet_id: str
    fleet_type: FleetType
    organization: str
    vehicle_count: int
    operational_regions: List[str]
    privacy_preferences: Dict[str, PrivacyLevel]
    data_sharing_budget: float
    competitive_domains: Set[str] = field(default_factory=set)
    collaboration_score: float = 1.0

@dataclass
class SharedInsight:
    """Insight that can be shared across fleets"""
    insight_id: str
    source_fleet_type: FleetType
    insight_type: str
    data: Dict[str, Any]
    privacy_level: PrivacyLevel
    confidence_score: float
    validity_period: timedelta
    created_at: datetime
    access_control: Dict[str, bool] = field(default_factory=dict)

class CrossFleetIntelligenceEngine:
    """
    Cross-fleet intelligence sharing and aggregation system
    
    Enables fleets to share knowledge while protecting competitive advantages:
    - Differential privacy for sensitive data
    - Knowledge distillation for insight extraction
    - Privacy-preserving pattern matching
    - Fleet-specific optimization
    """
    
    def __init__(self, config_path: str = "config/cross_fleet.json"):
        self.config = self._load_config(config_path)
        self.fleet_profiles: Dict[str, FleetProfile] = {}
        self.shared_insights: Dict[str, SharedInsight] = {}
        self.cross_fleet_patterns: Dict[str, Any] = {}
        self.collaboration_matrix: np.ndarray = np.array([])
        self.privacy_budgets: Dict[str, float] = {}
        
        logger.info("Initialized Cross-Fleet Intelligence Engine")
        
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load cross-fleet intelligence configuration"""
        default_config = {
            "privacy": {
                "differential_privacy": {
                    "enabled": True,
                    "epsilon": 1.0,  # Privacy budget per insight
                    "delta": 1e-5
                },
                "k_anonymity": {
                    "enabled": True,
                    "k": 5  # Minimum fleet group size
                },
                "data_masking": {
                    "enabled": True,
                    "mask_threshold": 0.1
                }
            },
            "collaboration": {
                "trust_threshold": 0.7,
                "similarity_threshold": 0.3,
                "min_collaboration_score": 0.5
            },
            "insights": {
                "max_sharing_distance": 100.0,  # km
                "insight_validity_hours": 24,
                "confidence_threshold": 0.8,
                "aggregation_methods": ["weighted_average", "knowledge_distillation", "ensemble"]
            },
            "competitive_protection": {
                "enabled": True,
                "domain_separation": True,
                "advantage_preservation": 0.15  # 15% competitive advantage preservation
            }
        }
        
        config_file = Path(config_path)
        if config_file.exists():
            with open(config_file, 'r') as f:
                loaded_config = json.load(f)
                default_config.update(loaded_config)
        else:
            config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
                
        return default_config
    
    def register_fleet(self, fleet_profile: FleetProfile) -> Dict[str, Any]:
        """
        Register a fleet for cross-fleet intelligence sharing
        
        Args:
            fleet_profile: Profile of the fleet to register
            
        Returns:
            Registration confirmation with collaboration opportunities
        """
        # Store fleet profile
        self.fleet_profiles[fleet_profile.fleet_id] = fleet_profile
        
        # Initialize privacy budget
        self.privacy_budgets[fleet_profile.fleet_id] = fleet_profile.data_sharing_budget
        
        # Find collaboration opportunities
        collaboration_opportunities = self._find_collaboration_opportunities(fleet_profile)
        
        # Update collaboration matrix
        self._update_collaboration_matrix()
        
        logger.info(f"Registered fleet {fleet_profile.fleet_id} ({fleet_profile.fleet_type.value})")
        logger.info(f"Found {len(collaboration_opportunities)} collaboration opportunities")
        
        return {
            "fleet_id": fleet_profile.fleet_id,
            "status": "registered",
            "collaboration_opportunities": collaboration_opportunities,
            "available_insights": self._get_available_insights(fleet_profile),
            "privacy_budget": self.privacy_budgets[fleet_profile.fleet_id]
        }
    
    def _find_collaboration_opportunities(self, fleet_profile: FleetProfile) -> List[Dict[str, Any]]:
        """
        Find collaboration opportunities for a fleet
        
        Args:
            fleet_profile: Fleet profile to find opportunities for
            
        Returns:
            List of collaboration opportunities
        """
        opportunities = []
        
        for other_fleet_id, other_profile in self.fleet_profiles.items():
            if other_fleet_id == fleet_profile.fleet_id:
                continue
                
            # Calculate collaboration potential
            collaboration_score = self._calculate_collaboration_score(fleet_profile, other_profile)
            
            if collaboration_score >= self.config["collaboration"]["min_collaboration_score"]:
                # Find shared domains (non-competitive)
                shared_domains = self._find_shared_domains(fleet_profile, other_profile)
                
                if shared_domains:
                    opportunities.append({
                        "partner_fleet_id": other_fleet_id,
                        "partner_fleet_type": other_profile.fleet_type.value,
                        "collaboration_score": collaboration_score,
                        "shared_domains": shared_domains,
                        "potential_benefits": self._estimate_collaboration_benefits(
                            fleet_profile, other_profile, shared_domains
                        )
                    })
        
        # Sort by collaboration score
        opportunities.sort(key=lambda x: x["collaboration_score"], reverse=True)
        return opportunities
    
    def _calculate_collaboration_score(self, 
                                     fleet1: FleetProfile, 
                                     fleet2: FleetProfile) -> float:
        """
        Calculate collaboration potential between two fleets
        
        Args:
            fleet1: First fleet profile
            fleet2: Second fleet profile
            
        Returns:
            Collaboration score between 0 and 1
        """
        # Geographic overlap
        shared_regions = set(fleet1.operational_regions) & set(fleet2.operational_regions)
        geographic_score = len(shared_regions) / max(len(fleet1.operational_regions), 1)
        
        # Fleet type compatibility
        compatibility_matrix = {
            FleetType.SCHOOL_BUS: [FleetType.TRANSIT, FleetType.CORPORATE],
            FleetType.DELIVERY: [FleetType.LOGISTICS, FleetType.CORPORATE],
            FleetType.TRANSIT: [FleetType.SCHOOL_BUS, FleetType.CORPORATE],
            FleetType.CORPORATE: [FleetType.SCHOOL_BUS, FleetType.DELIVERY, FleetType.TRANSIT],
            FleetType.RIDE_SHARE: [FleetType.CORPORATE, FleetType.TRANSIT],
            FleetType.LOGISTICS: [FleetType.DELIVERY, FleetType.CORPORATE],
            FleetType.EMERGENCY: [FleetType.TRANSIT, FleetType.CORPORATE]
        }
        
        compatible_types = compatibility_matrix.get(fleet1.fleet_type, [])
        type_compatibility = 1.0 if fleet2.fleet_type in compatible_types else 0.3
        
        # Size compatibility (prefer similar-sized fleets)
        size_ratio = min(fleet1.vehicle_count, fleet2.vehicle_count) / max(fleet1.vehicle_count, fleet2.vehicle_count)
        size_score = 0.5 + 0.5 * size_ratio
        
        # Competitive domain overlap (negative factor)
        competitive_overlap = len(fleet1.competitive_domains & fleet2.competitive_domains)
        competitive_penalty = 0.1 * competitive_overlap
        
        # Combined score
        collaboration_score = (
            0.4 * geographic_score +
            0.3 * type_compatibility +
            0.2 * size_score +
            0.1 * min(fleet1.collaboration_score, fleet2.collaboration_score)
        ) - competitive_penalty
        
        return max(0, min(1, collaboration_score))
    
    def _find_shared_domains(self, fleet1: FleetProfile, fleet2: FleetProfile) -> List[str]:
        """
        Find domains where fleets can share knowledge without competitive conflict
        
        Args:
            fleet1: First fleet profile
            fleet2: Second fleet profile
            
        Returns:
            List of shared non-competitive domains
        """
        # All possible domains
        all_domains = {
            "battery_health", "charging_optimization", "route_efficiency",
            "maintenance_prediction", "energy_consumption", "weather_adaptation",
            "driver_behavior", "safety_monitoring", "cost_optimization",
            "environmental_impact", "grid_integration", "demand_forecasting"
        }
        
        # Exclude competitive domains
        competitive_domains = fleet1.competitive_domains | fleet2.competitive_domains
        shared_domains = list(all_domains - competitive_domains)
        
        # Filter based on privacy preferences
        filtered_domains = []
        for domain in shared_domains:
            privacy1 = fleet1.privacy_preferences.get(domain, PrivacyLevel.FEDERATED)
            privacy2 = fleet2.privacy_preferences.get(domain, PrivacyLevel.FEDERATED)
            
            # Only share if both fleets allow sharing
            if (privacy1 in [PrivacyLevel.PUBLIC, PrivacyLevel.FEDERATED] and
                privacy2 in [PrivacyLevel.PUBLIC, PrivacyLevel.FEDERATED]):
                filtered_domains.append(domain)
        
        return filtered_domains
    
    def _estimate_collaboration_benefits(self, 
                                       fleet1: FleetProfile, 
                                       fleet2: FleetProfile,
                                       shared_domains: List[str]) -> Dict[str, float]:
        """
        Estimate benefits from fleet collaboration
        
        Args:
            fleet1: First fleet profile
            fleet2: Second fleet profile
            shared_domains: Domains where collaboration is possible
            
        Returns:
            Estimated benefits in various categories
        """
        # Base benefits per domain
        domain_benefits = {
            "battery_health": 0.08,      # 8% improvement in battery life
            "charging_optimization": 0.12, # 12% improvement in charging efficiency
            "route_efficiency": 0.06,    # 6% improvement in route optimization
            "maintenance_prediction": 0.10, # 10% reduction in maintenance costs
            "energy_consumption": 0.07,  # 7% reduction in energy use
            "weather_adaptation": 0.04,  # 4% improvement in weather handling
            "driver_behavior": 0.05,     # 5% improvement in driver efficiency
            "safety_monitoring": 0.15,   # 15% improvement in safety
            "cost_optimization": 0.09,   # 9% cost reduction
            "environmental_impact": 0.06, # 6% emissions reduction
            "grid_integration": 0.08,    # 8% grid efficiency improvement
            "demand_forecasting": 0.11   # 11% demand prediction improvement
        }
        
        # Calculate network effects (more fleets = exponential benefits)
        total_vehicles = fleet1.vehicle_count + fleet2.vehicle_count
        network_multiplier = 1.0 + 0.1 * np.log(total_vehicles / 100)
        
        # Estimate total benefits
        total_benefit = sum(domain_benefits.get(domain, 0.05) for domain in shared_domains)
        total_benefit *= network_multiplier
        
        return {
            "efficiency_improvement": total_benefit * 0.4,
            "cost_reduction": total_benefit * 0.3,
            "safety_improvement": total_benefit * 0.2,
            "environmental_benefit": total_benefit * 0.1,
            "network_effect_multiplier": network_multiplier
        }
    
    def share_fleet_insights(self, 
                           fleet_id: str, 
                           insights: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Share insights from a fleet with the cross-fleet network
        
        Args:
            fleet_id: ID of the fleet sharing insights
            insights: List of insights to share
            
        Returns:
            Sharing confirmation and received insights
        """
        if fleet_id not in self.fleet_profiles:
            raise ValueError(f"Fleet {fleet_id} not registered")
            
        fleet_profile = self.fleet_profiles[fleet_id]
        shared_insights = []
        privacy_cost = 0.0
        
        for insight_data in insights:
            # Apply privacy protection
            protected_insight = self._apply_privacy_protection(insight_data, fleet_profile)
            
            # Create shared insight object
            shared_insight = SharedInsight(
                insight_id=self._generate_insight_id(insight_data),
                source_fleet_type=fleet_profile.fleet_type,
                insight_type=insight_data.get("type", "general"),
                data=protected_insight,
                privacy_level=PrivacyLevel(insight_data.get("privacy_level", "federated")),
                confidence_score=insight_data.get("confidence", 0.8),
                validity_period=timedelta(hours=self.config["insights"]["insight_validity_hours"]),
                created_at=datetime.now()
            )
            
            # Set access control
            shared_insight.access_control = self._determine_access_control(
                shared_insight, fleet_profile
            )
            
            # Store insight
            self.shared_insights[shared_insight.insight_id] = shared_insight
            shared_insights.append(shared_insight.insight_id)
            
            # Calculate privacy cost
            privacy_cost += self._calculate_privacy_cost(shared_insight)
            
        # Update privacy budget
        self.privacy_budgets[fleet_id] -= privacy_cost
        
        # Find relevant insights for this fleet
        relevant_insights = self._find_relevant_insights(fleet_profile)
        
        # Update cross-fleet patterns
        self._update_cross_fleet_patterns()
        
        logger.info(f"Fleet {fleet_id} shared {len(shared_insights)} insights")
        logger.info(f"Remaining privacy budget: {self.privacy_budgets[fleet_id]:.3f}")
        
        return {
            "shared_insights": shared_insights,
            "privacy_cost": privacy_cost,
            "remaining_budget": self.privacy_budgets[fleet_id],
            "relevant_insights": relevant_insights,
            "network_size": len(self.fleet_profiles),
            "total_insights": len(self.shared_insights)
        }
    
    def _apply_privacy_protection(self, 
                                insight_data: Dict[str, Any], 
                                fleet_profile: FleetProfile) -> Dict[str, Any]:
        """
        Apply privacy protection to insight data
        
        Args:
            insight_data: Original insight data
            fleet_profile: Profile of the sharing fleet
            
        Returns:
            Privacy-protected insight data
        """
        protected_data = insight_data.copy()
        
        # Apply differential privacy
        if self.config["privacy"]["differential_privacy"]["enabled"]:
            protected_data = self._apply_differential_privacy(protected_data)
        
        # Apply data masking for sensitive fields
        if self.config["privacy"]["data_masking"]["enabled"]:
            protected_data = self._apply_data_masking(protected_data)
        
        # Remove fleet-specific identifiers
        protected_data = self._remove_identifiers(protected_data)
        
        # Apply competitive advantage protection
        if self.config["competitive_protection"]["enabled"]:
            protected_data = self._protect_competitive_advantage(protected_data, fleet_profile)
        
        return protected_data
    
    def _apply_differential_privacy(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply differential privacy to numerical data"""
        epsilon = self.config["privacy"]["differential_privacy"]["epsilon"]
        
        protected_data = data.copy()
        
        for key, value in data.items():
            if isinstance(value, (int, float)):
                # Add Laplacian noise
                sensitivity = abs(value) * 0.1  # Assume 10% sensitivity
                noise = np.random.laplace(0, sensitivity / epsilon)
                protected_data[key] = value + noise
                
            elif isinstance(value, list) and all(isinstance(x, (int, float)) for x in value):
                # Add noise to numerical arrays
                sensitivity = np.std(value) if len(value) > 1 else 1.0
                noise = np.random.laplace(0, sensitivity / epsilon, len(value))
                protected_data[key] = [v + n for v, n in zip(value, noise)]
        
        return protected_data
    
    def _apply_data_masking(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply data masking to sensitive fields"""
        mask_threshold = self.config["privacy"]["data_masking"]["mask_threshold"]
        
        masked_data = data.copy()
        sensitive_fields = ["location", "route", "driver_id", "vehicle_id", "timestamp"]
        
        for field in sensitive_fields:
            if field in masked_data:
                if isinstance(masked_data[field], str):
                    # Hash sensitive strings
                    masked_data[field] = hashlib.sha256(
                        masked_data[field].encode()
                    ).hexdigest()[:8]
                elif isinstance(masked_data[field], list):
                    # Mask portion of list
                    mask_count = int(len(masked_data[field]) * mask_threshold)
                    indices_to_mask = np.random.choice(
                        len(masked_data[field]), mask_count, replace=False
                    )
                    for idx in indices_to_mask:
                        masked_data[field][idx] = "***"
        
        return masked_data
    
    def _remove_identifiers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove direct identifiers from data"""
        identifiers = ["fleet_id", "organization", "vehicle_vin", "driver_name", "exact_location"]
        
        cleaned_data = {k: v for k, v in data.items() if k not in identifiers}
        return cleaned_data
    
    def _protect_competitive_advantage(self, 
                                     data: Dict[str, Any], 
                                     fleet_profile: FleetProfile) -> Dict[str, Any]:
        """
        Protect competitive advantages by reducing precision of competitive data
        
        Args:
            data: Data to protect
            fleet_profile: Fleet profile with competitive domains
            
        Returns:
            Data with competitive advantages protected
        """
        advantage_preservation = self.config["competitive_protection"]["advantage_preservation"]
        
        protected_data = data.copy()
        
        # Reduce precision for competitive domains
        for domain in fleet_profile.competitive_domains:
            domain_fields = self._get_domain_fields(domain)
            
            for field in domain_fields:
                if field in protected_data:
                    if isinstance(protected_data[field], (int, float)):
                        # Reduce precision by adding noise
                        noise_scale = abs(protected_data[field]) * advantage_preservation
                        protected_data[field] += np.random.normal(0, noise_scale)
                    elif isinstance(protected_data[field], list):
                        # Reduce list precision
                        noise_scale = np.std(protected_data[field]) * advantage_preservation
                        noise = np.random.normal(0, noise_scale, len(protected_data[field]))
                        protected_data[field] = [v + n for v, n in zip(protected_data[field], noise)]
        
        return protected_data
    
    def _get_domain_fields(self, domain: str) -> List[str]:
        """Get fields associated with a competitive domain"""
        domain_field_mapping = {
            "battery_health": ["battery_voltage", "battery_temperature", "soc", "degradation_rate"],
            "charging_optimization": ["charging_power", "charging_time", "charging_cost"],
            "route_efficiency": ["route_distance", "travel_time", "fuel_efficiency"],
            "maintenance_prediction": ["maintenance_cost", "failure_prediction", "component_life"],
            "energy_consumption": ["energy_per_mile", "efficiency_score", "power_usage"],
            "driver_behavior": ["acceleration_pattern", "braking_pattern", "speed_profile"],
            "cost_optimization": ["operational_cost", "cost_per_mile", "total_cost"]
        }
        
        return domain_field_mapping.get(domain, [])
    
    def _generate_insight_id(self, insight_data: Dict[str, Any]) -> str:
        """Generate unique ID for an insight"""
        data_str = json.dumps(insight_data, sort_keys=True)
        timestamp = datetime.now().isoformat()
        combined = f"{data_str}_{timestamp}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def _determine_access_control(self, 
                                shared_insight: SharedInsight, 
                                fleet_profile: FleetProfile) -> Dict[str, bool]:
        """
        Determine which fleets can access a shared insight
        
        Args:
            shared_insight: The insight being shared
            fleet_profile: Profile of the sharing fleet
            
        Returns:
            Access control dictionary
        """
        access_control = {}
        
        for fleet_id, other_profile in self.fleet_profiles.items():
            if fleet_id == fleet_profile.fleet_id:
                access_control[fleet_id] = True  # Always allow access to own insights
                continue
            
            # Check collaboration score
            collaboration_score = self._calculate_collaboration_score(fleet_profile, other_profile)
            trust_threshold = self.config["collaboration"]["trust_threshold"]
            
            # Check domain compatibility
            insight_domain = shared_insight.insight_type
            domain_compatible = insight_domain not in other_profile.competitive_domains
            
            # Check privacy level
            privacy_compatible = shared_insight.privacy_level in [PrivacyLevel.PUBLIC, PrivacyLevel.FEDERATED]
            
            # Grant access if all conditions met
            access_control[fleet_id] = (
                collaboration_score >= trust_threshold and
                domain_compatible and
                privacy_compatible
            )
        
        return access_control
    
    def _calculate_privacy_cost(self, shared_insight: SharedInsight) -> float:
        """Calculate privacy budget cost for sharing an insight"""
        base_cost = 0.1  # Base privacy cost
        
        # Higher cost for more sensitive privacy levels
        privacy_multipliers = {
            PrivacyLevel.PUBLIC: 0.5,
            PrivacyLevel.FEDERATED: 1.0,
            PrivacyLevel.PROTECTED: 2.0,
            PrivacyLevel.CONFIDENTIAL: 5.0
        }
        
        privacy_cost = base_cost * privacy_multipliers.get(shared_insight.privacy_level, 1.0)
        
        # Adjust for confidence score (higher confidence = higher cost)
        confidence_multiplier = 0.5 + shared_insight.confidence_score
        
        return privacy_cost * confidence_multiplier
    
    def _find_relevant_insights(self, fleet_profile: FleetProfile) -> List[Dict[str, Any]]:
        """
        Find insights relevant to a specific fleet
        
        Args:
            fleet_profile: Fleet profile to find insights for
            
        Returns:
            List of relevant insights
        """
        relevant_insights = []
        current_time = datetime.now()
        
        for insight_id, insight in self.shared_insights.items():
            # Check if insight is still valid
            if current_time - insight.created_at > insight.validity_period:
                continue
            
            # Check access control
            if not insight.access_control.get(fleet_profile.fleet_id, False):
                continue
            
            # Check relevance based on fleet type and domains
            relevance_score = self._calculate_insight_relevance(insight, fleet_profile)
            
            if relevance_score >= 0.5:  # Minimum relevance threshold
                relevant_insights.append({
                    "insight_id": insight_id,
                    "insight_type": insight.insight_type,
                    "source_fleet_type": insight.source_fleet_type.value,
                    "confidence_score": insight.confidence_score,
                    "relevance_score": relevance_score,
                    "data": insight.data,
                    "created_at": insight.created_at.isoformat()
                })
        
        # Sort by relevance and confidence
        relevant_insights.sort(
            key=lambda x: x["relevance_score"] * x["confidence_score"], 
            reverse=True
        )
        
        return relevant_insights[:20]  # Return top 20 most relevant insights
    
    def _calculate_insight_relevance(self, 
                                   insight: SharedInsight, 
                                   fleet_profile: FleetProfile) -> float:
        """
        Calculate how relevant an insight is to a specific fleet
        
        Args:
            insight: The insight to evaluate
            fleet_profile: Fleet profile to calculate relevance for
            
        Returns:
            Relevance score between 0 and 1
        """
        relevance_score = 0.0
        
        # Fleet type similarity
        if insight.source_fleet_type == fleet_profile.fleet_type:
            relevance_score += 0.4  # High relevance for same fleet type
        else:
            # Check compatibility matrix
            compatible_types = {
                FleetType.SCHOOL_BUS: [FleetType.TRANSIT, FleetType.CORPORATE],
                FleetType.DELIVERY: [FleetType.LOGISTICS, FleetType.CORPORATE],
                FleetType.TRANSIT: [FleetType.SCHOOL_BUS, FleetType.CORPORATE],
                FleetType.CORPORATE: [FleetType.SCHOOL_BUS, FleetType.DELIVERY, FleetType.TRANSIT],
                FleetType.RIDE_SHARE: [FleetType.CORPORATE, FleetType.TRANSIT],
                FleetType.LOGISTICS: [FleetType.DELIVERY, FleetType.CORPORATE],
                FleetType.EMERGENCY: [FleetType.TRANSIT, FleetType.CORPORATE]
            }
            
            if insight.source_fleet_type in compatible_types.get(fleet_profile.fleet_type, []):
                relevance_score += 0.2
        
        # Domain relevance
        insight_domain = insight.insight_type
        if insight_domain not in fleet_profile.competitive_domains:
            relevance_score += 0.3
        
        # Privacy level compatibility
        privacy_compatibility = {
            PrivacyLevel.PUBLIC: 0.3,
            PrivacyLevel.FEDERATED: 0.2,
            PrivacyLevel.PROTECTED: 0.1,
            PrivacyLevel.CONFIDENTIAL: 0.0
        }
        relevance_score += privacy_compatibility.get(insight.privacy_level, 0.0)
        
        return min(1.0, relevance_score)
    
    def _update_collaboration_matrix(self):
        """Update the collaboration matrix between fleets"""
        fleet_ids = list(self.fleet_profiles.keys())
        n_fleets = len(fleet_ids)
        
        if n_fleets == 0:
            self.collaboration_matrix = np.array([])
            return
        
        collaboration_matrix = np.zeros((n_fleets, n_fleets))
        
        for i, fleet_id1 in enumerate(fleet_ids):
            for j, fleet_id2 in enumerate(fleet_ids):
                if i == j:
                    collaboration_matrix[i, j] = 1.0
                else:
                    collaboration_score = self._calculate_collaboration_score(
                        self.fleet_profiles[fleet_id1],
                        self.fleet_profiles[fleet_id2]
                    )
                    collaboration_matrix[i, j] = collaboration_score
        
        self.collaboration_matrix = collaboration_matrix
    
    def _update_cross_fleet_patterns(self):
        """Update cross-fleet patterns and insights"""
        if len(self.shared_insights) < 5:  # Need minimum insights for pattern detection
            return
        
        # Group insights by type
        insights_by_type = defaultdict(list)
        for insight in self.shared_insights.values():
            insights_by_type[insight.insight_type].append(insight)
        
        # Detect patterns within each type
        patterns = {}
        for insight_type, insights in insights_by_type.items():
            if len(insights) >= 3:  # Minimum for pattern detection
                pattern = self._detect_insight_patterns(insights)
                if pattern:
                    patterns[insight_type] = pattern
        
        self.cross_fleet_patterns = patterns
        logger.info(f"Updated cross-fleet patterns: {len(patterns)} patterns detected")
    
    def _detect_insight_patterns(self, insights: List[SharedInsight]) -> Optional[Dict[str, Any]]:
        """
        Detect patterns across similar insights
        
        Args:
            insights: List of similar insights
            
        Returns:
            Detected pattern or None
        """
        if len(insights) < 3:
            return None
        
        # Extract numerical values from insights
        numerical_data = []
        fleet_types = []
        confidence_scores = []
        
        for insight in insights:
            numerical_values = []
            for key, value in insight.data.items():
                if isinstance(value, (int, float)):
                    numerical_values.append(value)
            
            if numerical_values:
                numerical_data.append(numerical_values)
                fleet_types.append(insight.source_fleet_type)
                confidence_scores.append(insight.confidence_score)
        
        if len(numerical_data) < 3:
            return None
        
        # Calculate pattern statistics
        numerical_array = np.array(numerical_data)
        
        pattern = {
            "pattern_type": "cross_fleet_correlation",
            "fleet_types": list(set(fleet_types)),
            "sample_size": len(insights),
            "mean_values": np.mean(numerical_array, axis=0).tolist(),
            "std_values": np.std(numerical_array, axis=0).tolist(),
            "confidence": np.mean(confidence_scores),
            "detected_at": datetime.now().isoformat()
        }
        
        # Check for correlations between fleet types
        if len(set(fleet_types)) > 1:
            fleet_type_performance = defaultdict(list)
            for i, fleet_type in enumerate(fleet_types):
                fleet_type_performance[fleet_type].extend(numerical_data[i])
            
            # Calculate performance differences
            performance_comparison = {}
            fleet_type_list = list(fleet_type_performance.keys())
            for i, ft1 in enumerate(fleet_type_list):
                for ft2 in fleet_type_list[i+1:]:
                    perf1 = np.mean(fleet_type_performance[ft1])
                    perf2 = np.mean(fleet_type_performance[ft2])
                    performance_comparison[f"{ft1.value}_vs_{ft2.value}"] = {
                        "difference": perf1 - perf2,
                        "relative_improvement": (perf1 - perf2) / perf2 if perf2 != 0 else 0
                    }
            
            pattern["performance_comparison"] = performance_comparison
        
        return pattern
    
    def get_cross_fleet_insights(self, fleet_id: str) -> Dict[str, Any]:
        """
        Get comprehensive cross-fleet insights for a specific fleet
        
        Args:
            fleet_id: ID of the fleet requesting insights
            
        Returns:
            Comprehensive cross-fleet insights
        """
        if fleet_id not in self.fleet_profiles:
            raise ValueError(f"Fleet {fleet_id} not registered")
        
        fleet_profile = self.fleet_profiles[fleet_id]
        
        # Get relevant insights
        relevant_insights = self._find_relevant_insights(fleet_profile)
        
        # Get collaboration opportunities
        collaboration_opportunities = self._find_collaboration_opportunities(fleet_profile)
        
        # Get cross-fleet patterns
        applicable_patterns = {}
        for pattern_type, pattern in self.cross_fleet_patterns.items():
            if fleet_profile.fleet_type in [FleetType(ft) for ft in pattern.get("fleet_types", [])]:
                applicable_patterns[pattern_type] = pattern
        
        # Calculate network effects
        network_effects = self._calculate_network_effects(fleet_profile)
        
        return {
            "fleet_id": fleet_id,
            "network_size": len(self.fleet_profiles),
            "relevant_insights": relevant_insights,
            "collaboration_opportunities": collaboration_opportunities,
            "cross_fleet_patterns": applicable_patterns,
            "network_effects": network_effects,
            "privacy_budget_remaining": self.privacy_budgets.get(fleet_id, 0.0),
            "total_shared_insights": len(self.shared_insights),
            "generated_at": datetime.now().isoformat()
        }
    
    def _calculate_network_effects(self, fleet_profile: FleetProfile) -> Dict[str, Any]:
        """
        Calculate network effects for a fleet
        
        Args:
            fleet_profile: Fleet profile to calculate effects for
            
        Returns:
            Network effects analysis
        """
        total_fleets = len(self.fleet_profiles)
        total_vehicles = sum(fp.vehicle_count for fp in self.fleet_profiles.values())
        
        # Calculate potential network value
        network_value = 0.0
        for other_fleet_id, other_profile in self.fleet_profiles.items():
            if other_fleet_id != fleet_profile.fleet_id:
                collaboration_score = self._calculate_collaboration_score(fleet_profile, other_profile)
                shared_domains = len(self._find_shared_domains(fleet_profile, other_profile))
                network_value += collaboration_score * shared_domains * other_profile.vehicle_count
        
        # Metcalfe's law approximation for network effects
        metcalfe_value = total_fleets * (total_fleets - 1) / 2
        
        return {
            "total_network_fleets": total_fleets,
            "total_network_vehicles": total_vehicles,
            "potential_collaborations": len([fp for fp in self.fleet_profiles.values() 
                                           if self._calculate_collaboration_score(fleet_profile, fp) > 0.5]),
            "network_value_score": network_value,
            "metcalfe_network_effect": metcalfe_value,
            "estimated_benefit_multiplier": 1.0 + 0.1 * np.log(total_fleets) if total_fleets > 1 else 1.0
        }

# Demonstration and testing
async def demo_cross_fleet_intelligence():
    """Demonstrate cross-fleet intelligence sharing"""
    
    print("\n🌐 CROSS-FLEET INTELLIGENCE DEMO")
    print("=" * 60)
    
    # Initialize cross-fleet intelligence engine
    cf_engine = CrossFleetIntelligenceEngine()
    
    # Create sample fleet profiles
    fleet_profiles = [
        FleetProfile(
            fleet_id="lincoln_elementary",
            fleet_type=FleetType.SCHOOL_BUS,
            organization="Lincoln Elementary School District",
            vehicle_count=25,
            operational_regions=["Springfield", "Shelbyville"],
            privacy_preferences={
                "battery_health": PrivacyLevel.FEDERATED,
                "charging_optimization": PrivacyLevel.PUBLIC,
                "route_efficiency": PrivacyLevel.PROTECTED,
                "safety_monitoring": PrivacyLevel.PUBLIC
            },
            data_sharing_budget=5.0,
            competitive_domains={"route_efficiency"},
            collaboration_score=0.9
        ),
        FleetProfile(
            fleet_id="metro_delivery",
            fleet_type=FleetType.DELIVERY,
            organization="Metro Delivery Services",
            vehicle_count=50,
            operational_regions=["Springfield", "Capital City"],
            privacy_preferences={
                "charging_optimization": PrivacyLevel.FEDERATED,
                "energy_consumption": PrivacyLevel.PUBLIC,
                "maintenance_prediction": PrivacyLevel.FEDERATED,
                "cost_optimization": PrivacyLevel.PROTECTED
            },
            data_sharing_budget=7.5,
            competitive_domains={"cost_optimization", "route_efficiency"},
            collaboration_score=0.8
        ),
        FleetProfile(
            fleet_id="city_transit",
            fleet_type=FleetType.TRANSIT,
            organization="Springfield City Transit",
            vehicle_count=75,
            operational_regions=["Springfield"],
            privacy_preferences={
                "battery_health": PrivacyLevel.PUBLIC,
                "charging_optimization": PrivacyLevel.PUBLIC,
                "safety_monitoring": PrivacyLevel.PUBLIC,
                "environmental_impact": PrivacyLevel.PUBLIC
            },
            data_sharing_budget=10.0,
            competitive_domains=set(),  # Public transit, less competitive
            collaboration_score=1.0
        ),
        FleetProfile(
            fleet_id="green_logistics",
            fleet_type=FleetType.LOGISTICS,
            organization="Green Logistics Corp",
            vehicle_count=100,
            operational_regions=["Springfield", "Capital City", "Ogdenville"],
            privacy_preferences={
                "charging_optimization": PrivacyLevel.FEDERATED,
                "maintenance_prediction": PrivacyLevel.FEDERATED,
                "environmental_impact": PrivacyLevel.PUBLIC,
                "grid_integration": PrivacyLevel.FEDERATED
            },
            data_sharing_budget=12.0,
            competitive_domains={"maintenance_prediction", "cost_optimization"},
            collaboration_score=0.85
        )
    ]
    
    # Register fleets
    print("📝 Registering fleets...")
    registrations = {}
    for fleet_profile in fleet_profiles:
        registration = cf_engine.register_fleet(fleet_profile)
        registrations[fleet_profile.fleet_id] = registration
        print(f"✅ {fleet_profile.fleet_id}: {len(registration['collaboration_opportunities'])} collaborations found")
    
    # Simulate insight sharing
    print(f"\n🔄 Simulating cross-fleet insight sharing...")
    
    sample_insights = [
        # Lincoln Elementary insights
        {
            "type": "battery_health",
            "data": {
                "average_battery_life": 8.5,
                "degradation_rate": 0.02,
                "optimal_charging_temperature": 25.0,
                "performance_metrics": [95, 97, 92, 89, 94]
            },
            "confidence": 0.92,
            "privacy_level": "federated"
        },
        {
            "type": "safety_monitoring",
            "data": {
                "incident_reduction": 0.15,
                "safety_score": 98.5,
                "predictive_alerts": 45,
                "driver_training_effectiveness": 0.88
            },
            "confidence": 0.95,
            "privacy_level": "public"
        },
        # Metro Delivery insights  
        {
            "type": "charging_optimization",
            "data": {
                "optimal_charging_schedule": "off_peak",
                "energy_cost_reduction": 0.18,
                "charging_efficiency": 0.94,
                "grid_load_balancing": 0.12
            },
            "confidence": 0.89,
            "privacy_level": "federated"
        },
        # City Transit insights
        {
            "type": "environmental_impact",
            "data": {
                "emissions_reduction": 0.35,
                "energy_efficiency": 0.92,
                "carbon_footprint_reduction": 0.28,
                "renewable_energy_usage": 0.65
            },
            "confidence": 0.97,
            "privacy_level": "public"
        },
        # Green Logistics insights
        {
            "type": "grid_integration",
            "data": {
                "grid_stability_contribution": 0.08,
                "peak_demand_reduction": 0.15,
                "v2g_participation": 0.25,
                "grid_efficiency_improvement": 0.11
            },
            "confidence": 0.91,
            "privacy_level": "federated"
        }
    ]
    
    # Share insights from different fleets
    fleet_insight_map = {
        "lincoln_elementary": sample_insights[:2],
        "metro_delivery": sample_insights[2:3],
        "city_transit": sample_insights[3:4],
        "green_logistics": sample_insights[4:5]
    }
    
    sharing_results = {}
    for fleet_id, insights in fleet_insight_map.items():
        result = cf_engine.share_fleet_insights(fleet_id, insights)
        sharing_results[fleet_id] = result
        print(f"   📤 {fleet_id}: shared {len(result['shared_insights'])} insights")
        print(f"       Privacy cost: {result['privacy_cost']:.3f}")
        print(f"       Received: {len(result['relevant_insights'])} relevant insights")
    
    # Demonstrate cross-fleet insights
    print(f"\n🔍 Cross-Fleet Intelligence Analysis:")
    print("=" * 60)
    
    for fleet_id in registrations.keys():
        insights = cf_engine.get_cross_fleet_insights(fleet_id)
        
        print(f"\n📊 {fleet_id.upper()} INTELLIGENCE REPORT:")
        print(f"   Network Size: {insights['network_size']} fleets")
        print(f"   Relevant Insights: {len(insights['relevant_insights'])}")
        print(f"   Collaboration Opportunities: {len(insights['collaboration_opportunities'])}")
        print(f"   Cross-Fleet Patterns: {len(insights['cross_fleet_patterns'])}")
        print(f"   Network Effect Multiplier: {insights['network_effects']['estimated_benefit_multiplier']:.2f}x")
        
        # Show top collaboration opportunities
        if insights['collaboration_opportunities']:
            print(f"   🤝 Top Collaboration Partners:")
            for i, collab in enumerate(insights['collaboration_opportunities'][:2]):
                print(f"     {i+1}. {collab['partner_fleet_id']} (score: {collab['collaboration_score']:.2f})")
                print(f"        Shared domains: {collab['shared_domains']}")
        
        # Show network effects
        network_effects = insights['network_effects']
        print(f"   🌐 Network Analysis:")
        print(f"     Total vehicles in network: {network_effects['total_network_vehicles']}")
        print(f"     Potential collaborations: {network_effects['potential_collaborations']}")
        print(f"     Metcalfe network effect: {network_effects['metcalfe_network_effect']}")
    
    print(f"\n🎉 Cross-Fleet Intelligence Demo Complete!")
    print(f"🚀 Network effects and collaborative learning demonstrated!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(demo_cross_fleet_intelligence()) 