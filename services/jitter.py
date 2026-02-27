import random
import math

def jitter_point(lat, lon, meters=30): # forces graphhoper to provide alternatives by slightly shifting coords
    d_lat = meters / 111111 # convert metre to degree of latitude
    d_lon = meters / (111111 * abs(math.cos(math.radians(lat))) + 1e-9) # convert metres to degree of latitude accounting for earths curvature
    return (
        lat + random.uniform(-d_lat, d_lat), #shift coords randomly within a 30x30 m square
        lon + random.uniform(-d_lon, d_lon)
    )