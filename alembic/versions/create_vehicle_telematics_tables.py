"""Create vehicle and telematics tables

Revision ID: da10a1b5a9c2
Revises: 
Create Date: 2024-07-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'da10a1b5a9c2'
down_revision = None  # Update this if there are previous migrations
branch_labels = None
depends_on = None


def upgrade():
    # Create organization table first
    op.create_table(
        'organization',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_organization_id'), 'organization', ['id'], unique=False)
    op.create_index(op.f('ix_organization_name'), 'organization', ['name'], unique=True)
    
    # Create fleet table
    op.create_table(
        'fleet',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_fleet_id'), 'fleet', ['id'], unique=False)
    op.create_index(op.f('ix_fleet_name'), 'fleet', ['name'], unique=False)
    op.create_index(op.f('ix_fleet_organization_id'), 'fleet', ['organization_id'], unique=False)

    # Create telematics_providers table
    op.create_table(
        'telematics_providers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('api_endpoint', sa.String(length=255), nullable=True),
        sa.Column('auth_token', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_telematics_providers_id'), 'telematics_providers', ['id'], unique=False)
    op.create_index(op.f('ix_telematics_providers_name'), 'telematics_providers', ['name'], unique=True)

    # Create vehicles table
    op.create_table(
        'vehicle',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vin', sa.String(length=17), nullable=False),
        sa.Column('license_plate', sa.String(length=20), nullable=False),
        sa.Column('make', sa.String(length=50), nullable=False),
        sa.Column('model', sa.String(length=50), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('battery_capacity_kwh', sa.Float(), nullable=False),
        sa.Column('nominal_range_km', sa.Float(), nullable=False),
        sa.Column('telematics_provider_id', sa.Integer(), nullable=True),
        sa.Column('telematics_vehicle_id', sa.String(length=100), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('fleet_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['fleet_id'], ['fleet.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], ),
        sa.ForeignKeyConstraint(['telematics_provider_id'], ['telematics_providers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vehicle_id'), 'vehicle', ['id'], unique=False)
    op.create_index(op.f('ix_vehicle_license_plate'), 'vehicle', ['license_plate'], unique=True)
    op.create_index(op.f('ix_vehicle_vin'), 'vehicle', ['vin'], unique=True)

    # Create vehicle_telematics_live table
    op.create_table(
        'vehicletelematicslive',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('speed_kmh', sa.Float(), nullable=True),
        sa.Column('state_of_charge_percent', sa.Float(), nullable=True),
        sa.Column('state_of_health_percent', sa.Float(), nullable=True),
        sa.Column('odometer_km', sa.Float(), nullable=True),
        sa.Column('is_charging', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('ambient_temperature_celsius', sa.Float(), nullable=True),
        sa.Column('raw_data', sa.JSON(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicle.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vehicletelematicslive_id'), 'vehicletelematicslive', ['id'], unique=False)
    op.create_index(op.f('ix_vehicletelematicslive_vehicle_id'), 'vehicletelematicslive', ['vehicle_id'], unique=False)

    # Create vehicle_telematics_history table
    op.create_table(
        'vehicletelematicshistory',
        sa.Column('log_id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('speed_kmh', sa.Float(), nullable=True),
        sa.Column('state_of_charge_percent', sa.Float(), nullable=True),
        sa.Column('energy_consumed_kwh_since_last', sa.Float(), nullable=True),
        sa.Column('odometer_km', sa.Float(), nullable=True),
        sa.Column('diagnostic_trouble_codes', sa.JSON(), nullable=True, server_default='[]'),
        sa.Column('raw_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicle.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('log_id')
    )
    op.create_index(op.f('ix_vehicletelematicshistory_log_id'), 'vehicletelematicshistory', ['log_id'], unique=False)
    op.create_index(op.f('ix_vehicletelematicshistory_timestamp'), 'vehicletelematicshistory', ['timestamp'], unique=False)
    op.create_index(op.f('ix_vehicletelematicshistory_vehicle_id'), 'vehicletelematicshistory', ['vehicle_id'], unique=False)


def downgrade():
    op.drop_table('vehicletelematicshistory')
    op.drop_table('vehicletelematicslive')
    op.drop_table('vehicle')
    op.drop_table('telematics_providers')
    op.drop_table('fleet')
    op.drop_table('organization') 