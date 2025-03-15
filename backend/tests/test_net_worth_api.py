from datetime import datetime
import pytest
from app.models.models import NetWorthEntry

def test_create_net_worth_entry(client):
    """Test creating a new net worth entry"""
    response = client.post(
        "/api/v1/net-worth/",
        json={"value": 100000.0, "date": datetime.now().isoformat()}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["value"] == 100000.0
    assert "date" in data
    assert "id" in data

def test_get_net_worth_history_empty(client):
    """Test getting net worth history when no entries exist"""
    response = client.get("/api/v1/net-worth/history")
    assert response.status_code == 200
    assert response.json() == []

def test_get_net_worth_history_with_entries(client, db):
    """Test getting net worth history with multiple entries"""
    # Create some test entries
    entries = [
        NetWorthEntry(value=100000.0, date=datetime(2024, 1, 1)),
        NetWorthEntry(value=110000.0, date=datetime(2024, 2, 1)),
        NetWorthEntry(value=120000.0, date=datetime(2024, 3, 1))
    ]
    for entry in entries:
        db.add(entry)
    db.commit()

    response = client.get("/api/v1/net-worth/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    # Check if entries are ordered by date descending
    assert data[0]["value"] == 120000.0
    assert data[1]["value"] == 110000.0
    assert data[2]["value"] == 100000.0

def test_get_latest_net_worth_empty(client):
    """Test getting latest net worth when no entries exist"""
    response = client.get("/api/v1/net-worth/latest")
    assert response.status_code == 404
    assert response.json()["detail"] == "No net worth entries found"

def test_get_latest_net_worth_with_entries(client, db):
    """Test getting latest net worth entry"""
    # Create some test entries
    entries = [
        NetWorthEntry(value=100000.0, date=datetime(2024, 1, 1)),
        NetWorthEntry(value=120000.0, date=datetime(2024, 3, 1)),
        NetWorthEntry(value=110000.0, date=datetime(2024, 2, 1))
    ]
    for entry in entries:
        db.add(entry)
    db.commit()

    response = client.get("/api/v1/net-worth/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["value"] == 120000.0  # Should return the most recent entry 