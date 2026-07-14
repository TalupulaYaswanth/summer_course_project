import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from .database import engine, Base
from .api.endpoints import router

# Load environment configs
load_dotenv()

# Create SQLite database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CodeExplain API",
    description="Backend API powering the CodeExplain Plain-English AI Code Tutor.",
    version="1.0.0"
)

# CORS configurations for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routes
app.include_router(router)

# Serve Frontend static assets if built folder exists
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIR):
    # Mount assets folder
    assets_dir = os.path.join(FRONTEND_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Index page
    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

    # Catch-all fallback route for React Router client side paths
    @app.get("/{catchall:path}")
    def serve_catchall(catchall: str):
        # Exclude Swagger/API docs and endpoints
        if catchall.startswith(("auth/", "explain", "history", "docs", "openapi.json", "redoc")):
            return None
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"status": "healthy", "service": "CodeExplain API (Frontend static files not built)"}
