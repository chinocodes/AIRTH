from services.idw import idw
from services.aqi_data import get_aqi_stations
from services.idw import haversine

def route_exposure(coords, sample_every=10):
    if not coords:
        return 0

    start_lat, start_lon = coords[0]
    stations = get_aqi_stations(start_lat, start_lon)

    if not stations:
        return 0

    WALKING_SPEED = 1.4  # m/s 
    
    # sample every 10 coords

    sampled = coords[::sample_every]
    total_exposure = 0  # initialise total exposure

    for i in range(len(sampled) - 1):
        lat1, lon1 = sampled[i]
        lat2, lon2 = sampled[i+1]

        # distance in meters
        dist_m = haversine(lat1, lon1, lat2, lon2) * 1000 
        # calculate time to be used to get actual inhaled exposure 
        time_s = dist_m / WALKING_SPEED

        # midpoint particulate matter concentration
        mid_lat = (lat1 + lat2) / 2
        mid_lon = (lon1 + lon2) / 2
        pm25 = idw(mid_lat, mid_lon, stations)

        # scientifially accurate exposure calculation
        # calculates inhaled exposure by incorporating time spent in exposure
        # aqi as concentration of pollutant
        total_exposure += pm25 * time_s

    return round(total_exposure, 2)