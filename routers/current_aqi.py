# from fastapi import APIRouter
# from services.aqi_data import get_aqi_stations
# from services.idw import idw

# router = APIRouter(prefix="/aqi")

# @router.get("/current")
# def current_aqi(lat: float, lon: float):
#     stations = get_aqi_stations()

#     if not stations:
#         return {"aqi": 50}  # fallback

#     aqi_value = idw(lat, lon, stations)
#     return {"aqi": round(aqi_value, 2)}
