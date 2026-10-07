from fastapi import APIRouter, Depends #type: ignore
from sqlalchemy.orm import Session ,contains_eager #type: ignore

from ...cache import reference_cache
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

def _row(obj, model) -> dict:
    return {c.name: getattr(obj, c.name) for c in model.__table__.columns}

# ---------- Department ----------

# @router.get("/departments", response_model=list[schemas.DepartmentOut])
# def list_departments(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
# ):
#     return (
#         db.query(models.Department)
#         .filter(models.Department.college_id == current_user.college_id)  # type: ignore
#         .all()
#     )


@router.get("/departments", response_model=list[schemas.DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    college_id = current_user.college_id

    def load():
        departments = (
            db.query(models.Department)
            .filter(models.Department.college_id == college_id)
            .all()
        )
        return [_row(d, models.Department) for d in departments]

    return reference_cache.get_or_set(("departments", college_id), load)

# ---------- Teacher ----------


@router.get("/teachers", response_model=list[schemas.TeacherOut])
def list_teachers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    teachers = (
        db.query(models.Teacher)
        .join(models.User)
        .filter(models.User.college_id == current_user.college_id)  # type: ignore
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

# @router.get("/subjects", response_model=list[schemas.SubjectOut])
# def list_subjects(
#     dept_id: int | None = None,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
# ):
#     q = (
#         db.query(models.Subject)
#         .join(models.Department)
#         .filter(models.Department.college_id == current_user.college_id)  # type: ignore
#     )
#     if dept_id:
#         _require_department(db, dept_id, current_user.college_id)  # type: ignore
#         q = q.filter(models.Subject.dept_id == dept_id)
#     subjects = q.all()
#     return [
#         {
#             **{column.name: getattr(subject, column.name) for column in models.Subject.__table__.columns},
#             "dept_name": subject.department.dept_name,
#             "dept_code": subject.department.dept_code,
#         }
#         for subject in subjects
#     ]

@router.get("/subjects", response_model=list[schemas.SubjectOut])
def list_subjects(
    dept_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    college_id = current_user.college_id
    if dept_id:
        _require_department(db, dept_id, college_id)  # keep the ownership check outside the cache

    def load():
        q = (
            db.query(models.Subject)
            .join(models.Department)
            .options(contains_eager(models.Subject.department))
            .filter(models.Department.college_id == college_id)
        )
        if dept_id:
            q = q.filter(models.Subject.dept_id == dept_id)
        return [
            {
                **_row(s, models.Subject),
                "dept_name": s.department.dept_name,
                "dept_code": s.department.dept_code,
            }
            for s in q.all()
        ]

    return reference_cache.get_or_set(("subjects", college_id, dept_id), load)


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
    assignments = q.all()
    return [
        {
            **{column.name: getattr(assignment, column.name) for column in models.SubjectTeacher.__table__.columns},
            "dept_name": db.query(models.Department).filter(
                models.Department.dept_id == assignment.dept_id
            ).first().dept_name,
            "dept_code": db.query(models.Department).filter(
                models.Department.dept_id == assignment.dept_id
            ).first().dept_code,
            "subject_name": assignment.subject.subject_name,
            "subject_code": assignment.subject.subject_code,
            "teacher_name": assignment.teacher.user.name,
            "teacher_code": assignment.teacher.teacher_code,
            "year": assignment.subject.year,
            "sem": assignment.subject.sem,
        }
        for assignment in assignments
    ]


# ---------- Slot ----------

# @router.get("/slots", response_model=list[schemas.SlotOut])
# def list_slots(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
# ):
#     return db.query(models.Slot).all()

@router.get("/slots", response_model=list[schemas.SlotOut])
def list_slots(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    return reference_cache.get_or_set(
        ("slots",),
        lambda: [_row(s, models.Slot) for s in db.query(models.Slot).all()],
    )
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
