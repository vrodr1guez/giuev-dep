"""
ML-Based Threat Detection System for GIU EV Charging Infrastructure

This module implements advanced threat detection using machine learning algorithms
to identify security anomalies, unauthorized access patterns, and potential threats
in real-time across the EV charging infrastructure.

Features:
- ML-based anomaly detection for security events
- Real-time threat pattern recognition
- User behavior analysis
- Network intrusion detection
- API abuse detection
- Automated threat scoring and classification
"""

import asyncio
import time
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from pathlib import Path

# ML imports with fallbacks - numpy and pandas first
try:
    import numpy as np
    import pandas as pd
    NUMPY_AVAILABLE = True
except ImportError:
    print("⚠️  Numpy/Pandas not available - using Python stdlib fallbacks")
    NUMPY_AVAILABLE = False
    
    # Create numpy fallbacks
    class MockNumpy:
        @staticmethod
        def array(data):
            return data
        @staticmethod
        def mean(data):
            return sum(data) / len(data) if data else 0
        @staticmethod
        def random():
            import random
            class MockRandom:
                @staticmethod
                def choice(choices, size=1):
                    import random
                    return [random.choice(choices) for _ in range(size)]
                @staticmethod
                def uniform(low, high, size=1):
                    import random
                    return [random.uniform(low, high) for _ in range(size)]
            return MockRandom()
    
    np = MockNumpy()
    pd = None

# ML imports with fallbacks
try:
    from sklearn.ensemble import IsolationForest, RandomForestClassifier
    from sklearn.cluster import DBSCAN
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, confusion_matrix
    ML_AVAILABLE = True
except ImportError:
    print("⚠️  Scikit-learn not available - using fallback threat detection")
    ML_AVAILABLE = False
    
    # Create fallback classes
    class IsolationForest:
        def __init__(self, *args, **kwargs):
            pass
        def fit(self, X):
            pass
        def predict(self, X):
            if NUMPY_AVAILABLE:
                return np.random.choice([-1, 1], size=len(X))
            else:
                import random
                return [random.choice([-1, 1]) for _ in range(len(X))]
        def decision_function(self, X):
            if NUMPY_AVAILABLE:
                return np.random.uniform(-0.5, 0.5, size=len(X))
            else:
                import random
                return [random.uniform(-0.5, 0.5) for _ in range(len(X))]

try:
    import structlog
    STRUCTLOG_AVAILABLE = True
    logger = structlog.get_logger("threat_detection")
except ImportError:
    import logging
    STRUCTLOG_AVAILABLE = False
    logger = logging.getLogger("threat_detection")

class ThreatLevel(Enum):
    """Threat severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ThreatType(Enum):
    """Types of security threats"""
    AUTHENTICATION_ANOMALY = "authentication_anomaly"
    RATE_LIMIT_ABUSE = "rate_limit_abuse"
    DATA_EXFILTRATION = "data_exfiltration"
    INJECTION_ATTACK = "injection_attack"
    BRUTE_FORCE = "brute_force"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    NETWORK_INTRUSION = "network_intrusion"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    API_ABUSE = "api_abuse"
    ANOMALOUS_BEHAVIOR = "anomalous_behavior"

@dataclass
class SecurityEvent:
    """Security event data structure"""
    timestamp: datetime
    event_type: str
    source_ip: str
    user_id: Optional[str]
    endpoint: str
    method: str
    status_code: int
    user_agent: str
    request_size: int
    response_time: float
    headers: Dict[str, str]
    parameters: Dict[str, Any]
    session_id: Optional[str] = None
    geographic_location: Optional[str] = None
    device_fingerprint: Optional[str] = None

@dataclass
class ThreatDetection:
    """Threat detection result"""
    id: str
    timestamp: datetime
    threat_type: ThreatType
    threat_level: ThreatLevel
    confidence_score: float
    source_ip: str
    user_id: Optional[str]
    endpoint: str
    description: str
    evidence: Dict[str, Any]
    recommended_actions: List[str]
    ml_features: Dict[str, float]
    risk_score: float

class MLThreatDetector:
    """ML-based threat detection engine"""
    
    def __init__(
        self,
        model_path: Optional[Path] = None,
        training_data_path: Optional[Path] = None,
        anomaly_threshold: float = 0.1,
        min_training_samples: int = 1000
    ):
        self.model_path = model_path or Path("data/security/models")
        self.training_data_path = training_data_path or Path("data/security/training")
        self.anomaly_threshold = anomaly_threshold
        self.min_training_samples = min_training_samples
        
        # Initialize models
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        
        # Initialize feature extractors
        self.feature_extractors = {
            'temporal': self._extract_temporal_features,
            'behavioral': self._extract_behavioral_features,
            'network': self._extract_network_features,
            'request': self._extract_request_features
        }
        
        # Security patterns database
        self.known_patterns = self._load_known_patterns()
        
        # Initialize models
        self._initialize_models()
        
        logger.info("ML Threat Detector initialized")
    
    def _initialize_models(self):
        """Initialize ML models for threat detection"""
        if not ML_AVAILABLE:
            logger.warning("ML libraries not available, using fallback detection")
            return
        
        # Anomaly detection model
        self.models['anomaly'] = IsolationForest(
            contamination=self.anomaly_threshold,
            random_state=42,
            n_estimators=100
        )
        
        # Classification model for threat types
        self.models['classifier'] = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        
        # Clustering model for pattern discovery
        self.models['clustering'] = DBSCAN(
            eps=0.5,
            min_samples=5
        )
        
        # Feature scalers
        self.scalers['anomaly'] = StandardScaler()
        self.scalers['classifier'] = StandardScaler()
        
        # Load pre-trained models if available
        self._load_models()
    
    def _load_known_patterns(self) -> Dict[str, Any]:
        """Load known security threat patterns"""
        patterns = {
            'sql_injection': {
                'patterns': [
                    r"union\s+select",
                    r"drop\s+table",
                    r"exec\s*\(",
                    r"';\s*--",
                    r"1=1",
                    r"or\s+1=1"
                ],
                'severity': ThreatLevel.HIGH
            },
            'xss': {
                'patterns': [
                    r"<script.*?>",
                    r"javascript:",
                    r"onerror\s*=",
                    r"onload\s*=",
                    r"alert\s*\(",
                    r"document\.cookie"
                ],
                'severity': ThreatLevel.MEDIUM
            },
            'directory_traversal': {
                'patterns': [
                    r"\.\./",
                    r"\.\.\\",
                    r"/etc/passwd",
                    r"c:\\windows",
                    r"boot\.ini"
                ],
                'severity': ThreatLevel.HIGH
            },
            'command_injection': {
                'patterns': [
                    r";\s*cat\s+",
                    r";\s*ls\s+",
                    r";\s*rm\s+",
                    r"&\s*type\s+",
                    r"\|\s*nc\s+"
                ],
                'severity': ThreatLevel.CRITICAL
            }
        }
        
        return patterns
    
    def _extract_temporal_features(self, event: SecurityEvent) -> Dict[str, float]:
        """Extract temporal features from security event"""
        features = {}
        
        # Time-based features
        features['hour_of_day'] = event.timestamp.hour
        features['day_of_week'] = event.timestamp.weekday()
        features['is_weekend'] = float(event.timestamp.weekday() >= 5)
        features['is_business_hours'] = float(9 <= event.timestamp.hour <= 17)
        features['is_night_time'] = float(event.timestamp.hour < 6 or event.timestamp.hour > 22)
        
        return features
    
    def _extract_behavioral_features(self, event: SecurityEvent, user_history: List[SecurityEvent]) -> Dict[str, float]:
        """Extract user behavioral features"""
        features = {}
        
        if not user_history:
            # Default values for new users
            features.update({
                'avg_requests_per_hour': 0.0,
                'unique_endpoints_accessed': 0.0,
                'avg_response_time': 0.0,
                'error_rate': 0.0,
                'geographic_consistency': 1.0,
                'device_consistency': 1.0
            })
            return features
        
        # Calculate behavioral metrics
        recent_events = [e for e in user_history if (event.timestamp - e.timestamp).total_seconds() < 3600]
        
        features['avg_requests_per_hour'] = len(recent_events)
        features['unique_endpoints_accessed'] = len(set(e.endpoint for e in recent_events))
        if NUMPY_AVAILABLE:
            features['avg_response_time'] = np.mean([e.response_time for e in recent_events]) if recent_events else 0.0
        else:
            features['avg_response_time'] = sum(e.response_time for e in recent_events) / len(recent_events) if recent_events else 0.0
        
        # Error rate
        error_events = [e for e in recent_events if e.status_code >= 400]
        features['error_rate'] = len(error_events) / max(len(recent_events), 1)
        
        # Geographic consistency
        locations = [e.geographic_location for e in user_history[-10:] if e.geographic_location]
        if locations:
            unique_locations = len(set(locations))
            features['geographic_consistency'] = 1.0 / max(unique_locations, 1)
        else:
            features['geographic_consistency'] = 1.0
        
        # Device consistency
        devices = [e.device_fingerprint for e in user_history[-10:] if e.device_fingerprint]
        if devices:
            unique_devices = len(set(devices))
            features['device_consistency'] = 1.0 / max(unique_devices, 1)
        else:
            features['device_consistency'] = 1.0
        
        return features
    
    def _extract_network_features(self, event: SecurityEvent) -> Dict[str, float]:
        """Extract network-level features"""
        features = {}
        
        # IP-based features
        ip_parts = event.source_ip.split('.')
        if len(ip_parts) == 4:
            try:
                features['ip_class_a'] = float(ip_parts[0])
                features['ip_class_b'] = float(ip_parts[1])
                features['is_private_ip'] = float(
                    ip_parts[0] in ['10', '172', '192'] or
                    (ip_parts[0] == '172' and 16 <= int(ip_parts[1]) <= 31) or
                    (ip_parts[0] == '192' and ip_parts[1] == '168')
                )
            except ValueError:
                features['ip_class_a'] = 0.0
                features['ip_class_b'] = 0.0
                features['is_private_ip'] = 0.0
        
        # User agent analysis
        ua = event.user_agent.lower()
        features['is_bot'] = float(any(bot in ua for bot in ['bot', 'crawler', 'spider', 'scraper']))
        features['is_mobile'] = float(any(mobile in ua for mobile in ['mobile', 'android', 'iphone']))
        features['is_browser'] = float(any(browser in ua for browser in ['chrome', 'firefox', 'safari', 'edge']))
        features['ua_length'] = float(len(event.user_agent))
        
        return features
    
    def _extract_request_features(self, event: SecurityEvent) -> Dict[str, float]:
        """Extract request-level features"""
        features = {}
        
        # HTTP method features
        methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
        for method in methods:
            features[f'method_{method.lower()}'] = float(event.method == method)
        
        # Status code features
        features['status_success'] = float(200 <= event.status_code < 300)
        features['status_client_error'] = float(400 <= event.status_code < 500)
        features['status_server_error'] = float(event.status_code >= 500)
        
        # Request characteristics
        features['request_size'] = float(event.request_size)
        features['response_time'] = float(event.response_time)
        features['endpoint_length'] = float(len(event.endpoint))
        
        # Content analysis
        endpoint_lower = event.endpoint.lower()
        features['has_admin_path'] = float('admin' in endpoint_lower)
        features['has_api_path'] = float('/api/' in endpoint_lower)
        features['has_suspicious_chars'] = float(any(char in event.endpoint for char in ['..', '<', '>', '\'', '"', ';']))
        
        # Parameter analysis
        if event.parameters:
            features['num_parameters'] = float(len(event.parameters))
            param_values = ' '.join(str(v) for v in event.parameters.values()).lower()
            features['has_script_in_params'] = float('script' in param_values)
            features['has_union_in_params'] = float('union' in param_values)
        else:
            features['num_parameters'] = 0.0
            features['has_script_in_params'] = 0.0
            features['has_union_in_params'] = 0.0
        
        return features
    
    def extract_features(self, event: SecurityEvent, user_history: List[SecurityEvent] = None) -> Dict[str, float]:
        """Extract comprehensive features from security event"""
        features = {}
        
        # Extract features from different categories
        for category, extractor in self.feature_extractors.items():
            if category == 'behavioral':
                category_features = extractor(event, user_history or [])
            else:
                category_features = extractor(event)
            
            # Add category prefix to avoid naming conflicts
            for key, value in category_features.items():
                features[f"{category}_{key}"] = value
        
        return features
    
    def detect_pattern_threats(self, event: SecurityEvent) -> List[ThreatDetection]:
        """Detect threats using pattern matching"""
        threats = []
        
        # Check request data for malicious patterns
        request_data = f"{event.endpoint} {json.dumps(event.parameters)} {event.user_agent}"
        
        for pattern_type, pattern_data in self.known_patterns.items():
            for pattern in pattern_data['patterns']:
                import re
                if re.search(pattern, request_data, re.IGNORECASE):
                    threat = ThreatDetection(
                        id=self._generate_threat_id(),
                        timestamp=datetime.now(),
                        threat_type=ThreatType.INJECTION_ATTACK if 'injection' in pattern_type else ThreatType.SUSPICIOUS_PATTERN,
                        threat_level=pattern_data['severity'],
                        confidence_score=0.9,
                        source_ip=event.source_ip,
                        user_id=event.user_id,
                        endpoint=event.endpoint,
                        description=f"Detected {pattern_type} pattern: {pattern}",
                        evidence={
                            'pattern_type': pattern_type,
                            'matched_pattern': pattern,
                            'request_data': request_data[:500]  # Truncate for storage
                        },
                        recommended_actions=[
                            "Block source IP temporarily",
                            "Review request logs",
                            "Validate input sanitization"
                        ],
                        ml_features={},
                        risk_score=0.8 if pattern_data['severity'] in [ThreatLevel.HIGH, ThreatLevel.CRITICAL] else 0.5
                    )
                    threats.append(threat)
        
        return threats
    
    def detect_ml_threats(self, event: SecurityEvent, user_history: List[SecurityEvent] = None) -> List[ThreatDetection]:
        """Detect threats using ML models"""
        threats = []
        
        if not ML_AVAILABLE:
            return threats
        
        try:
            # Extract features
            features = self.extract_features(event, user_history)
            feature_vector = np.array([list(features.values())]).reshape(1, -1)
            
            # Anomaly detection
            if 'anomaly' in self.models and hasattr(self.models['anomaly'], 'decision_function'):
                anomaly_score = self.models['anomaly'].decision_function(feature_vector)[0]
                
                if anomaly_score < -0.5:  # Threshold for anomaly
                    threat_level = ThreatLevel.HIGH if anomaly_score < -0.8 else ThreatLevel.MEDIUM
                    
                    threat = ThreatDetection(
                        id=self._generate_threat_id(),
                        timestamp=datetime.now(),
                        threat_type=ThreatType.ANOMALOUS_BEHAVIOR,
                        threat_level=threat_level,
                        confidence_score=min(abs(anomaly_score), 1.0),
                        source_ip=event.source_ip,
                        user_id=event.user_id,
                        endpoint=event.endpoint,
                        description=f"ML anomaly detected with score: {anomaly_score:.3f}",
                        evidence={
                            'anomaly_score': anomaly_score,
                            'features_analyzed': len(features),
                            'detection_method': 'isolation_forest'
                        },
                        recommended_actions=[
                            "Investigate user behavior patterns",
                            "Review recent activity",
                            "Consider temporary monitoring"
                        ],
                        ml_features=features,
                        risk_score=abs(anomaly_score)
                    )
                    threats.append(threat)
            
        except Exception as e:
            logger.error(f"Error in ML threat detection: {str(e)}")
        
        return threats
    
    def detect_rate_limit_abuse(self, event: SecurityEvent, recent_events: List[SecurityEvent]) -> List[ThreatDetection]:
        """Detect rate limit abuse and DDoS attempts"""
        threats = []
        
        # Check for rapid requests from same IP
        same_ip_events = [e for e in recent_events if e.source_ip == event.source_ip]
        
        if len(same_ip_events) > 50:  # More than 50 requests in recent window
            threat = ThreatDetection(
                id=self._generate_threat_id(),
                timestamp=datetime.now(),
                threat_type=ThreatType.RATE_LIMIT_ABUSE,
                threat_level=ThreatLevel.HIGH,
                confidence_score=0.95,
                source_ip=event.source_ip,
                user_id=event.user_id,
                endpoint=event.endpoint,
                description=f"Rate limit abuse detected: {len(same_ip_events)} requests in short timeframe",
                evidence={
                    'request_count': len(same_ip_events),
                    'time_window': '5 minutes',
                    'endpoints_hit': list(set(e.endpoint for e in same_ip_events))
                },
                recommended_actions=[
                    "Implement rate limiting",
                    "Block source IP",
                    "Review request patterns"
                ],
                ml_features={},
                risk_score=0.9
            )
            threats.append(threat)
        
        return threats
    
    def detect_brute_force(self, event: SecurityEvent, user_events: List[SecurityEvent]) -> List[ThreatDetection]:
        """Detect brute force attacks"""
        threats = []
        
        # Check for authentication failures
        auth_failures = [e for e in user_events if e.status_code == 401 or e.status_code == 403]
        
        if len(auth_failures) > 5:  # More than 5 auth failures
            threat = ThreatDetection(
                id=self._generate_threat_id(),
                timestamp=datetime.now(),
                threat_type=ThreatType.BRUTE_FORCE,
                threat_level=ThreatLevel.HIGH,
                confidence_score=0.85,
                source_ip=event.source_ip,
                user_id=event.user_id,
                endpoint=event.endpoint,
                description=f"Brute force attack detected: {len(auth_failures)} authentication failures",
                evidence={
                    'failure_count': len(auth_failures),
                    'failed_endpoints': list(set(e.endpoint for e in auth_failures)),
                    'time_span': str(max(e.timestamp for e in auth_failures) - min(e.timestamp for e in auth_failures))
                },
                recommended_actions=[
                    "Lock user account temporarily",
                    "Implement CAPTCHA",
                    "Block source IP",
                    "Review authentication logs"
                ],
                ml_features={},
                risk_score=0.85
            )
            threats.append(threat)
        
        return threats
    
    def analyze_event(
        self,
        event: SecurityEvent,
        user_history: List[SecurityEvent] = None,
        recent_events: List[SecurityEvent] = None
    ) -> List[ThreatDetection]:
        """Comprehensive threat analysis of security event"""
        threats = []
        
        # Pattern-based detection
        threats.extend(self.detect_pattern_threats(event))
        
        # ML-based detection
        threats.extend(self.detect_ml_threats(event, user_history))
        
        # Rate limit abuse detection
        if recent_events:
            threats.extend(self.detect_rate_limit_abuse(event, recent_events))
        
        # Brute force detection
        if user_history:
            threats.extend(self.detect_brute_force(event, user_history))
        
        return threats
    
    def train_models(self, training_events: List[SecurityEvent], threat_labels: List[bool]):
        """Train ML models with historical data"""
        if not ML_AVAILABLE or len(training_events) < self.min_training_samples:
            logger.warning("Insufficient data or ML libraries not available for training")
            return
        
        logger.info(f"Training models with {len(training_events)} events")
        
        # Extract features for all events
        features_list = []
        for event in training_events:
            features = self.extract_features(event)
            features_list.append(list(features.values()))
        
        X = np.array(features_list)
        y = np.array(threat_labels)
        
        # Scale features
        X_scaled = self.scalers['anomaly'].fit_transform(X)
        
        # Train anomaly detection model
        self.models['anomaly'].fit(X_scaled)
        
        # Train classification model if we have labeled threats
        if len(set(y)) > 1:
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
            self.models['classifier'].fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.models['classifier'].predict(X_test)
            logger.info(f"Classification model accuracy: {np.mean(y_pred == y_test):.3f}")
        
        # Save models
        self._save_models()
        
        logger.info("Model training completed")
    
    def _generate_threat_id(self) -> str:
        """Generate unique threat ID"""
        timestamp = str(int(time.time() * 1000))
        hash_input = f"{timestamp}_{np.random.randint(10000)}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:12]
    
    def _save_models(self):
        """Save trained models to disk"""
        # Implementation would save models using joblib or pickle
        pass
    
    def _load_models(self):
        """Load pre-trained models from disk"""
        # Implementation would load models using joblib or pickle
        pass

class ThreatMonitor:
    """Real-time threat monitoring system"""
    
    def __init__(self, detector: MLThreatDetector):
        self.detector = detector
        self.event_buffer = []
        self.user_histories = {}
        self.threat_callbacks = []
        self.monitoring_active = False
        
        # Configuration
        self.buffer_size = 10000
        self.history_retention_hours = 24
        self.monitoring_interval = 1.0  # seconds
        
        logger.info("Threat Monitor initialized")
    
    def add_event(self, event: SecurityEvent):
        """Add security event for monitoring"""
        self.event_buffer.append(event)
        
        # Maintain buffer size
        if len(self.event_buffer) > self.buffer_size:
            self.event_buffer = self.event_buffer[-self.buffer_size:]
        
        # Update user history
        if event.user_id:
            if event.user_id not in self.user_histories:
                self.user_histories[event.user_id] = []
            
            self.user_histories[event.user_id].append(event)
            
            # Clean old history
            cutoff_time = datetime.now() - timedelta(hours=self.history_retention_hours)
            self.user_histories[event.user_id] = [
                e for e in self.user_histories[event.user_id]
                if e.timestamp > cutoff_time
            ]
        
        # Analyze event immediately
        self._analyze_event_async(event)
    
    def _analyze_event_async(self, event: SecurityEvent):
        """Analyze event asynchronously"""
        try:
            # Get relevant history
            user_history = self.user_histories.get(event.user_id, [])
            recent_events = [
                e for e in self.event_buffer
                if (event.timestamp - e.timestamp).total_seconds() < 300  # Last 5 minutes
            ]
            
            # Detect threats
            threats = self.detector.analyze_event(event, user_history, recent_events)
            
            # Handle detected threats
            for threat in threats:
                self._handle_threat(threat)
                
        except Exception as e:
            logger.error(f"Error analyzing event: {str(e)}")
    
    def _handle_threat(self, threat: ThreatDetection):
        """Handle detected threat"""
        logger.warning(f"Threat detected: {threat.threat_type.value} from {threat.source_ip}")
        
        # Notify all registered callbacks
        for callback in self.threat_callbacks:
            try:
                callback(threat)
            except Exception as e:
                logger.error(f"Error in threat callback: {str(e)}")
    
    def register_threat_callback(self, callback: Callable[[ThreatDetection], None]):
        """Register callback for threat notifications"""
        self.threat_callbacks.append(callback)
    
    def get_threat_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get threat summary for specified time period"""
        # This would typically query a threat database
        # For now, return a mock summary
        return {
            "time_period_hours": hours,
            "total_threats": 0,
            "threats_by_type": {},
            "threats_by_level": {},
            "top_source_ips": [],
            "top_targeted_endpoints": []
        }

# Global threat detection system
_threat_detector = None
_threat_monitor = None

def get_threat_detector() -> MLThreatDetector:
    """Get global threat detector instance"""
    global _threat_detector
    if _threat_detector is None:
        _threat_detector = MLThreatDetector()
    return _threat_detector

def get_threat_monitor() -> ThreatMonitor:
    """Get global threat monitor instance"""
    global _threat_monitor
    if _threat_monitor is None:
        detector = get_threat_detector()
        _threat_monitor = ThreatMonitor(detector)
    return _threat_monitor

# Create alias for backward compatibility
ThreatDetector = MLThreatDetector 