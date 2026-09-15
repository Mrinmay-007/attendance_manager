from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from ...models import models
from ...schemas import schemas
from ...authentication import auth
from ...dependency import get_db
from .utils import  _require_department

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(auth.require_role(models.RoleEnum.admin))],
)



# ---------- Department ----------

@router.get("/departments", response_model=list[schemas.DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    return (
        db.query(models.Department)
        .filter(models.Department.college_id == current_user.college_id)  # type: ignore
        .all()
    )


# ---------- Teacher ----------


@router.get("/teachers", response_model=list[schemas.TeacherOut])
def list_teachers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    teachers = (
        db.query(models.Teacher)
        .join(models.User)
        .join(models.Department)
        .filter(models.Department.college_id == current_user.college_id)  # type: ignore
        .all()
    )
    return [
        {
            **{column.name: getattr(teacher, column.name) for column in models.Teacher.__table__.columns},
            "name": teacher.user.name,
            "email": teacher.user.email,
        }
        for teacher in teachers
    ]


# ---------- Student ----------

@router.get("/students", response_model=list[schemas.StudentOut])
def list_students(
    dept_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    q = (
        db.query(models.Student)
        .join(models.Department)
        .filter(models.Department.college_id == current_user.college_id)  # type: ignore
    )
    if dept_id:
        _require_department(db, dept_id, current_user.college_id)  # type: ignore
        q = q.filter(models.Student.dept_id == dept_id)
    students = q.all()
    return [
        {
            **{column.name: getattr(student, column.name) for column in models.Student.__table__.columns},
            "name": student.user.name,
            "email": student.user.email,
        }
        for student in students
    ]


# ---------- Subject ----------

@router.get("/subjects", response_model=list[schemas.SubjectOut])
def list_subjects(
    dept_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    q = (
        db.query(models.Subject)
        .join(models.Department)
        .filter(models.Department.college_id == current_user.college_id)  # type: ignore
    )
    if dept_id:
        _require_department(db, dept_id, current_user.college_id)  # type: ignore
        q = q.filter(models.Subject.dept_id == dept_id)
    return q.all()


# ---------- Subject <-> Teacher assignment ----------


@router.get("/subject-teachers", response_model=list[schemas.SubjectTeacherOut])
def list_subject_teachers(
    dept_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    q = (
        db.query(models.SubjectTeacher)
        .join(models.Department, models.SubjectTeacher.dept_id == models.Department.dept_id)
        .filter(models.Department.college_id == current_user.college_id)  # type: ignore
    )
    if dept_id:
        _require_department(db, dept_id, current_user.college_id)  # type: ignore
        q = q.filter(models.SubjectTeacher.dept_id == dept_id)
    return q.all()


# ---------- Slot ----------

@router.get("/slots", response_model=list[schemas.SlotOut])
def list_slots(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    return db.query(models.Slot).all()


# ---------- Routine ----------


@router.get("/routines", response_model=list[schemas.RoutineOut])
def list_routines(
    dept_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    q = (
        db.query(models.Routine)
        .join(models.Department, models.Routine.dept_id == models.Department.dept_id)
        .filter(models.Department.college_id == current_user.college_id)  # type: ignore
    )
    if dept_id:
        _require_department(db, dept_id, current_user.college_id)  # type: ignore
        q = q.filter(models.Routine.dept_id == dept_id)
    return q.all()
