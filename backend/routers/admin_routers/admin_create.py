from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...models import models
from ...schemas import schemas
from ...authentication import auth
from ...dependency import get_db
from .utils import _commit, _require_department

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(auth.require_role(models.RoleEnum.admin))],
)

# ---------- College ----------
# @router.post("/colleges", response_model=schemas.CollegeOut)
# def create_college(payload: schemas.CollegeCreate, db: Session = Depends(get_db)):
#     return _commit(db, models.College(**payload.model_dump()))


# ---------- Department ----------
@router.post("/departments", response_model=schemas.DepartmentOut)
def create_department(
    payload: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    if payload.college_id != current_user.college_id:  # type: ignore
        raise HTTPException(
            status_code=403,
            detail="College admins can only create departments for their own college",
        )
    return _commit(db, models.Department(**payload.model_dump()))


# ---------- Teacher ----------

@router.post("/teachers", response_model=schemas.TeacherOut)
def create_teacher(
    payload: schemas.AdminTeacherCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    _require_department(db, payload.dept_id, current_user.college_id)  # type: ignore
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        college_id=current_user.college_id,  # type: ignore
        name=payload.name,
        email=payload.email,
        password_hash=auth.hash_password(payload.password),
        role=models.RoleEnum.teacher,
    )
    db.add(user)
    db.flush()
    teacher = models.Teacher(
        user_id=user.user_id,
        **payload.model_dump(exclude={"name", "email", "password"}),
    )
    return _commit(db, teacher)


# ---------- Student ----------
@router.post("/students", response_model=schemas.StudentOut)
def create_student(
    payload: schemas.AdminStudentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    _require_department(db, payload.dept_id, current_user.college_id)  # type: ignore
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        college_id=current_user.college_id,  # type: ignore
        name=payload.name,
        email=payload.email,
        password_hash=auth.hash_password(payload.password),
        role=models.RoleEnum.student,
    )
    db.add(user)
    db.flush()
    student = models.Student(
        user_id=user.user_id,
        **payload.model_dump(exclude={"name", "email", "password"}),
    )
    return _commit(db, student)




# ---------- Subject ----------
@router.post("/subjects", response_model=schemas.SubjectOut)
def create_subject(
    payload: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    _require_department(db, payload.dept_id, current_user.college_id)  # type: ignore
    return _commit(db, models.Subject(**payload.model_dump()))




# ---------- Subject <-> Teacher assignment ----------
@router.post("/subject-teachers", response_model=schemas.SubjectTeacherOut)
def assign_subject_to_teacher(
    payload: schemas.SubjectTeacherCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    _require_department(db, payload.dept_id, current_user.college_id)  # type: ignore
    subject = db.query(models.Subject).filter(models.Subject.subject_id == payload.subject_id).first()
    teacher = db.query(models.Teacher).filter(models.Teacher.teacher_id == payload.teacher_id).first()
    if (
        subject is None
        or teacher is None
        or subject.dept_id != payload.dept_id
        or teacher.dept_id != payload.dept_id
    ): # type: ignore
        raise HTTPException(status_code=403, detail="Subject and teacher must belong to the selected department")
    return _commit(db, models.SubjectTeacher(**payload.model_dump()))



# ---------- Slot ----------
@router.post("/slots", response_model=schemas.SlotOut)
def create_slot(
    payload: schemas.SlotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    return _commit(db, models.Slot(**payload.model_dump()))





# ---------- Routine ----------
@router.post("/routines", response_model=schemas.RoutineOut)
def create_routine(
    payload: schemas.RoutineCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    _require_department(db, payload.dept_id, current_user.college_id)  # type: ignore
    subject_teacher = (
        db.query(models.SubjectTeacher)
        .filter(models.SubjectTeacher.st_id == payload.st_id)
        .first()
    )
    if subject_teacher is None or subject_teacher.dept_id != payload.dept_id: # type: ignore
        raise HTTPException(status_code=403, detail="Subject-teacher assignment belongs to another department")
    return _commit(db, models.Routine(**payload.model_dump()))

