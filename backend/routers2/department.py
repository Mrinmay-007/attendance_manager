

# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Department
# from db import get_db
# from methods.oauth2 import get_current_student,get_current_faculty,get_current_admin


# router = APIRouter(
#     prefix="/department",
#     tags=["Department"]
# )


# # =============================================================================
# # , get_current_user: schemas.Teacher = Depends(get_current_admin)
# # ==========================
# # Departments Route
# # ==========================


# @router.get("/")
# def get_departments(response: Response, db: Session = Depends(get_db)):

#     departments = db.query(Department).all()
#     result = []
#     for dept in departments:
#         result.append({
#             "id": dept.Did,
#             "dep": dept.dep,
#             "role": dept.role
#         })
    
#     total = len(result)
    
#     # Example: Content-Range: items 0-9/100
#     response.headers["Content-Range"] = f"departments 0-{total-1}/{total}"
#     return result

# @router.post("/", status_code=status.HTTP_201_CREATED)
# async def create_department(dept: schemas.Department, db: Session = Depends(get_db)):
#     new_dept = models.Department(dep=dept.dep, role=dept.role)
#     db.add(new_dept)
#     db.commit()
#     db.refresh(new_dept)
#     return {
#             "id": new_dept.Did,
#             "dep": new_dept.dep,
#             "role": new_dept.role
#         }

# @router.put("/{id}")
# def update_department(id: int, updated: schemas.Department, db: Session = Depends(get_db)):
#     dept = db.query(Department).filter(Department.Did == id).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Not found")
#     dept.dep = updated.dep #type: ignore
#     dept.role = updated.role #type: ignore
#     db.commit()
#     return {
#             "id": dept.Did,
#             "dep": dept.dep,
#             "role": dept.role
#         }

# @router.get("/{id}")
# def get_department(id: int, db: Session = Depends(get_db)):
#     dept = db.query(Department).filter(Department.Did == id).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Not found")
#     return {
#             "id": dept.Did,
#             "dep": dept.dep,
#             "role": dept.role
#         }

# @router.delete("/{id}")
# def delete_department(id: int, db: Session = Depends(get_db)):
#     dept = db.query(Department).filter(Department.Did == id).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
#     db.delete(dept)
#     db.commit()
#     return {"data": {"id": id}}  # React Admin expects 'data' with 'id'


