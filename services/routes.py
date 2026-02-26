import os
import requests
from dotenv import load_dotenv
import polyline

load_dotenv()

MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")

MAPBOX_URL = "https://api.mapbox.com/directions/v5/mapbox/walking/" # set profile to walking


def decode_polyline(encoded):
    # decode polyline into lat lon pairs
    return polyline.decode(encoded)  # returns list of (lat, lon)


def get_routes(start_lat, start_lon, end_lat, end_lon, alternatives=True):
    # mapbox requires lon,lat order in the URL
    coords = f"{start_lon},{start_lat};{end_lon},{end_lat}"

    url = (
        f"{MAPBOX_URL}{coords}"
        f"?alternatives={'true' if alternatives else 'false'}"
        f"&geometries=polyline"
        f"&steps=true"
        f"&access_token={MAPBOX_TOKEN}"
    )

    res = requests.get(url).json()

    if "routes" not in res or len(res["routes"]) == 0:
        print("MAPBOX ERROR:", res)
        return []

    all_routes = []

    for r in res["routes"]:
        # Decode shape
        coords = decode_polyline(r["geometry"])

        # Parse turn-by-turn instructions
        instructions = []
        for leg in r["legs"]:
            for step in leg["steps"]:
                instructions.append({
                    "text": step["maneuver"]["instruction"],
                    "distance_m": step["distance"],
                    "time_s": step["duration"]
                })

        all_routes.append({
            "distance_m": r["distance"],
            "duration_s": r["duration"],
            "coords": coords,            # [(lat, lon)]
            "instructions": instructions
        })

    return all_routes