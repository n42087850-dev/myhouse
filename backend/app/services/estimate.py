import json
from functools import lru_cache
from pathlib import Path

from app.schemas import RoomData


@lru_cache
def load_pricing(path: Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def calculate(rooms: list[RoomData], pricing: dict) -> dict:
    floor_total = 0.0
    wall_total = 0.0
    for r in rooms:
        floor_total += r.length * r.width
        wall = 2 * (r.length + r.width) * r.height - r.openings
        wall_total += max(0.0, wall)

    return {
        "total_floor_area_sqm": round(floor_total, 2),
        "total_wall_area_sqm": round(wall_total, 2),
        "total_estimated_cost_uzs": round(floor_total * pricing["price_per_sqm_uzs"], 2),
        "materials_estimate": {
            "laminate_sqm": round(floor_total * pricing["laminate_waste_factor"], 2),
            "putty_kg": round(wall_total * pricing["putty_kg_per_sqm"], 2),
            "paint_liters": round(
                wall_total / pricing["paint_coverage_sqm_per_liter"] * pricing["paint_coats"], 2
            ),
        },
    }
