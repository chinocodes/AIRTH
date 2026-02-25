import time
from services.aqi_fetcher import fetch_live_aqi

CACHE_DURATION = 900  # 15 min 
AQI_STATIONS = []
LAST_FETCH = 0

def get_aqi_stations(lat, lon):
    global AQI_STATIONS, LAST_FETCH

    now = time.time()
    # check if aqi stations array needs to be refreshed or if its empty
    if now - LAST_FETCH > CACHE_DURATION or len(AQI_STATIONS) == 0:
        AQI_STATIONS = fetch_live_aqi(lat, lon)
        LAST_FETCH = now
    # otherwise just return it as it is
    return AQI_STATIONS
