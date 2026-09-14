import logging
import os
from pathlib import Path
from typing import Any, Optional
import httpx
from dotenv import load_dotenv

# Initialize logger for notifications
logger = logging.getLogger("fixtag.notifications")

# Load environment variables from backend/.env regardless of current working directory
_backend_dir = Path(__file__).resolve().parents[2]
_env_path = _backend_dir / ".env"
load_dotenv(dotenv_path=_env_path)

# Priority color mapping for Discord embeds
PRIORITY_COLORS = {
    "Low": 0x3B82F6,      # Blue
    "Medium": 0xFBBF24,   # Safety Amber
    "High": 0xF97316,     # Repair Orange
    "Critical": 0xEF4444, # Alert Red
}


def send_discord_issue_alert(issue: Any, asset: Any) -> bool:
    """
    Send a real-time notification to Discord #fix-alerts channel via incoming webhook.

    Includes:
    - Issue ID
    - Problem Title & Description
    - Priority
    - Asset Tag
    - Asset Location & Name
    - Current Status

    Safety rules:
    - Fails silently with a logged message if DISCORD_WEBHOOK_URL is unset.
    - Times out after 5.0 seconds so it never hangs the API.
    - Catches all network/HTTP exceptions so issue creation is NEVER blocked.
    - NEVER prints or exposes the actual webhook URL in logs.
    """
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL", "").strip()

    if not webhook_url:
        logger.info(
            f"Discord alert skipped for Issue #{getattr(issue, 'id', 'N/A')}: "
            "DISCORD_WEBHOOK_URL is not configured in environment."
        )
        return False

    # Extract asset and issue attributes safely
    issue_id = getattr(issue, "id", "N/A")
    title = getattr(issue, "title", "Untitled Issue")
    description = getattr(issue, "description", "")
    priority = getattr(issue, "priority", "Medium")
    status = getattr(issue, "status", "Reported")

    asset_tag = getattr(asset, "asset_tag", "UNKNOWN")
    asset_name = getattr(asset, "name", "Equipment")
    location = getattr(asset, "location", "Unknown Location")

    embed_color = PRIORITY_COLORS.get(priority, 0xF97316)

    # Simple, high-readability Discord webhook payload
    payload = {
        "username": "FixTag Alerts",
        "content": f"🚨 **New Equipment Issue Reported: #{issue_id}**",
        "embeds": [
            {
                "title": f"#{asset_tag} — {title}",
                "description": description if description else "*No detailed description provided.*",
                "color": embed_color,
                "fields": [
                    {"name": "Issue ID", "value": f"#{issue_id}", "inline": True},
                    {"name": "Status", "value": status, "inline": True},
                    {"name": "Priority", "value": priority, "inline": True},
                    {"name": "Asset Tag", "value": f"#{asset_tag}", "inline": True},
                    {"name": "Equipment", "value": asset_name, "inline": True},
                    {"name": "Location", "value": location, "inline": True},
                ],
                "footer": {
                    "text": "FixTag Maintenance Layer • Physical QR Triage"
                }
            }
        ]
    }

    try:
        # Use short timeout so external latency never slows down the user
        response = httpx.post(webhook_url, json=payload, timeout=5.0)

        if response.status_code in (200, 204):
            logger.info(f"Discord alert dispatched successfully for Issue #{issue_id}.")
            return True
        else:
            # Mask URL: log status code only
            logger.error(
                f"Discord webhook responded with HTTP {response.status_code} "
                f"for Issue #{issue_id}. Response: {response.text[:200]}"
            )
            return False

    except Exception as exc:
        # Mask URL: log exception type and description only
        logger.error(
            f"Failed to dispatch Discord alert for Issue #{issue_id}: "
            f"{exc.__class__.__name__}: {str(exc)}"
        )
        return False
