import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.api import router as api_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CreatorOS API Backend",
    description="Business logic, AI integration, and PDF compiling for CreatorOS",
    version="1.0.0"
)

# ── CORS Policy ───────────────────────────────────────────────────────────────
# In production (Render) set FRONTEND_ORIGIN to the frontend service URL,
# e.g. https://creatoros-frontend.onrender.com
# In dev it falls back to localhost:3000 (Next.js default dev port).
_frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API Router
app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CreatorOS API Engine",
        "docs": "/docs"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
