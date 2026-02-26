from services.jitter import jitter_point
from services.routes import get_routes

def get_alternative_routes(start_lat, start_lon, end_lat, end_lon, count=3):
    routes = []
    base = get_routes(start_lat, start_lon, end_lat, end_lon)
    if base:
        routes.append(base[0])
    for _ in range(count):
        j_s_lat, j_s_lon = jitter_point(start_lat, start_lon)
        j_e_lat, j_e_lon = jitter_point(end_lat, end_lon)
        alt = get_routes(j_s_lat, j_s_lon, j_e_lat, j_e_lon)
        if alt:
            routes.append(alt[0])
    return routes
