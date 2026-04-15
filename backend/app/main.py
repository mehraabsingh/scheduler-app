import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, routers
from .database import engine
from dotenv import load_dotenv

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Scheduling Platform API")

# Read FRONTEND_URL from env; allow multiple origins separated by comma
# Default includes both local dev and the deployed Vercel URL
_frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000,https://scheduler-app-flame-pi.vercel.app"
)
origins = [o.strip() for o in _frontend_url.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Scheduling App Server"}

app.include_router(routers.event_types.router, prefix="/api")
app.include_router(routers.bookings.router, prefix="/api")
app.include_router(routers.availabilities.router, prefix="/api")
