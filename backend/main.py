from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import DateTime, inspect, text
import os
from dotenv import load_dotenv

from .database.db import Base, engine
from .middleware import RequestMetadataMiddleware

from .routers.auth_routers import auth_router
from .routers.teacher_routers import teacher_read, teacher_create, teacher_update
from .routers.admin_routers import admin_create, admin_read, admin_update, admin_delete
from .routers.student_routers import student_read

load_dotenv()

# For quick local dev only. In production, use Alembic migrations instead.
Base.metadata.create_all(bind=engine)
if "attendance" in inspect(engine).get_table_names():
    attendance_columns = {column["name"] for column in inspect(engine).get_columns("attendance")}
    if "marked_at" not in attendance_columns:
        marked_at_type = str(DateTime().compile(dialect=engine.dialect))
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE attendance ADD COLUMN marked_at {marked_at_type} NULL"))

if "teacher" in inspect(engine).get_table_names():
    teacher_columns = inspect(engine).get_columns("teacher")
    dept_column = next((column for column in teacher_columns if column["name"] == "dept_id"), None)
    if dept_column and not dept_column["nullable"]:
        with engine.begin() as connection:
            if engine.dialect.name == "postgresql":
                connection.execute(text("ALTER TABLE teacher ALTER COLUMN dept_id DROP NOT NULL"))
            elif engine.dialect.name == "mysql":
                connection.execute(text("ALTER TABLE teacher MODIFY COLUMN dept_id INTEGER NULL"))

app = FastAPI(
    title="College Attendance Management System",
    description="Centralized attendance API for Admin, Teacher and Student roles.",
    version="1.0.0",
)

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
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
app.include_router(admin_update.router)
app.include_router(admin_delete.router)

app.include_router(teacher_read.router)
app.include_router(teacher_create.router)
app.include_router(teacher_update.router)

app.include_router(student_read.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
