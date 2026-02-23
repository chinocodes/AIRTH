from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



# Import routers
from routers.auth import router as auth_router
from routers.weather import router as weather_router
from routers.travel import router as travel_router
from routers import goals



app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(weather_router)
app.include_router(travel_router)
app.include_router(goals.router)




