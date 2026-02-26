import os
import time
import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth

load_dotenv()

HERE_CLIENT_ID = os.getenv("HERE_CLIENT_ID")
HERE_CLIENT_SECRET = os.getenv("HERE_CLIENT_SECRET")


# here auth


HERE_TOKEN_URL = "https://account.api.here.com/oauth2/token"

here_token = None
here_token_expiry = 0


def get_here_token(client_id, client_secret):
    data = {"grant_type": "client_credentials"}
    auth = HTTPBasicAuth(client_id, client_secret)

    res = requests.post(HERE_TOKEN_URL, data=data, auth=auth).json()
    return res["access_token"], time.time() + res["expires_in"]


def get_cached_token():
    global here_token, here_token_expiry

    if (not here_token) or (time.time() >= here_token_expiry):
        here_token, here_token_expiry = get_here_token(
            HERE_CLIENT_ID, HERE_CLIENT_SECRET
        )

    return here_token


# routing function

HERE_ROUTE_URL = "https://router.hereapi.com/v8/routes"


def decode_polyline(polyline):
    """HERE returns GeoJSON-like polyline: list of [lat, lon]"""
    # Ensure it's always (lat, lon)
    return [(pt[0], pt[1]) for pt in polyline]


def get_routes(start_lat, start_lon, end_lat, end_lon, alternatives=2):
    token = get_cached_token()
    headers = {"Authorization": f"Bearer {token}"}

    params = {
        "transportMode": "pedestrian",
        "origin": f"{start_lat},{start_lon}",
        "destination": f"{end_lat},{end_lon}",
        "alternatives": alternatives,
        "return": "polyline,summary,instructions",
    }

    res = requests.get(HERE_ROUTE_URL, headers=headers, params=params).json()

    if "routes" not in res or len(res["routes"]) == 0:
        print("HERE ERROR:", res)
        return []

    all_routes = []

    for route in res["routes"]:
        section = route["sections"][0]

        # polyline is already a list of [lat, lon]
        coords = decode_polyline(section["polyline"])

        # Convert instructions to your format
        instructions = []
        for instr in section.get("instructions", []):
            instructions.append({
                "text": instr.get("text", ""),
                "interval": instr.get("offset", 0),
                "distance_m": instr.get("length", 0),
                "time_s": instr.get("duration", 0)
            })

        all_routes.append({
            "distance_m": section["summary"]["length"],
            "duration_s": section["summary"]["duration"],
            "coords": coords,
            "instructions": instructions
        })

    return all_routes