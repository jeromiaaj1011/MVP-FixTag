"""
Tests for FixTag Discord Notification Service & Webhook Integration
"""
from unittest.mock import patch, MagicMock
import httpx
import pytest

from app.services.notifications import send_discord_issue_alert


class DummyModel:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def test_discord_alert_skipped_when_url_not_configured(monkeypatch):
    """Verify notification gracefully returns False when DISCORD_WEBHOOK_URL is not set."""
    monkeypatch.delenv("DISCORD_WEBHOOK_URL", raising=False)

    issue = DummyModel(id=1, title="Test Issue", description="Desc", priority="High", status="Reported")
    asset = DummyModel(asset_tag="PRJ-204", name="Epson Projector", location="Room 204")

    result = send_discord_issue_alert(issue, asset)
    assert result is False


def test_discord_alert_sends_correct_payload(monkeypatch):
    """Verify notification sends expected payload to Discord webhook URL."""
    fake_webhook_url = "https://discord.com/api/webhooks/123/fake_token"
    monkeypatch.setenv("DISCORD_WEBHOOK_URL", fake_webhook_url)

    issue = DummyModel(id=42, title="Projector overheating", description="Fan is failing", priority="Critical", status="Reported")
    asset = DummyModel(asset_tag="PRJ-204", name="Epson Projector", location="Room 204")

    mock_response = MagicMock(status_code=204)

    with patch("httpx.post", return_value=mock_response) as mock_post:
        result = send_discord_issue_alert(issue, asset)
        assert result is True

        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == fake_webhook_url
        assert "json" in kwargs

        payload = kwargs["json"]
        assert "FixTag Alerts" in payload["username"]
        assert "#42" in payload["content"]

        embed = payload["embeds"][0]
        assert "PRJ-204" in embed["title"]
        assert embed["color"] == 0xEF4444  # Critical color

        field_names = {f["name"]: f["value"] for f in embed["fields"]}
        assert field_names["Issue ID"] == "#42"
        assert field_names["Priority"] == "Critical"
        assert field_names["Asset Tag"] == "#PRJ-204"
        assert field_names["Location"] == "Room 204"
        assert field_names["Status"] == "Reported"


def test_discord_alert_handles_http_failure_safely(monkeypatch):
    """Verify notification returns False and does NOT raise when Discord returns 500 error."""
    fake_webhook_url = "https://discord.com/api/webhooks/123/fake_token"
    monkeypatch.setenv("DISCORD_WEBHOOK_URL", fake_webhook_url)

    issue = DummyModel(id=10, title="Audio buzz", description="", priority="Low", status="Reported")
    asset = DummyModel(asset_tag="AUD-101", name="Speaker", location="Hall A")

    mock_response = MagicMock(status_code=500, text="Internal Server Error")

    with patch("httpx.post", return_value=mock_response):
        result = send_discord_issue_alert(issue, asset)
        assert result is False


def test_discord_alert_handles_network_timeout_safely(monkeypatch):
    """Verify notification returns False and does NOT raise when network times out."""
    fake_webhook_url = "https://discord.com/api/webhooks/123/fake_token"
    monkeypatch.setenv("DISCORD_WEBHOOK_URL", fake_webhook_url)

    issue = DummyModel(id=10, title="Audio buzz", description="", priority="Low", status="Reported")
    asset = DummyModel(asset_tag="AUD-101", name="Speaker", location="Hall A")

    with patch("httpx.post", side_effect=httpx.ConnectTimeout("Connection timed out")):
        result = send_discord_issue_alert(issue, asset)
        assert result is False


def test_issue_creation_endpoint_succeeds_even_if_discord_fails(client, monkeypatch):
    """
    Verify POST /api/issues still returns 201 Created and saves the issue in SQLite
    even if the Discord webhook throws a network error.
    """
    # Create asset
    asset_res = client.post(
        "/api/assets",
        json={"asset_tag": "PRJ-999", "name": "Test Projector", "location": "Lab 3", "asset_type": "Projector"}
    )
    asset_id = asset_res.json()["id"]

    monkeypatch.setenv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/error_test")

    # Simulate Discord webhook network failure
    with patch("httpx.post", side_effect=httpx.ConnectError("Network unreachable")):
        issue_res = client.post(
            "/api/issues",
            json={
                "asset_id": asset_id,
                "title": "Bulb broken",
                "description": "Will not ignite",
                "priority": "High"
            }
        )
        assert issue_res.status_code == 201
        data = issue_res.json()
        assert data["id"] is not None
        assert data["title"] == "Bulb broken"
        assert data["status"] == "Reported"

    # Verify the issue was actually saved in the database
    get_res = client.get(f"/api/issues/{data['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == data["id"]
