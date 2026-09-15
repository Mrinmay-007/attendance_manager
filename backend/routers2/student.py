

# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Student
# from db import get_db

# import json
# from methods.hashing import Hash
# router = APIRouter(
#     prefix="/student",
#     tags=["Student"]
# )

# with open("pw.json", "r") as file:
#     data = json.load(file)

# default_pw = data.get("student_password")
# # print(f"Default Password: {default_pw}")
# # ==========================
# # Student Route
# # ==========================



# @router.post("/", status_code=status.HTTP_201_CREATED)
# async def create_student(st: schemas.Student, db: Session = Depends(get_db)):
#     dept = db.query(models.Department).filter(
#         models.Department.dep == st.dep,   # <-- match by name
#         models.Department.role == "Student"
#     ).first()

#     if not dept:
#         raise HTTPException(status_code=404, detail="Department with role 'Student' not found")

#     new_student = models.Student(
#         Did=dept.Did,  # <-- use ID from DB
#         name=st.name,
#         email=st.email,
#         pw=Hash.bcrypt(default_pw),
#         u_roll=st.u_roll,
#         c_roll=st.c_roll,
#         year=st.year,
#         sem=st.sem
#     )

#     db.add(new_student)
#     db.commit()
#     db.refresh(new_student)

#     return {
#         "id": new_student.Sid,
#         # "role": dept.role,
#         "name": new_student.name,
#         "email": new_student.email,
#         "dep": dept.dep,
#         "u_roll": new_student.u_roll,
#         "c_roll": new_student.c_roll,
#         "year": new_student.year,
#         "sem": new_student.sem
#     }



# @router.get("/")
# async def get_students(response :Response,db: Session =Depends(get_db)):
#     students = db.query(Student).all()
#     # dept = db.query(models.Department).filter(models.Department.role == 'Student').all() #type:ignore

#     result =[]
#     for st in students :
#         result.append({
#             "id" :st.Sid,
#             "name": st.name,
#             "email" : st.email,
#             "u_roll" :st.u_roll,
#             "c_roll" : st.c_roll,
#             "dep" :st.department.dep if st.department else None,
#             "year" :st.year,
#             "sem" : st.sem,
#             "role" :st.department.role if st.department else None
#         })
#     total = len(result)
#     # For React Admin compatibility (optional)
#     response.headers["Content-Range"] = f"teachers 0-{total-1}/{total}"
#     return result
    

# @router.delete("/{id}")
# async def delete_student(id: int, db: Session = Depends(get_db)):
#     st = db.query(Student).filter(Student.Sid == id).first()
    
#     if not st:
#         raise HTTPException(status_code=404,detail='Student Not Found')
#     db.delete(st)
#     db.commit()
#     return {"data":{"id":id}}


# @router.put("/{id}")
# async def edit_student(id: int, updated: schemas.Student, db: Session = Depends(get_db)):
#     st = db.query(models.Student).filter(models.Student.Sid == id).first()
#     if not st:
#         raise HTTPException(status_code=404, detail="Student not found")

#     # Fetch department based on updated role
#     dept = db.query(models.Department).filter(models.Department.role == updated.role).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department with this role not found")
#     if dept.role not in ["Student"]:
#         raise HTTPException(status_code=403, detail="Access denied: Only Student role allowed")

#     old_email = st.email  # store current email

#     st.name = updated.name  # type: ignore

#     # If email changed, update email and password
#     if old_email != updated.email:  # type: ignore
#         st.email = updated.email  # type: ignore
#         # st.pw = updated.pw        # type: ignore
#         st.pw = Hash.bcrypt(default_pw)  # type: ignore

#     st.u_roll = updated.u_roll  # type: ignore
#     st.c_roll = updated.c_roll  # type: ignore
#     st.year = updated.year      # type: ignore
#     st.sem = updated.sem        # type: ignore
#     st.Did = dept.Did
#     st.role = dept.role

#     db.commit()

#     return {
#         "id": st.Sid,
#         "name": st.name,
#         "email": st.email,
#         "u_roll": st.u_roll,
#         "c_roll": st.c_roll,
#         "year": st.year,
#         "sem": st.sem,
#         "role": dept.role
#     }

    
# @router.get("/{id}")
# async def get_student(id: int, db: Session = Depends(get_db)):
#     st = db.query(models.Student).filter(models.Student.Sid == id).first()
#     if not st:
#         raise HTTPException(status_code=404, detail="Student not found")
    
#     # Fetch department based on Did foreign key
#     dept = db.query(models.Department).filter(models.Department.Did == st.Did).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
    
#     return {
#             "id" :st.Sid,
#             "name": st.name,
#             "email" : st.email,
#             # "pw" : st.pw,
#             "u_roll" :st.u_roll,
#             "c_roll" : st.c_roll,
#             "year" :st.year,
#             "sem" : st.sem,
#             "role" :dept.role
#     }


# # @router.get("/{email}")
# # async def get_student_details(email: str, db: Session = Depends(get_db)):
# #     st = db.query(models.Student).filter(models.Student.email == email).first()
# #     dept = db.query(models.Department).filter( models.Department.Did == st.Did).first() #type: ignore
# #     if not st:
# #         raise HTTPException(status_code=404, detail="Student not found")
    
# #     # Fetch department based on Did foreign key
# #     dept = db.query(models.Department).filter(models.Department.Did == st.Did).first()
# #     if not dept:
# #         raise HTTPException(status_code=404, detail="Department not found")
    
# #     return {
# #             "id" :st.Sid,
# #             "name": st.name,
# #             "email" : st.email,
# #             "dep": dept.dep,
# #             "u_roll" :st.u_roll,
# #             "c_roll" : st.c_roll,
# #             "year" :st.year,
# #             "sem" : st.sem,
# #             "role" :dept.role
# #     }


