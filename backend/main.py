from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from .database.db import Base, engine
from .middleware import RequestMetadataMiddleware

from .routers.auth_routers import auth_router
from .routers.teacher_routers import teacher_read, teacher_create
from .routers.admin_routers import admin_create, admin_read
from .routers.student_routers import student_read

load_dotenv()

# For quick local dev only. In production, use Alembic migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="College Attendance Management System",
    description="Centralized attendance API for Admin, Teacher and Student roles.",
    version="1.0.0",
)

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(RequestMetadataMiddleware)


app.include_router(auth_router.router)

app.include_router(admin_create.router)
app.include_router(admin_read.router)

app.include_router(teacher_read.router)
app.include_router(teacher_create.router)

app.include_router(student_read.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
