import os
import time
import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth

load_dotenv()

HERE_CLIENT_ID = os.getenv("HERE_CLIENT_ID")
HERE_CLIENT_SECRET = os.getenv("HERE_CLIENT_SECRET")

# ===========================
# HERE AUTH
# ===========================

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


# ===========================
# POLYLINE DECODER
# (HERE Flexible Polyline)
# ===========================

# Official HERE flexible polyline decoder (safe + correct)
def decode_flexible_polyline(encoded):
    import math

    def _to_value(char):
        return ord(char) - 63

    precision = 5
    index = 0
    shift = 0
    result = 0
    coordinates = []
    lat = 0
    lng = 0

    # decode header
    header = _to_value(encoded[index])
    index += 1

    precision = math.pow(10, (header >> 3) & 0x0f)

    header = header >> 4

    while index < len(encoded):
        shift = 0
        result = 0

        # latitude
        while True:
            b = _to_value(encoded[index])
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break

        delta_lat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += delta_lat

        # longitude
        shift = 0
        result = 0
        while True:
            b = _to_value(encoded[index])
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break

        delta_lng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += delta_lng

        coordinates.append((lat / precision, lng / precision))

    return coordinates


# ===========================
# GET ROUTES
# ===========================

HERE_ROUTE_URL = "https://router.hereapi.com/v8/routes"


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

        # Decode properly (HERE gives encoded flexible polyline)
        encoded_polyline = section["polyline"]
        coords = decode_flexible_polyline(encoded_polyline)

        # Format instructions properly
        instructions = []
        for step in section.get("instructions", []):
            instructions.append({
                "text": step.get("text", ""),
                "distance_m": step.get("length", 0),
                "time_s": step.get("duration", 0),
                "offset": step.get("offset", 0),
            })

        all_routes.append({
            "distance_m": section["summary"]["length"],
            "duration_s": section["summary"]["duration"],
            "coords": coords,
            "instructions": instructions,
        })

    return all_routes