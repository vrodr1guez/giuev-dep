#!/usr/bin/env python3
"""
GIU EV Charging Infrastructure - Comprehensive Model Test & Analysis
Tests all components and provides detailed status report
"""

import os
import sys
import json
import time
import requests
import subprocess
from datetime import datetime
from pathlib import Path

class ModelAnalyzer:
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'unknown',
            'components': {},
            'critical_issues': [],
            'improvements_needed': [],
            'success_rate': 0,
            'recommendations': []
        }
        self.base_url = "http://localhost:8000"
        
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f"🔍 {title}")
        print('='*60)
        
    def print_section(self, title):
        print(f"\n{'🔸'} {title}")
        print('-'*40)
        
    def test_server_connectivity(self):
        """Test if backend server is accessible"""
        self.print_section("SERVER CONNECTIVITY")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Backend server: ONLINE")
                print(f"   Status: {data.get('status', 'unknown')}")
                self.results['components']['backend_server'] = {
                    'status': 'operational',
                    'response_time': response.elapsed.total_seconds(),
                    'details': data
                }
                return True
            else:
                print(f"⚠️ Backend server: HTTP {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Backend server: OFFLINE - {str(e)}")
            self.results['components']['backend_server'] = {
                'status': 'failed',
                'error': str(e)
            }
            self.results['critical_issues'].append("Backend server is not accessible")
            return False
    
    def test_ml_system(self):
        """Test ML system components"""
        self.print_section("MACHINE LEARNING SYSTEM")
        
        # Test ML health
        try:
            response = requests.get(f"{self.base_url}/api/ml/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ ML System: {data.get('status', 'unknown')}")
                print(f"   Timestamp: {data.get('timestamp', 'unknown')}")
                ml_status = 'operational'
            else:
                print(f"⚠️ ML Health endpoint: HTTP {response.status_code}")
                ml_status = 'degraded'
        except Exception as e:
            print(f"❌ ML Health check failed: {str(e)}")
            ml_status = 'failed'
            
        # Test specific ML endpoints
        ml_endpoints = [
            ("/api/ml/fleet-insights", "GET", None),
            ("/api/ml/battery/predict", "POST", {
                "vehicle_id": "test001",
                "state_of_charge": 75.0,
                "battery_temp": 25.0,
                "voltage": 400.0,
                "current": 50.0
            }),
            ("/api/ml/anomalies/stats", "GET", None),
        ]
        
        ml_results = {}
        for endpoint, method, data in ml_endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                else:
                    response = requests.post(f"{self.base_url}{endpoint}", 
                                           json=data, timeout=10)
                
                if response.status_code == 200:
                    print(f"✅ {endpoint}: Working")
                    ml_results[endpoint] = 'working'
                else:
                    print(f"❌ {endpoint}: HTTP {response.status_code}")
                    if response.status_code == 500:
                        try:
                            error_data = response.json()
                            print(f"   Error: {error_data.get('detail', 'Unknown error')}")
                        except:
                            pass
                    ml_results[endpoint] = 'failed'
                    
            except Exception as e:
                print(f"❌ {endpoint}: Exception - {str(e)}")
                ml_results[endpoint] = 'failed'
        
        self.results['components']['ml_system'] = {
            'status': ml_status,
            'endpoints': ml_results
        }
        
        # Analyze ML failures
        failed_count = sum(1 for status in ml_results.values() if status == 'failed')
        if failed_count > 0:
            self.results['improvements_needed'].append(
                f"Fix {failed_count} failing ML endpoints"
            )
    
    def test_dependencies(self):
        """Test system dependencies"""
        self.print_section("DEPENDENCY ANALYSIS")
        
        try:
            # Activate virtual environment and test imports
            cmd = "source ev_charging_env/bin/activate && python -c \""
            imports_to_test = [
                "import fastapi",
                "import uvicorn", 
                "import sqlalchemy",
                "import pydantic",
                "import numpy",
                "import pandas",
                "import xgboost",
                "import matplotlib",
                "import requests",
                "from jose import jwt",
                "import websockets",
                "import ocpp"
            ]
            
            cmd += "; ".join(imports_to_test)
            cmd += "; print('All dependencies loaded successfully')\""
            
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ All core dependencies: Available")
                dependency_status = 'complete'
            else:
                print("❌ Dependency issues found:")
                print(result.stderr)
                dependency_status = 'incomplete'
                self.results['critical_issues'].append("Missing dependencies detected")
                
        except Exception as e:
            print(f"❌ Dependency check failed: {str(e)}")
            dependency_status = 'failed'
            
        self.results['components']['dependencies'] = {
            'status': dependency_status
        }
    
    def test_model_files(self):
        """Test ML model files"""
        self.print_section("MODEL FILES ANALYSIS")
        
        model_dirs = [
            'app/ml/models/battery_health',
            'app/ml/models/usage_prediction',
            'app/ml/models/energy_price',
            'app/ml/models/mlnet'
        ]
        
        model_status = {}
        total_models = 0
        working_models = 0
        
        for model_dir in model_dirs:
            if os.path.exists(model_dir):
                files = os.listdir(model_dir)
                model_files = [f for f in files if f.endswith(('.onnx', '.joblib', '.pkl'))]
                total_models += len(model_files)
                
                if model_files:
                    print(f"✅ {model_dir}: {len(model_files)} models")
                    working_models += len(model_files)
                    model_status[model_dir] = 'available'
                else:
                    print(f"⚠️ {model_dir}: No model files")
                    model_status[model_dir] = 'empty'
            else:
                print(f"❌ {model_dir}: Directory missing")
                model_status[model_dir] = 'missing'
        
        self.results['components']['model_files'] = {
            'status': 'partial' if working_models > 0 else 'missing',
            'total_models': total_models,
            'working_models': working_models,
            'directories': model_status
        }
        
        if total_models == 0:
            self.results['critical_issues'].append("No ML model files found")
        elif working_models < total_models:
            self.results['improvements_needed'].append("Some model directories are empty")
    
    def test_database(self):
        """Test database connectivity"""
        self.print_section("DATABASE ANALYSIS")
        
        db_file = 'ev_charging.db'
        if os.path.exists(db_file):
            size_kb = os.path.getsize(db_file) / 1024
            print(f"✅ Database file: {size_kb:.1f} KB")
            
            if size_kb < 1:
                print("⚠️ Database appears empty (< 1KB)")
                db_status = 'empty'
                self.results['improvements_needed'].append("Database needs to be populated with data")
            else:
                db_status = 'operational'
        else:
            print("❌ Database file missing")
            db_status = 'missing'
            self.results['critical_issues'].append("Database file not found")
            
        self.results['components']['database'] = {
            'status': db_status,
            'size_kb': size_kb if os.path.exists(db_file) else 0
        }
    
    def test_frontend_connectivity(self):
        """Test frontend connectivity"""
        self.print_section("FRONTEND CONNECTIVITY")
        
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            if response.status_code == 200:
                print("✅ Frontend server: ONLINE")
                
                # Test specific dashboard pages
                dashboard_pages = [
                    "/digital-twin-dashboard",
                    "/ml-dashboard"
                ]
                
                frontend_status = 'operational'
                for page in dashboard_pages:
                    try:
                        dash_response = requests.get(f"http://localhost:3000{page}", timeout=5)
                        if dash_response.status_code == 200:
                            print(f"✅ {page}: Available")
                        else:
                            print(f"⚠️ {page}: HTTP {dash_response.status_code}")
                    except:
                        print(f"❌ {page}: Failed to load")
                        
            else:
                print(f"⚠️ Frontend server: HTTP {response.status_code}")
                frontend_status = 'degraded'
                
        except requests.exceptions.RequestException:
            print("❌ Frontend server: OFFLINE")
            frontend_status = 'offline'
            self.results['critical_issues'].append("Frontend server not accessible")
            
        self.results['components']['frontend'] = {
            'status': frontend_status
        }
    
    def calculate_overall_status(self):
        """Calculate overall system status"""
        total_components = len(self.results['components'])
        operational_components = sum(
            1 for comp in self.results['components'].values() 
            if comp.get('status') in ['operational', 'working', 'available']
        )
        
        self.results['success_rate'] = (operational_components / total_components * 100) if total_components > 0 else 0
        
        if self.results['success_rate'] >= 90:
            self.results['overall_status'] = 'excellent'
        elif self.results['success_rate'] >= 70:
            self.results['overall_status'] = 'good'
        elif self.results['success_rate'] >= 50:
            self.results['overall_status'] = 'fair'
        else:
            self.results['overall_status'] = 'poor'
    
    def generate_recommendations(self):
        """Generate specific recommendations"""
        recommendations = []
        
        # Critical issues first
        if self.results['critical_issues']:
            recommendations.append("🚨 CRITICAL: Address critical issues immediately")
            
        # Component-specific recommendations
        for comp_name, comp_data in self.results['components'].items():
            if comp_data.get('status') in ['failed', 'missing', 'offline']:
                if comp_name == 'backend_server':
                    recommendations.append("⚡ Fix backend server connectivity issues")
                elif comp_name == 'ml_system':
                    recommendations.append("🤖 Repair ML system components")
                elif comp_name == 'database':
                    recommendations.append("📊 Initialize and populate database")
                elif comp_name == 'frontend':
                    recommendations.append("🖥️ Restore frontend server functionality")
                    
        # Success rate recommendations
        if self.results['success_rate'] < 70:
            recommendations.append("🔧 System requires significant improvements for production readiness")
        elif self.results['success_rate'] < 90:
            recommendations.append("⚙️ System is functional but needs optimization")
        else:
            recommendations.append("✨ System is well-optimized, focus on advanced features")
            
        self.results['recommendations'] = recommendations
    
    def print_summary(self):
        """Print comprehensive summary"""
        self.print_header("COMPREHENSIVE MODEL TEST RESULTS")
        
        print(f"📊 **OVERALL STATUS**: {self.results['overall_status'].upper()}")
        print(f"📈 **SUCCESS RATE**: {self.results['success_rate']:.1f}%")
        print(f"⏰ **TEST TIME**: {self.results['timestamp']}")
        
        self.print_section("COMPONENT STATUS")
        for comp_name, comp_data in self.results['components'].items():
            status = comp_data.get('status', 'unknown')
            status_emoji = {
                'operational': '✅',
                'working': '✅', 
                'available': '✅',
                'degraded': '⚠️',
                'partial': '⚠️',
                'empty': '⚠️',
                'failed': '❌',
                'missing': '❌',
                'offline': '❌'
            }.get(status, '❓')
            
            print(f"{status_emoji} {comp_name.replace('_', ' ').title()}: {status}")
        
        if self.results['critical_issues']:
            self.print_section("CRITICAL ISSUES")
            for issue in self.results['critical_issues']:
                print(f"🚨 {issue}")
        
        if self.results['improvements_needed']:
            self.print_section("IMPROVEMENTS NEEDED")
            for improvement in self.results['improvements_needed']:
                print(f"⚠️ {improvement}")
        
        if self.results['recommendations']:
            self.print_section("RECOMMENDATIONS")
            for rec in self.results['recommendations']:
                print(f"{rec}")
        
        # Detailed next steps
        self.print_section("NEXT STEPS")
        if self.results['success_rate'] < 50:
            print("1. 🚨 Address critical server connectivity issues")
            print("2. 🔧 Fix core system dependencies")
            print("3. 📊 Initialize database and ML models")
            print("4. 🧪 Run comprehensive testing")
        elif self.results['success_rate'] < 80:
            print("1. 🤖 Fix remaining ML endpoint issues") 
            print("2. 📈 Optimize model performance")
            print("3. 🔐 Implement security enhancements")
            print("4. 📦 Add containerization")
        else:
            print("1. ✨ Add advanced analytics features")
            print("2. 🔄 Implement real-time data streaming")
            print("3. 🎯 Performance optimization")
            print("4. 🚀 Production deployment preparation")
    
    def save_results(self):
        """Save results to file"""
        with open('model_test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n💾 Results saved to: model_test_results.json")
    
    def run_full_analysis(self):
        """Run complete analysis"""
        self.print_header("STARTING COMPREHENSIVE MODEL ANALYSIS")
        print("🔍 Testing all system components...")
        
        # Run all tests
        self.test_server_connectivity()
        self.test_ml_system()
        self.test_dependencies()
        self.test_model_files()
        self.test_database()
        self.test_frontend_connectivity()
        
        # Calculate results
        self.calculate_overall_status()
        self.generate_recommendations()
        
        # Display results
        self.print_summary()
        self.save_results()
        
        return self.results

if __name__ == '__main__':
    analyzer = ModelAnalyzer()
    results = analyzer.run_full_analysis() 