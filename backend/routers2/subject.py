
# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Subject
# from db import get_db

# router = APIRouter(
#     prefix="/subject",
#     tags=["Subject"]
# )

# # ==========================
# # subject Route
# # ==========================


# # ===========================================

# @router.post("/", status_code=status.HTTP_201_CREATED)
# def add_subject(sub: schemas.Subject, db: Session = Depends(get_db)):
#     # ✅ Lookup by Did instead of dep
#     dept = db.query(models.Department).filter(
#         models.Department.Did == sub.Did,
#         models.Department.role == "Student"  # Optional if you only want student depts
#     ).first()

#     if not dept:
#         raise HTTPException(status_code=404, detail="Department with this role not found")

#     new_sub = models.Subject(
#         Did=sub.Did,
#         sub_name=sub.sub_name,
#         sub_code=sub.sub_code,
#         year=sub.year,
#         sem=sub.sem,
#     )
#     db.add(new_sub)
#     db.commit()
#     db.refresh(new_sub)

#     return {
#         "id": new_sub.Sub_id,
#         "sub_name": new_sub.sub_name,
#         "sub_code": new_sub.sub_code,
#         "dep": dept.dep,  # ✅ Return department name for UI
#         "year": new_sub.year,
#         "sem": new_sub.sem,
#     }

# @router.get("/")
# def get_subject(response: Response, db: Session = Depends(get_db)):
#     subj = db.query(models.Subject).all()
#     result = []
#     for sub in subj:
#         result.append({
#             "id": sub.Sub_id,
#             "sub_name": sub.sub_name,
#             "sub_code": sub.sub_code,
#             "dep": sub.department.dep,
#             "year": sub.year,
#             "sem": sub.sem,
#         })
#     total = len(result)
#     response.headers["Content-Range"] = f"subjects 0-{total-1}/{total}"  # fix resource name
#     return result

# @router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_subject(id: int, db: Session = Depends(get_db)):
#     sub = db.query(models.Subject).filter(models.Subject.Sub_id == id).first()
#     if not sub:
#         raise HTTPException(status_code=404, detail="Subject not found")
    
#     db.delete(sub)
#     db.commit()
#     return {"data":{"id":id}}

# @router.put("/{id}")
# async def update_subject(id: int, updated: schemas.Subject, db: Session = Depends(get_db)):
#     sub = db.query(models.Subject).filter(models.Subject.Sub_id == id).first()
#     if not sub:
#         raise HTTPException(status_code=404, detail="Subject not found")
    
#     dept = db.query(models.Department).filter(models.Department.dep == updated.dep).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department with this name not found")
#     if dept in ['Admin','Teacher']:
#         raise HTTPException(status_code=404, detail="Student department Not Found ")
        
    
#     # Update fields
#     sub.Did = dept.Did
#     sub.sub_name = updated.sub_name #type:ignore
#     sub.sub_code = updated.sub_code #type:ignore
#     sub.year = updated.year #type:ignore
#     sub.sem = updated.sem #type:ignore

#     db.commit()
   

#     return {
#         "id": sub.Sub_id,
#         "sub_name": sub.sub_name,
#         "sub_code": sub.sub_code,
#         "dep": dept.dep,
#         "year": sub.year,
#         "sem": sub.sem,
#     }

# @router.get("/{id}")
# def get_subject_by_id(id: int, db: Session = Depends(get_db)):
#     sub = db.query(models.Subject).filter(models.Subject.Sub_id == id).first()
#     if not sub:
#         raise HTTPException(status_code=404, detail="Subject not found")
    
#     dept = db.query(models.Department).filter(models.Department.Did == sub.Did).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
    
#     return {
#         "id": sub.Sub_id,
#         "sub_name": sub.sub_name,
#         "sub_code": sub.sub_code,
#         "dep": dept.dep,
#         "year": sub.year,
#         "sem": sub.sem,
#     }
