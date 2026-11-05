"""One door to the College Football Data API.

Python is the only thing that reads CFBD_API_KEY. The key stays in .env.local
or the GitHub Actions secret. This module adds the bearer token, retries a
failed request, saves the raw response under data/raw/cfbd, and stops when the
monthly call budget gets low.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.collegefootballdata.com"
RAW = ROOT / "data" / "raw" / "cfbd"
MIN_REMAINING = 300


def load_key() -> str:
    """Read the key from the environment, then .env.local, then .env."""
    if os.environ.get("CFBD_API_KEY", "").strip():
        return os.environ["CFBD_API_KEY"].strip().strip('"').strip("'")
    for name in (".env.local", ".env"):
        path = ROOT / name
        if not path.exists():
            continue
        for line in path.read_text().splitlines():
            if line.startswith("CFBD_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


class BudgetStop(SystemExit):
    """Raised when fewer than 300 calls are left, so a run cannot drain the month."""


class CfbdClient:
    def __init__(self, key: str, minimum_remaining: int = MIN_REMAINING):
        if not key:
            raise SystemExit("CFBD_API_KEY is missing. Add it to .env.local. The build will not fall back to ESPN.")
        self.key = key
        self.minimum_remaining = minimum_remaining
        self.calls = 0
        self.remaining = self._read_budget()

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.key}"}

    def _read_budget(self) -> int:
        response = self._request("/info")
        info = response.json()
        remaining = int(info.get("remainingCalls") or 0)
        tier = info.get("tierName") or "unknown"
        print(f"CFBD {tier} tier, {remaining} calls left this month.")
        if remaining < self.minimum_remaining:
            raise BudgetStop(f"Stopping. Only {remaining} CFBD calls remain, under the {self.minimum_remaining} floor.")
        return remaining

    def _request(self, path: str, params: dict | None = None) -> requests.Response:
        if self.calls and self.remaining - self.calls < self.minimum_remaining:
            raise BudgetStop(f"Stopping before {path}. Calls left would drop under {self.minimum_remaining}.")
        last_error: Exception | None = None
        for attempt in range(4):
            try:
                response = requests.get(f"{API}{path}", params=params or {}, headers=self._headers(), timeout=120)
            except requests.RequestException as exc:
                last_error = exc
                time.sleep(2**attempt)
                continue
            self.calls += 1
            if response.status_code in {429, 500, 502, 503, 504} and attempt < 3:
                time.sleep(2**attempt)
                continue
            if response.status_code >= 400:
                raise SystemExit(f"CFBD {path} returned {response.status_code}: {response.text[:180]}")
            return response
        raise SystemExit(f"CFBD {path} failed after retries: {last_error}")

    def get(self, path: str, params: dict | None = None, *, refresh: bool = True):
        """Return JSON. A cached file is reused when refresh is false."""
        cache = RAW / _cache_name(path, params or {})
        if cache.exists() and not refresh:
            return json.loads(cache.read_text())
        payload = self._request(path, params).json()
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_text(json.dumps(payload))
        return payload


def _cache_name(path: str, params: dict) -> str:
    parts = [path.strip("/").replace("/", "-") or "root"]
    for key in sorted(params):
        parts.append(f"{key}-{params[key]}")
    return "--".join(parts) + ".json"
