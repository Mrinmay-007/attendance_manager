
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
import schemas,models
from models import Teacher
from db import get_db
import json
from methods.hashing import Hash



with open('pw.json', "r") as file:
    data = json.load(file)

faculty_pw = data.get("faculty_password")
admin_pw = data.get("admin_password")
default_pw = data.get("default_password")

router = APIRouter(
    prefix="/teacher",
    tags=["Teacher"]
)

# ==========================
# Teacher Route
# ==========================




# =================================================

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_teacher(tch: schemas.Teacher, db: Session = Depends(get_db)):

    dept = db.query(models.Department).filter(models.Department.role == tch.role).first()
    if not dept:
        raise HTTPException(status_code=404, detail=f"Department with role {tch.role} not found")

    if tch.role not in ['Admin', 'Teacher']:
        raise HTTPException(status_code=403, detail="Access denied: Only Admin or Teacher role allowed")
    

    if tch.role == 'Admin':
        pw = admin_pw
    elif tch.role == 'Teacher':
        pw = faculty_pw

    if not pw:
        raise HTTPException(status_code=500, detail=f"Password for role {tch.role} not configured")

  

    new_teacher = models.Teacher(
        Did=dept.Did,  # assign Did from department
        name=tch.name,
        name_code=tch.name_code,
        email=tch.email,
        pw= Hash.bcrypt(pw) #type:ignore
    )

    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)

    return {
        "id": new_teacher.Tid,
        "name": new_teacher.name,
        "name_code" : new_teacher.name_code,
        "email": new_teacher.email,
        "role": dept.role
    }


@router.get("/")
async def get_teachers(response: Response, db: Session = Depends(get_db)):
    teachers = db.query(Teacher).all()
    result = []

    for fac in teachers:
        result.append({
            "id": fac.Tid,
            "name": fac.name,
            "name_code" :fac.name_code,
            "email": fac.email,
            "pw": fac.pw,
            "role": fac.department.role if fac.department else None  # show role instead of Did
        })
    total = len(result)
    # For React Admin compatibility (optional)
    response.headers["Content-Range"] = f"teachers 0-{total-1}/{total}"
    return result


@router.delete("/{id}")
async def delete_teacher(id: int, db: Session = Depends(get_db)):
    tch = db.query(Teacher).filter(Teacher.Tid == id).first()
    
    if not tch:
        raise HTTPException(status_code=404,detail='Faculty Not Found')
    db.delete(tch)
    db.commit()
    return {"data":{"id":id}}


@router.put("/{id}")
async def edit_teacher(id: int, updated: schemas.Teacher, db: Session = Depends(get_db)):
    
    tch = db.query(models.Teacher).filter(models.Teacher.Tid == id).first()
    if not tch:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Fetch department based on updated role
    dept = db.query(models.Department).filter(models.Department.role == updated.role).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department with this role not found")

    # Only allow Admin or Teacher roles
    if dept.role not in ['Admin', 'Teacher']:
        raise HTTPException(status_code=403, detail="Access denied: Only Admin or Teacher role allowed")

    old_role = tch.role
    old_email = tch.email

    # Update teacher fields
    tch.name = updated.name #type:ignore
    tch.name_code = updated.name_code #type:ignore
    
    if old_role != updated.role:
        if updated.role == 'Admin':
            tch.email = updated.email #type:ignore
            tch.pw = Hash.bcrypt(admin_pw)#type:ignore
        if updated.role == 'Teacher':
            tch.email = updated.email #type:ignore
            tch.pw = Hash.bcrypt(faculty_pw) #type:ignore
 
    elif old_role == updated.role:
        if old_email != updated.email: #type:ignore
            tch.email = updated.email #type:ignore
            tch.pw = Hash.bcrypt(default_pw) #type:ignore

    tch.Did = dept.Did
    # Update the Did foreign key to match role

    db.commit()
    # db.refresh(tch)

    return {
        "id": tch.Tid,
        "name": tch.name,
        "name_code": tch.name_code,
        "email": tch.email,
        "role": dept.role,
    }

@router.get("/{id}")
async def get_teacher(id: int, db: Session = Depends(get_db)):
    # Fetch teacher
    tch = db.query(models.Teacher).filter(models.Teacher.Tid == id).first()
    if not tch:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Fetch department based on Did foreign key
    dept = db.query(models.Department).filter(models.Department.Did == tch.Did).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    return {
        "id": tch.Tid,
        "name": tch.name,
        "name_code": tch.name_code,
        "email": tch.email,
        "role": dept.role
    }



