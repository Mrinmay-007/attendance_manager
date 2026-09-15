# # routine_router.py

# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# import models, schemas
# from db import get_db

# router = APIRouter(
#     prefix="/routine",
#     tags=["Routine"]
# )

# @router.get("/{email}")
# def teacher_routines(email: str, db: Session = Depends(get_db)):
#     routines = (
#         db.query(models.Routine)
#         .join(models.SubjectTeacher, models.Routine.STid == models.SubjectTeacher.STid)
#         .join(models.Subject, models.SubjectTeacher.Sub_id == models.Subject.Sub_id)
#         .join(models.Teacher, models.SubjectTeacher.Tid == models.Teacher.Tid)
#         .filter(models.Teacher.email == email)
#         .all()
#     )

#     if not routines:
#         raise HTTPException(status_code=404, detail="No routines found for this teacher")

#     result = []
#     for r in routines:
#         result.append({
#             "routine_id": r.R_id,
#             "subject": r.subject_teacher.subject.sub_name,   # via relationships
#             "teacher": r.subject_teacher.teacher.name,
#             "teacher_code": r.subject_teacher.teacher.name_code, # via relationships
#             "department": r.subject_teacher.subject.department.dep,
#             "semester": r.subject_teacher.subject.sem,
#             "slot": r.Sl_id,
#             "day": r.day
#         })

#     return result


# @router.get("/{dep},{sem}")
# def get_routines(dep: str, sem: int, db: Session = Depends(get_db)):

#     # ✅ get department by name
#     dept = db.query(models.Department).filter(models.Department.dep == dep).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")

#     # ✅ get subjects for this dept and semester
#     subjects = db.query(models.Subject).filter(
#         models.Subject.Did == dept.Did,
#         models.Subject.sem == sem
#     ).all()

#     if not subjects:
#         raise HTTPException(status_code=404, detail="No subjects found for this department and semester")

#     subject_ids = [s.Sub_id for s in subjects]

#     # ✅ get routines sorted by day
#     routines = (
#         db.query(models.Routine)
#         .join(models.SubjectTeacher, models.Routine.STid == models.SubjectTeacher.STid)
#         .join(models.Subject, models.SubjectTeacher.Sub_id == models.Subject.Sub_id)
#         .join(models.Teacher, models.SubjectTeacher.Tid == models.Teacher.Tid)
#         .filter(models.Subject.Sub_id.in_(subject_ids))
#         .order_by(models.Routine.day.asc())   # <-- Sorting here
#         .all()
#     )

#     result = []
#     for r in routines:
#         result.append({
#             "routine_id": r.R_id,
#             "subject": r.subject_teacher.subject.sub_name,   # via relationships
#             "teacher": r.subject_teacher.teacher.name,
#             "teacher_code": r.subject_teacher.teacher.name_code, # via relationships
#             "slot": r.Sl_id,
#             "day": r.day
#         })

#     return result


# @router.post("/", status_code=status.HTTP_201_CREATED)
# def create_routine(routine: schemas.Routine, db: Session = Depends(get_db)):
    
#     dept = db.query(models.Department).filter(models.Department.dep == routine.dep).first()
#     new_routine = models.Routine(
#         Did = dept.Did, #type:ignore
#         STid = routine.STid,
#         Sl_id = routine.Sl_id,
#         day = routine.day
#     )
#     db.add(new_routine)
#     db.commit()
#     db.refresh(new_routine)
#     return {
#         "id": new_routine.R_id,
#         "Did": new_routine.Did,
#         "STid": new_routine.STid,
#         "Sl_id": new_routine.Sl_id,
#         "day": new_routine.day
#     }

# @router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_routine(id: int, db: Session = Depends(get_db)):
#     routine = db.query(models.Routine).filter(models.Routine.R_id == id).first()
#     if not routine:
#         raise HTTPException(status_code=404, detail="Routine not found")
#     db.delete(routine)
#     db.commit()
    
#     return {"detail": "Routine deleted successfully"}