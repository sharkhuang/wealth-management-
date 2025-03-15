"""add document analysis fields

Revision ID: add_document_analysis_fields
Revises: initial_migration
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_document_analysis_fields'
down_revision = 'initial_migration'
branch_labels = None
depends_on = None

def upgrade():
    # Add analysis_status and analysis_result columns to documents table
    op.add_column('documents', sa.Column('analysis_status', sa.String(), nullable=True, server_default='pending'))
    op.add_column('documents', sa.Column('analysis_result', sa.Text(), nullable=True))
    
    # Update existing columns
    op.alter_column('documents', 'type',
        existing_type=sa.String(),
        nullable=True)
    op.alter_column('documents', 'size',
        existing_type=sa.Integer(),
        nullable=True)
    op.alter_column('documents', 'created_at',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=True,
        server_default=sa.text('now()'))
    
    # Create index on name column
    op.create_index(op.f('ix_documents_name'), 'documents', ['name'], unique=False)
    
    # Update net worth entries table
    op.alter_column('net_worth_entries', 'date',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False)
    op.alter_column('net_worth_entries', 'created_at',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        server_default=sa.text('now()'))

def downgrade():
    # Remove analysis columns from documents table
    op.drop_column('documents', 'analysis_status')
    op.drop_column('documents', 'analysis_result')
    
    # Revert column changes
    op.alter_column('documents', 'type',
        existing_type=sa.String(),
        nullable=False)
    op.alter_column('documents', 'size',
        existing_type=sa.Integer(),
        nullable=False)
    op.alter_column('documents', 'created_at',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=True)
    
    # Drop index on name column
    op.drop_index(op.f('ix_documents_name'), table_name='documents')
    
    # Revert net worth entries table changes
    op.alter_column('net_worth_entries', 'date',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=False)
    op.alter_column('net_worth_entries', 'created_at',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=False) 