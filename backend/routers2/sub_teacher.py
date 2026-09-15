
# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Teacher
# from db import get_db


# router = APIRouter(
#     prefix="/sub_teacher",
#     tags=["Subject-Teacher"]
# )


# @router.post("/")
# def create_sub_teacher(sub_tech: schemas.SubjectTeacher, db: Session = Depends(get_db)):

#     # ✅ Extract codes from input strings like "C++ (CSBS203)"
#     if not sub_tech.subject or not sub_tech.teacher:
#         raise HTTPException(status_code=400, detail="Subject or teacher cannot be None")
#     try:
#         sub_code = sub_tech.subject.split("(")[1].strip(" )")  # CSBS203
#         name_code = sub_tech.teacher.split("(")[1].strip(" )") # hl2
#     except IndexError:
#         raise HTTPException(status_code=400, detail="Invalid subject or teacher format")

#     # ✅ Find subject by code
#     sub = db.query(models.Subject).filter(models.Subject.sub_code == sub_code).first()
#     if not sub:
#         raise HTTPException(status_code=404, detail="Subject not found")

#     # ✅ Find teacher by code
#     tech = db.query(models.Teacher).filter(models.Teacher.name_code == name_code).first()
#     if not tech:
#         raise HTTPException(status_code=404, detail="Teacher not found")
    
#     # ✅ Check if mapping exists
#     existing = db.query(models.SubjectTeacher).filter(
#         models.SubjectTeacher.Sub_id == sub.Sub_id,
#         models.SubjectTeacher.Tid == tech.Tid
#     ).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="This teacher is already assigned to the subject")

#     # ✅ Create new mapping
#     new_sub_tech = models.SubjectTeacher(
#         Sub_id=sub.Sub_id,
#         Tid=tech.Tid
#     )
#     db.add(new_sub_tech)
#     db.commit()
#     db.refresh(new_sub_tech)

#     return {
#         "id": new_sub_tech.STid,
#         "subject": f"{sub.sub_name} ({sub.sub_code})",
#         "teacher": f"{tech.name} ({tech.name_code})"
#     }


# @router.get("/")
# def get_all_sub_teacher(response: Response, db: Session = Depends(get_db)):
#     mappings = db.query(models.SubjectTeacher).all()

#     result = []
#     for m in mappings:
#         result.append({
#             "id": m.STid,  # this will be the value sent to backend
#             "subject": f"{m.subject.sub_name} ({m.subject.sub_code})",
#             "teacher": f"{m.teacher.name} ({m.teacher.name_code})",
#             "dep": m.subject.department.dep,
#             "year": m.subject.year,
#             "sem": m.subject.sem
#         })

#     # ✅ Required for React-Admin list queries
#     total = len(result)
#     response.headers["Content-Range"] = f"sub_teacher 0-{total-1}/{total}"

#     return result


# @router.delete("/{id}")
# def delete_sub_teacher(id: int, db: Session = Depends(get_db)):
#     sub_tech = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.STid == id).first()
#     if not sub_tech:
#         raise HTTPException(status_code=404, detail="Subject-Teacher mapping not found")

#     db.delete(sub_tech)
#     db.commit()
#     return {"data":{"id":id}}


# @router.put("/{id}")
# async def edit_sub_teacher(id: int, updated: schemas.SubjectTeacher, db: Session = Depends(get_db)):
#     sub_tech = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.STid == id).first()
#     if not sub_tech:
#         raise HTTPException(status_code=404, detail="Subject-Teacher mapping not found")
    
#     # Parse subject code from updated.subject string, e.g. "C++ (CSBS203)"
#     try:
#         subject_code = updated.subject.split("(")[1].strip(" )") #type:ignore
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid subject format")

#     # Parse teacher code from updated.teacher string, e.g. "hello ( hl2 )"
#     try:
#         teacher_code = updated.teacher.split("(")[1].strip(" )") #type:ignore
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid teacher format")

#     # Fetch Sub_id from subject table by code
#     subject = db.query(models.Subject).filter(models.Subject.sub_code == subject_code).first()
#     if not subject:
#         raise HTTPException(status_code=404, detail="Subject not found")

#     # Fetch Tid from teacher table by some teacher_code field (adjust field name accordingly)
#     teacher = db.query(models.Teacher).filter(models.Teacher.name_code == teacher_code).first()
#     if not teacher:
#         raise HTTPException(status_code=404, detail="Teacher not found")

#     # Update fields
#     sub_tech.Sub_id = subject.Sub_id
#     sub_tech.Tid = teacher.Tid

#     db.commit()
#     db.refresh(sub_tech)

#     return {
#         "id": sub_tech.STid,
#         "subject": f"{subject.sub_name} ({subject.sub_code})",
#         "teacher": f"{teacher.name} ({teacher.name_code})",
#         "dep": sub_tech.subject.department.dep,
#         "year": sub_tech.subject.year,
#         "sem": sub_tech.subject.sem
#     }

    
# @router.get("/{id}")
# def get_sub_teacher(id: int, db: Session = Depends(get_db)):
#     sub_tech = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.STid == id).first()
#     if not sub_tech:
#         raise HTTPException(status_code=404, detail="Subject-Teacher mapping not found")

#     return {
#         "id": sub_tech.STid,
#         "subject": f"{sub_tech.subject.sub_name} ({sub_tech.subject.sub_code})",
#         "teacher": f"{sub_tech.teacher.name} ({sub_tech.teacher.name_code})",
#         "dep": sub_tech.subject.department.dep,
#         "year": sub_tech.subject.year,
#         "sem": sub_tech.subject.sem
#     }