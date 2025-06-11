"""create battery health tables

Revision ID: create_battery_health_tables
Revises: 
Create Date: 2024-03-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_battery_health_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create battery_health_reports table
    op.create_table(
        'battery_health_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('report_date', sa.Date(), nullable=False),
        sa.Column('state_of_health_percent', sa.Float(), nullable=True),
        sa.Column('estimated_remaining_capacity_kwh', sa.Float(), nullable=True),
        sa.Column('cycle_count_estimate', sa.Integer(), nullable=True),
        sa.Column('average_cell_temperature_celsius', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('raw_diagnostic_data', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_battery_health_reports_id', 'battery_health_reports', ['id'])
    op.create_index('ix_battery_health_reports_vehicle_id', 'battery_health_reports', ['vehicle_id'])
    op.create_index('ix_battery_health_reports_report_date', 'battery_health_reports', ['report_date'])

    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('alert_type', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), server_default='active', nullable=False),
        sa.Column('acknowledged_by_user_id', sa.Integer(), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['acknowledged_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_alerts_id', 'alerts', ['id'])
    op.create_index('ix_alerts_organization_id', 'alerts', ['organization_id'])
    op.create_index('ix_alerts_vehicle_id', 'alerts', ['vehicle_id'])
    op.create_index('ix_alerts_status', 'alerts', ['status'])
    op.create_index('ix_alerts_severity', 'alerts', ['severity'])
    op.create_index('ix_alerts_created_at', 'alerts', ['created_at'])

def downgrade():
    op.drop_table('alerts')
    op.drop_table('battery_health_reports') 