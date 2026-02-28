from fastapi import APIRouter
from services.routes import get_routes
from services.exposure import route_exposure
from services.get_alts import get_alternative_routes  

router = APIRouter(prefix="/travel")

@router.get("/eco-route")
def eco_route(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float
):
    routes = get_alternative_routes(start_lat, start_lon, end_lat, end_lon)
    print("total routes check:", len(routes)) # check number of routes found

    if not routes:
        return {"error": "No walking routes found."}

    scored_routes = []

    for r in routes:
        exposure = route_exposure(r["coords"])
        duration_min = round(r["duration_s"] / 60, 1) # convert duration to minutes, and round to 1 d.p

        scored_routes.append({
            "distance_m": round(r["distance_m"], 1),
            "duration_min": duration_min,
            "exposure": exposure, # raw exposure value, not for frontend
            "front_AQI": round(exposure / duration_min / 60, 2), # exposure over diration seconds
            "coords": r["coords"], 
            "instructions": r["instructions"]
        })
    # find route with the minimum exposure
    best_route = min(scored_routes, key=lambda r: r["front_AQI"])

    return {"best_route": best_route,
            "alternatives": scored_routes
            }