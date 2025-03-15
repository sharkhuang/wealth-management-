import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock, patch
import boto3
from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.api.v1.endpoints.documents import get_s3_client

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for each test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after each test
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def mock_s3_client():
    mock_client = MagicMock()
    
    # Mock common S3 operations
    mock_client.put_object.return_value = {}
    mock_client.generate_presigned_url.return_value = "http://mock-presigned-url"
    mock_client.delete_object.return_value = {}
    
    return mock_client

@pytest.fixture(scope="function")
def mock_celery():
    with patch('app.tasks.document_tasks.analyze_document.delay') as mock:
        yield mock

@pytest.fixture(scope="function")
def client(db, mock_s3_client, mock_celery):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    def override_get_s3_client():
        return mock_s3_client
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_s3_client] = override_get_s3_client
    
    yield TestClient(app)
    app.dependency_overrides.clear() 