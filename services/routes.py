import requests
import os
from dotenv import load_dotenv

load_dotenv()

GRAPHOPPER_API_KEY = os.getenv("GRAPHOPPER_API_KEY") 

def get_routes(start_lat, start_lon, end_lat, end_lon):
    url = (
    "https://graphhopper.com/api/1/route?"
    f"point={start_lat},{start_lon}"
    f"&point={end_lat},{end_lon}"
    "&profile=foot"
    "&locale=en"
    "&calc_points=true"
    "&instructions=true"
    "&points_encoded=false"

    # enables alternative routes
    "&ch.disable=true"
    "&algorithm=alternative_route"
    "&alternative_route.max_paths=3"

    f"&key={GRAPHOPPER_API_KEY}"
    )

    res = requests.get(url).json()
    print("Number of routes returned:", len(res["paths"]))

    if "paths" not in res or len(res["paths"]) == 0:
        print("GraphHopper ERROR:", res)
        return []

    optimal_routes = []

    for p in res["paths"]:

        # graphhopper returns [lon, lat]
        coords = [(lat, lon) for lon, lat in p["points"]["coordinates"]]

        # instructions for graphhopper
        instructions = []
        for instr in p["instructions"]:
            instructions.append({
                "text": instr["text"],
                "interval": instr["interval"],
                "distance_m": instr["distance"],
                "time_s": instr["time"] / 1000
            })

        optimal_routes.append({
            "distance_m": p["distance"],
            "duration_s": p["time"] / 1000,
            "coords": coords,
            "instructions": instructions
        })

    return optimal_routes
