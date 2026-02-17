from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

@router.get("/save-city")
def save_city(city: str):
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
    API_KEY = open("api_key", "r").read()

    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"
    res = requests.get(url).json()

    if res.get("cod") != 200:
        raise HTTPException(status_code=400, detail="City not found")
    
    

    return {
        "city": city,
        "temp": res["main"]["temp"]
    }
