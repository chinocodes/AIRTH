import requests
import os
from dotenv import load_dotenv

load_dotenv()

WAQI_BOUNDS_URL = "https://api.waqi.info/map/bounds/"
WAQI_TOKEN = os.getenv("WAQI_TOKEN")  

def fetch_live_aqi(lat, lon, box_size=0.1):
    
    # fetches dozens of aqi stations found around the (lat, lon)

    # creatr bounding box (lat/lon ± box_size)
    # box_size=0.1 ≈ ~11km;
    lat1 = lat - box_size
    lat2 = lat + box_size
    lon1 = lon - box_size
    lon2 = lon + box_size

    params = {
        "token": WAQI_TOKEN,
        "latlng": f"{lat1},{lon1},{lat2},{lon2}"
    }

    try:
        res = requests.get(WAQI_BOUNDS_URL, params=params, timeout=10).json()
    except Exception as e:
        print("WAQI bounds fetch error:", e)
        return []

    if res.get("status") != "ok":
        print("WAQI error:", res)
        return []

    stations = []
    for item in res.get("data", []):
        if "aqi" not in item:
            continue
        try:
            aqi_value = int(item["aqi"])
        except:
            continue

        stations.append({
            "lat": item["lat"],
            "lon": item["lon"],
            "aqi": aqi_value
        })

    print(f"[AQI] Loaded {len(stations)} stations from WAQI bounds.")
    return stations
