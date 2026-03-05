import requests
import os
from dotenv import load_dotenv

load_dotenv()

WAQI_BOUNDS_URL = "https://api.waqi.info/map/bounds/"
WAQI_TOKEN = os.getenv("WAQI_TOKEN")  

def fetch_live_pm25(lat, lon, box_size=0.1):

    # fetches stations around the given coordinates

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

        # ensure PM2.5 data exists
        pm25 = None

        try:
            pm25 = float(item["iaqi"]["pm25"]["v"])
        except:
            continue  # skip stations without PM2.5

        stations.append({
            "lat": item["lat"],
            "lon": item["lon"],
            "pm25": pm25
        })

    print(f"[PM2.5] Loaded {len(stations)} stations from WAQI bounds.")
    return stations