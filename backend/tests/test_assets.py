"""
Tests for FixTag Assets REST API endpoints (/api/assets)
"""


def test_create_asset_success(client):
    """Verify creating a new asset returns 201 Created and persisted fields."""
    payload = {
        "asset_tag": "PRJ-101",
        "name": "Epson 4K Projector",
        "location": "Room 101",
        "asset_type": "Projector",
    }
    response = client.post("/api/assets", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["id"] is not None
    assert data["asset_tag"] == "PRJ-101"
    assert data["name"] == "Epson 4K Projector"
    assert data["location"] == "Room 101"
    assert data["asset_type"] == "Projector"
    assert "created_at" in data


def test_create_asset_duplicate_tag_rejected(client):
    """Verify attempting to create an asset with an existing asset_tag returns 400 Bad Request."""
    payload = {
        "asset_tag": "PRJ-101",
        "name": "Epson 4K Projector",
        "location": "Room 101",
        "asset_type": "Projector",
    }
    res1 = client.post("/api/assets", json=payload)
    assert res1.status_code == 201

    # Attempt to create duplicate
    res2 = client.post("/api/assets", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_get_assets(client):
    """Verify retrieving list of all registered assets."""
    client.post(
        "/api/assets",
        json={
            "asset_tag": "PRJ-101",
            "name": "Epson Projector",
            "location": "Room 101",
            "asset_type": "Projector",
        },
    )
    client.post(
        "/api/assets",
        json={
            "asset_tag": "HVAC-201",
            "name": "Daikin AC Unit",
            "location": "Room 201",
            "asset_type": "HVAC",
        },
    )

    response = client.get("/api/assets")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    tags = [asset["asset_tag"] for asset in data]
    assert "PRJ-101" in tags
    assert "HVAC-201" in tags


def test_get_asset_by_tag(client):
    """Verify retrieving a single asset by its unique asset_tag returns details and issue history."""
    client.post(
        "/api/assets",
        json={
            "asset_tag": "PRJ-101",
            "name": "Epson Projector",
            "location": "Room 101",
            "asset_type": "Projector",
        },
    )

    response = client.get("/api/assets/PRJ-101")
    assert response.status_code == 200

    data = response.json()
    assert data["asset_tag"] == "PRJ-101"
    assert data["name"] == "Epson Projector"
    assert "issues" in data
    assert isinstance(data["issues"], list)
    assert len(data["issues"]) == 0


def test_get_nonexistent_asset_returns_404(client):
    """Verify requesting a nonexistent asset_tag returns 404 Not Found."""
    response = client.get("/api/assets/UNKNOWN-TAG-999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_asset_validation_error(client):
    """Verify invalid payload missing required fields returns 422 Unprocessable Entity."""
    # Missing required name, location, asset_type
    invalid_payload = {"asset_tag": "PRJ-101"}
    response = client.post("/api/assets", json=invalid_payload)
    assert response.status_code == 422
