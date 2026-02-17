from services.idw import idw
from services.aqi_data import get_aqi_stations

def route_exposure(coords, sample_every=10):
    if not coords:
        return 000

    start_lat, start_lon = coords[0]

    stations = get_aqi_stations(start_lat, start_lon)

    if not stations:
        print("No stations found, fallback AQI=000")
        return 000

    sampled = coords[::sample_every]

    aqi_values = [idw(lat, lon, stations) for lat, lon in sampled] # applies idw to each 

    return round(sum(aqi_values) / len(aqi_values), 2)
