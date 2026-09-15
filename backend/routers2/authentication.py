
# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Subject
# from methods.hashing import Hash
# from db import get_db
# from methods.token import create_access_token
# from fastapi.security import OAuth2PasswordRequestForm

# router = APIRouter(
#     # prefix="/login",
#     tags=["Authentication"]
# )

# @router.post("/login_student")
# async def login(request:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

#     student = db.query(models.Student).filter(models.Student.email == request.username).first()

#     if not student:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email or password")
    
#     if not Hash.verify(student.pw, request.password): #type:ignore
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email or password")
    
#     access_token = await create_access_token(data={"sub": student.email}) #type:ignore

#     return {"access_token": access_token, "token_type": "bearer"}


# @router.post("/login_faculty")
# async def login_faculty(request:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

#     dept = db.query(models.Department).filter(
#         models.Department.role == "Teacher"
#     ).first()
#     teacher = db.query(models.Teacher).filter(models.Teacher.email == request.username ,models.Teacher.Did == dept.Did).first() #type:ignore

#     if not teacher:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email or password")
    
#     if not Hash.verify(teacher.pw, request.password): #type:ignore
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email or password")

#     access_token =await create_access_token(data={"sub": teacher.email}) #type:ignore

#     return {"access_token": access_token, "token_type": "bearer"}


# @router.post("/login_admin")
# async def login_admin(request:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     dept = db.query(models.Department).filter(
#         models.Department.role == "Admin"
#     ).first()

#     admin = db.query(models.Teacher).filter(models.Teacher.email == request.username ,models.Teacher.Did == dept.Did).first() #type:ignore
    
#     if not admin:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email or password")

#     if not Hash.verify(admin.pw, request.password): #type:ignore
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid email or password")

#     access_token = await create_access_token(data={"sub": admin.email}) #type:ignore

#     return {"access_token": access_token, "token_type": "bearer"}


