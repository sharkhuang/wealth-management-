import io
from datetime import datetime
import pytest
from app.models.models import Document

def test_upload_document(client, mock_s3_client):
    """Test uploading a document"""
    # Create a test file
    file_content = b"test file content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.txt", file, "text/plain")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test.txt"
    assert data["type"] == "text/plain"
    assert data["size"] == len(file_content)
    assert data["analysis_status"] == "pending"
    assert data["url"] == "http://mock-presigned-url"
    assert "s3_key" in data
    
    # Verify S3 upload was called
    mock_s3_client.put_object.assert_called_once()

def test_list_documents_empty(client):
    """Test listing documents when none exist"""
    response = client.get("/api/v1/documents/")
    assert response.status_code == 200
    assert response.json() == []

def test_list_documents_with_entries(client, db, mock_s3_client):
    """Test listing documents with multiple entries"""
    # Create some test documents
    documents = [
        Document(
            name="doc1.txt",
            type="text/plain",
            size=100,
            s3_key="key1",
            analysis_status="completed",
            created_at=datetime(2024, 1, 1)
        ),
        Document(
            name="doc2.txt",
            type="text/plain",
            size=200,
            s3_key="key2",
            analysis_status="pending",
            created_at=datetime(2024, 2, 1)
        )
    ]
    for doc in documents:
        db.add(doc)
    db.commit()

    response = client.get("/api/v1/documents/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Check if documents are ordered by created_at descending
    assert data[0]["name"] == "doc2.txt"
    assert data[1]["name"] == "doc1.txt"
    assert data[0]["url"] == "http://mock-presigned-url"
    assert data[1]["url"] == "http://mock-presigned-url"

def test_get_document_not_found(client):
    """Test getting a document that doesn't exist"""
    response = client.get("/api/v1/documents/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found"

def test_get_document(client, db, mock_s3_client):
    """Test getting a specific document"""
    # Create a test document
    document = Document(
        name="test.txt",
        type="text/plain",
        size=100,
        s3_key="test_key",
        analysis_status="completed"
    )
    db.add(document)
    db.commit()

    response = client.get(f"/api/v1/documents/{document.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test.txt"
    assert data["type"] == "text/plain"
    assert data["size"] == 100
    assert data["s3_key"] == "test_key"
    assert data["analysis_status"] == "completed"
    assert data["url"] == "http://mock-presigned-url"

def test_delete_document_not_found(client):
    """Test deleting a document that doesn't exist"""
    response = client.delete("/api/v1/documents/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found"

def test_delete_document(client, db, mock_s3_client):
    """Test deleting a document"""
    # Create a test document
    document = Document(
        name="test.txt",
        type="text/plain",
        size=100,
        s3_key="test_key",
        analysis_status="completed"
    )
    db.add(document)
    db.commit()

    response = client.delete(f"/api/v1/documents/{document.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Document deleted successfully"

    # Verify document is deleted from database
    assert db.query(Document).filter(Document.id == document.id).first() is None

    # Verify S3 delete was called
    mock_s3_client.delete_object.assert_called_once_with(
        Bucket="wealthmgr-documents",
        Key="test_key"
    ) 