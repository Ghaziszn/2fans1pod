"""Refresh red zone, the season files, and the College Football Data ratings.

The season build refuses to publish if the key is set and red zone or
defensive yards drop out. Ratings are skipped when no key is present.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.cfbd import load_key
from scripts.redzone import main as refresh_redzone
from scripts.build_season import main as build_season


if __name__ == "__main__":
    refresh_redzone()
    build_season()
    if load_key():
        from scripts.build_advanced import main as build_advanced
        from scripts.build_profile import main as build_profile

        build_advanced()
        build_profile()
    else:
        print("No CFBD key, so the rating files were left as they are.")
