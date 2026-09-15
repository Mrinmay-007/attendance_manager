# # from urllib import response
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import os
# from .init_db import insert_defaults
# from .routers import department, teacher, student, subject,sub_teacher,slot,comp,authentication,attendance,routine,notice , helper,contacts
# # from fastapi.staticfiles import StaticFiles
# from .db import engine, Base

# app = FastAPI()
# Base.metadata.create_all(bind=engine)
# # ==========================
# # CORS setup
# # ==========================
# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     # "https://attnendance-app-296m.vercel.app"
#     # 'https://attnendance-app.vercel.app',
#     "https://attendx-dev.vercel.app",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
#     expose_headers=["Content-Range"]  # important
# )

# # app.mount("/static", StaticFiles(directory="uploads"), name="static")

# @app.on_event("startup")
# def startup():
#     # 1️⃣ Create tables
#     Base.metadata.create_all(bind=engine)

#     # 2️⃣ Insert default data
#     insert_defaults()
# # ==========================
# app.include_router(authentication.router)
# app.include_router(comp.router)
# app.include_router(department.router)
# app.include_router(teacher.router)
# app.include_router(student.router)
# app.include_router(subject.router)
# app.include_router(sub_teacher.router)
# app.include_router(slot.router)
# app.include_router(attendance.router)
# app.include_router(routine.router)
# app.include_router(notice.router)
# app.include_router(helper.router)
# app.include_router(contacts.router) 
    
# if __name__ == "__main__":
#     import uvicorn
#     port = int(os.environ.get("PORT", 8000))
#     uvicorn.run("main:app", host="0.0.0.0", port=port)