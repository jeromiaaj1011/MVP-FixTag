"""
Tests for FixTag Issues REST API endpoints (/api/issues)
"""


def _create_test_asset(client, tag="PRJ-101"):
    """Helper to create an asset for issue association."""
    res = client.post(
        "/api/assets",
        json={
            "asset_tag": tag,
            "name": "Epson Projector",
            "location": "Room 101",
            "asset_type": "Projector",
        },
    )
    return res.json()


def test_create_issue_success(client):
    """Verify reporting a new issue linked to an asset returns 201 and default status Reported."""
    asset = _create_test_asset(client)
    payload = {
        "asset_id": asset["id"],
        "title": "Projector lamp blown",
        "description": "Lamp burnt out during lecture and unit shut down automatically.",
        "priority": "High",
    }

    response = client.post("/api/issues", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["id"] is not None
    assert data["asset_id"] == asset["id"]
    assert data["title"] == "Projector lamp blown"
    assert data["description"] == payload["description"]
    assert data["priority"] == "High"
    assert data["status"] == "Reported"
    assert data["resolution_notes"] is None
    assert "reported_at" in data
    assert "updated_at" in data
    assert data["asset"]["asset_tag"] == "PRJ-101"


def test_get_issues(client):
    """Verify retrieving list of all reported issues."""
    asset = _create_test_asset(client)
    client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "Issue 1",
            "description": "Description 1",
            "priority": "Low",
        },
    )
    client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "Issue 2",
            "description": "Description 2",
            "priority": "Medium",
        },
    )

    response = client.get("/api/issues")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_get_issue_by_id(client):
    """Verify retrieving a single issue by its primary key ID."""
    asset = _create_test_asset(client)
    create_res = client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "HDMI loose",
            "description": "Port needs tightening",
            "priority": "Low",
        },
    )
    issue_id = create_res.json()["id"]

    response = client.get(f"/api/issues/{issue_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == issue_id
    assert data["title"] == "HDMI loose"


def test_filter_issues_by_status(client):
    """Verify filtering issues with the ?status= query parameter."""
    asset = _create_test_asset(client)

    # Create first issue (will be Reported)
    res1 = client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "Reported issue",
            "description": "Still waiting for review",
            "priority": "Medium",
        },
    )

    # Create second issue and advance status to In Progress
    res2 = client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "In-progress issue",
            "description": "Tech is on site",
            "priority": "High",
        },
    )
    issue2_id = res2.json()["id"]
    client.patch(f"/api/issues/{issue2_id}/status", json={"status": "In Progress"})

    # Filter by Reported
    rep_res = client.get("/api/issues?status=Reported")
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert len(rep_data) == 1
    assert rep_data[0]["title"] == "Reported issue"

    # Filter by In Progress
    prog_res = client.get("/api/issues?status=In Progress")
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert len(prog_data) == 1
    assert prog_data[0]["title"] == "In-progress issue"


def test_update_issue_status(client):
    """Verify updating issue status using PATCH /api/issues/{id}/status."""
    asset = _create_test_asset(client)
    res = client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "Power switch stuck",
            "description": "Switch is jammed in off position",
            "priority": "Medium",
        },
    )
    issue_id = res.json()["id"]

    patch_res = client.patch(
        f"/api/issues/{issue_id}/status",
        json={"status": "Acknowledged"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Acknowledged"


def test_resolve_issue_with_resolution_notes(client):
    """Verify marking issue Fixed stores resolution notes and persists to database."""
    asset = _create_test_asset(client)
    res = client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "Flickering display",
            "description": "Screen intermittently goes black",
            "priority": "Critical",
        },
    )
    issue_id = res.json()["id"]

    resolution_text = "Replaced degraded HDMI 2.1 cable and verified 60fps signal for 30 minutes."
    patch_res = client.patch(
        f"/api/issues/{issue_id}/status",
        json={
            "status": "Fixed",
            "resolution_notes": resolution_text,
        },
    )
    assert patch_res.status_code == 200

    data = patch_res.json()
    assert data["status"] == "Fixed"
    assert data["resolution_notes"] == resolution_text

    # Verify persistence with GET /api/issues/{id}
    get_res = client.get(f"/api/issues/{issue_id}")
    assert get_res.status_code == 200
    assert get_res.json()["status"] == "Fixed"
    assert get_res.json()["resolution_notes"] == resolution_text


def test_create_issue_nonexistent_asset_returns_404(client):
    """Verify reporting an issue for an asset_id that does not exist returns 404."""
    payload = {
        "asset_id": 99999,
        "title": "Broken fan",
        "description": "Fan does not spin",
        "priority": "Low",
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 404
    assert "does not exist" in response.json()["detail"].lower()


def test_get_nonexistent_issue_returns_404(client):
    """Verify requesting an issue with nonexistent ID returns 404 Not Found."""
    response = client.get("/api/issues/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_patch_nonexistent_issue_returns_404(client):
    """Verify patching an issue with nonexistent ID returns 404 Not Found."""
    response = client.patch("/api/issues/99999/status", json={"status": "Acknowledged"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_issue_invalid_priority_rejected(client):
    """Verify invalid priority (not Low, Medium, High, Critical) returns 422 validation error."""
    asset = _create_test_asset(client)
    payload = {
        "asset_id": asset["id"],
        "title": "Invalid priority test",
        "description": "Desc",
        "priority": "SuperUrgent",  # Invalid priority literal
    }
    response = client.post("/api/issues", json=payload)
    assert response.status_code == 422


def test_patch_issue_invalid_status_rejected(client):
    """Verify invalid status string returns 422 validation error."""
    asset = _create_test_asset(client)
    res = client.post(
        "/api/issues",
        json={
            "asset_id": asset["id"],
            "title": "Status test",
            "description": "Desc",
            "priority": "Low",
        },
    )
    issue_id = res.json()["id"]

    response = client.patch(
        f"/api/issues/{issue_id}/status",
        json={"status": "Closed"},  # Invalid status literal
    )
    assert response.status_code == 422
