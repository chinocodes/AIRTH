import random
import math

def jitter_point(lat, lon, meters=15):
    d_lat = meters / 111111
    d_lon = meters / (111111 * abs(math.cos(math.radians(lat))) + 1e-9)
    return (
        lat + random.uniform(-d_lat, d_lat),
        lon + random.uniform(-d_lon, d_lon)
    )