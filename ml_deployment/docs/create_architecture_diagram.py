#!/usr/bin/env python3
"""
Create architecture diagram for ML deployment
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.lines as mlines

def create_architecture_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    
    # Define colors
    client_color = '#3498db'
    api_color = '#2ecc71'
    model_color = '#e74c3c'
    storage_color = '#f39c12'
    monitor_color = '#9b59b6'
    
    # Client Layer
    client_box = FancyBboxPatch((1, 8), 3, 1.5, 
                                boxstyle="round,pad=0.1",
                                facecolor=client_color, 
                                edgecolor='black',
                                alpha=0.8)
    ax.add_patch(client_box)
    ax.text(2.5, 8.75, 'Client Applications', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(2.5, 8.3, '• Web App\n• Mobile App\n• API Clients', ha='center', va='center', fontsize=9)
    
    # API Gateway Layer
    api_box = FancyBboxPatch((1, 5.5), 3, 1.5,
                             boxstyle="round,pad=0.1",
                             facecolor=api_color,
                             edgecolor='black',
                             alpha=0.8)
    ax.add_patch(api_box)
    ax.text(2.5, 6.25, 'FastAPI Server', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(2.5, 5.8, '• REST API\n• Authentication\n• Rate Limiting', ha='center', va='center', fontsize=9)
    
    # ML Models Layer
    model_box1 = FancyBboxPatch((0.5, 3), 2, 1.5,
                                boxstyle="round,pad=0.1",
                                facecolor=model_color,
                                edgecolor='black',
                                alpha=0.8)
    ax.add_patch(model_box1)
    ax.text(1.5, 3.75, 'Usage Model', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(1.5, 3.3, 'ONNX Runtime', ha='center', va='center', fontsize=9)
    
    model_box2 = FancyBboxPatch((2.5, 3), 2, 1.5,
                                boxstyle="round,pad=0.1",
                                facecolor=model_color,
                                edgecolor='black',
                                alpha=0.8)
    ax.add_patch(model_box2)
    ax.text(3.5, 3.75, 'Price Model', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(3.5, 3.3, 'ONNX Runtime', ha='center', va='center', fontsize=9)
    
    # Storage Layer
    storage_box = FancyBboxPatch((5.5, 5.5), 2.5, 1.5,
                                 boxstyle="round,pad=0.1",
                                 facecolor=storage_color,
                                 edgecolor='black',
                                 alpha=0.8)
    ax.add_patch(storage_box)
    ax.text(6.75, 6.25, 'Redis Cache', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(6.75, 5.8, '• Predictions\n• Sessions', ha='center', va='center', fontsize=9)
    
    # Monitoring Layer
    monitor_box1 = FancyBboxPatch((8.5, 6.5), 2.5, 1.2,
                                  boxstyle="round,pad=0.1",
                                  facecolor=monitor_color,
                                  edgecolor='black',
                                  alpha=0.8)
    ax.add_patch(monitor_box1)
    ax.text(9.75, 7.1, 'Prometheus', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(9.75, 6.7, 'Metrics Collection', ha='center', va='center', fontsize=9)
    
    monitor_box2 = FancyBboxPatch((8.5, 4.8), 2.5, 1.2,
                                  boxstyle="round,pad=0.1",
                                  facecolor=monitor_color,
                                  edgecolor='black',
                                  alpha=0.8)
    ax.add_patch(monitor_box2)
    ax.text(9.75, 5.4, 'Grafana', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(9.75, 5.0, 'Visualization', ha='center', va='center', fontsize=9)
    
    # Logs
    logs_box = FancyBboxPatch((5.5, 3), 2.5, 1.5,
                              boxstyle="round,pad=0.1",
                              facecolor=storage_color,
                              edgecolor='black',
                              alpha=0.8)
    ax.add_patch(logs_box)
    ax.text(6.75, 3.75, 'Logs', ha='center', va='center', fontsize=11, fontweight='bold')
    ax.text(6.75, 3.3, '• API Logs\n• Predictions', ha='center', va='center', fontsize=9)
    
    # Docker/K8s Layer
    container_box = FancyBboxPatch((0.5, 0.5), 10.5, 1.2,
                                   boxstyle="round,pad=0.1",
                                   facecolor='#95a5a6',
                                   edgecolor='black',
                                   alpha=0.6)
    ax.add_patch(container_box)
    ax.text(5.75, 1.1, 'Docker / Kubernetes / Azure Container Instances', 
            ha='center', va='center', fontsize=11, fontweight='bold')
    
    # Connections
    # Client to API
    ax.arrow(2.5, 8, 0, -1.3, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # API to Models
    ax.arrow(2.2, 5.5, -0.5, -0.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    ax.arrow(2.8, 5.5, 0.5, -0.8, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # API to Cache
    ax.arrow(4, 6.25, 1.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # API to Monitoring
    ax.arrow(4, 6.5, 4.3, 0.5, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Models to Logs
    ax.arrow(4, 3.75, 1.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Prometheus to Grafana
    ax.arrow(9.75, 6.5, 0, -0.6, head_width=0.1, head_length=0.1, fc='black', ec='black')
    
    # Add labels
    ax.text(1.5, 7.3, 'HTTP/REST', fontsize=9, rotation=90, ha='center')
    ax.text(1.2, 4.7, 'Inference', fontsize=9, rotation=-45, ha='center')
    ax.text(3.8, 4.7, 'Inference', fontsize=9, rotation=45, ha='center')
    ax.text(5.0, 6.5, 'Cache', fontsize=9, ha='center')
    ax.text(6.5, 7.5, 'Metrics', fontsize=9, rotation=15, ha='center')
    ax.text(5.0, 4.0, 'Logging', fontsize=9, ha='center')
    
    # Title
    ax.text(5.75, 9.5, 'EV Charging ML System Architecture', 
            fontsize=16, fontweight='bold', ha='center')
    
    # Set axis properties
    ax.set_xlim(0, 11.5)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Add legend
    legend_elements = [
        mlines.Line2D([0], [0], marker='s', color='w', markerfacecolor=client_color, 
                      markersize=10, label='Client Layer'),
        mlines.Line2D([0], [0], marker='s', color='w', markerfacecolor=api_color, 
                      markersize=10, label='API Layer'),
        mlines.Line2D([0], [0], marker='s', color='w', markerfacecolor=model_color, 
                      markersize=10, label='ML Models'),
        mlines.Line2D([0], [0], marker='s', color='w', markerfacecolor=storage_color, 
                      markersize=10, label='Storage'),
        mlines.Line2D([0], [0], marker='s', color='w', markerfacecolor=monitor_color, 
                      markersize=10, label='Monitoring'),
    ]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.15, 1))
    
    plt.tight_layout()
    plt.savefig('ml_deployment/docs/architecture_diagram.png', dpi=300, bbox_inches='tight')
    plt.savefig('ml_deployment/docs/architecture_diagram.pdf', bbox_inches='tight')
    print("Architecture diagram saved to ml_deployment/docs/")

if __name__ == "__main__":
    create_architecture_diagram() 