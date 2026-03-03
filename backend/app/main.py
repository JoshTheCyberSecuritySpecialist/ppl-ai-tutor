from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import router as api_router
from app.auth import router as auth_router
from app.ai import router as ai_router
from app.sessions import router as sessions_router
from app.analytics import router as analytics_router

app = FastAPI(title="PPL AI Tutor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(api_router)
app.include_router(ai_router)
app.include_router(sessions_router)
app.include_router(analytics_router)

@app.get("/health")
def health():
    return {"ok": True}