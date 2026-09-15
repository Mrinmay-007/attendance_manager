# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from sqlalchemy.exc import IntegrityError
# from datetime import date 
# import models, schemas
# from db import get_db


# router  = APIRouter(
#     prefix="/attendance",
#     tags=["Attendance"]
# )




# @router.post("/", status_code=status.HTTP_201_CREATED)
# def add_attendance(attn: schemas.Attendance , db: Session = Depends(get_db)):
#     sub_tch = db.query(models.SubjectTeacher).filter(
#         models.SubjectTeacher.Tid == attn.Tid,
#         models.SubjectTeacher.Sub_id == attn.Sub_id  
#     ).first()
    
    
#     new_attn = models.Attendance(
#         STid = sub_tch.STid, #type:ignore
#         Sid = attn.Sid,
#         date = attn.date,
#         status = attn.status     
#     )
#     db.add(new_attn)
#     db.commit()
#     db.refresh(new_attn)
    
#     return {
#         "id" : new_attn.A_id,
#         "date": new_attn.date,
#         "status" :new_attn.status
#     }
    

# @router.get("/")
# async def get_attendance(stid: int, dt: date, db: Session = Depends(get_db)):
#     attn = (
#         db.query(
#             models.Attendance,
#             models.Student.name,
#             models.Student.u_roll,
#             models.Student.c_roll,
#             # models.Subject.sub_name 
#         )
#         .join(models.Student, models.Attendance.Sid == models.Student.Sid)
#         .filter(
#             models.Attendance.STid == stid,
#             models.Attendance.date == dt
#         )
#         .all()
#     )

#     return [
#         {
#             "id": at.Attendance.A_id,
#             "date": at.Attendance.date,
#             "name": at.name,
#             "u_roll": at.u_roll,
#             "c_roll": at.c_roll,
#             # "subject": at.sub_name,  
#             "status": at.Attendance.status
#         }
#         for at in attn
#     ]


# @router.put("/{id}")
# async def edit_attendance(id: int, update: schemas.AttendanceUpdate, db: Session = Depends(get_db)):
#     attendance = db.query(models.Attendance).filter(models.Attendance.A_id == id).first()
#     if attendance is None:
#         raise HTTPException(status_code=404, detail="Attendance record not found")

#     attendance.status = update.new_status  # type:ignore
#     db.commit()
#     return {
#         "id": attendance.A_id,
#         "date": attendance.date,
#         "status": attendance.status
#     }


