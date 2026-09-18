from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
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


@router.patch("/departments/{dept_id}", response_model=schemas.DepartmentOut)
def update_department(
    dept_id: int,
    payload: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    department = _require_department(db, dept_id, current_user.college_id)  # type: ignore
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(department, field, value)
    return _commit(db, department)


def _apply_values(obj, payload):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)


@router.patch("/teachers/{teacher_id}", response_model=schemas.TeacherOut)
def update_teacher(
    teacher_id: int,
    payload: schemas.TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    teacher = (
        db.query(models.Teacher)
        .join(models.User)
        .filter(models.Teacher.teacher_id == teacher_id, models.User.college_id == current_user.college_id)
        .first()
    )
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    values = payload.model_dump(exclude_unset=True)
    if "dept_id" in values and values["dept_id"] is not None:
        _require_department(db, values["dept_id"], current_user.college_id)
    user_values = {key: values.pop(key) for key in ("name", "email") if key in values}
    _apply_values(teacher, schemas.TeacherUpdate.model_validate(values))
    _apply_values(teacher.user, schemas.TeacherUpdate.model_validate(user_values))
    teacher = _commit(db, teacher)
    return {
        **{column.name: getattr(teacher, column.name) for column in models.Teacher.__table__.columns},
        "name": teacher.user.name,
        "email": teacher.user.email,
    }


@router.patch("/students/{student_id}", response_model=schemas.StudentOut)
def update_student(
    student_id: int,
    payload: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    student = (
        db.query(models.Student)
        .join(models.Department)
        .filter(models.Student.student_id == student_id, models.Department.college_id == current_user.college_id)
        .first()
    )
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    values = payload.model_dump(exclude_unset=True)
    if "dept_id" in values:
        _require_department(db, values["dept_id"], current_user.college_id)
    user_values = {key: values.pop(key) for key in ("name", "email") if key in values}
    _apply_values(student, schemas.StudentUpdate.model_validate(values))
    _apply_values(student.user, schemas.StudentUpdate.model_validate(user_values))
    student = _commit(db, student)
    return {
        **{column.name: getattr(student, column.name) for column in models.Student.__table__.columns},
        "name": student.user.name,
        "email": student.user.email,
    }


@router.patch("/subjects/{subject_id}", response_model=schemas.SubjectOut)
def update_subject(
    subject_id: int,
    payload: schemas.SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    subject = (
        db.query(models.Subject)
        .join(models.Department)
        .filter(models.Subject.subject_id == subject_id, models.Department.college_id == current_user.college_id)
        .first()
    )
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    values = payload.model_dump(exclude_unset=True)
    if "dept_id" in values:
        _require_department(db, values["dept_id"], current_user.college_id)
    _apply_values(subject, schemas.SubjectUpdate.model_validate(values))
    return _commit(db, subject)


@router.patch("/subject-teachers/{st_id}", response_model=schemas.SubjectTeacherOut)
def update_subject_teacher(
    st_id: int,
    payload: schemas.SubjectTeacherUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    assignment = (
        db.query(models.SubjectTeacher)
        .join(models.Department, models.SubjectTeacher.dept_id == models.Department.dept_id)
        .filter(models.SubjectTeacher.st_id == st_id, models.Department.college_id == current_user.college_id)
        .first()
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    values = payload.model_dump(exclude_unset=True)
    if "dept_id" in values:
        _require_department(db, values["dept_id"], current_user.college_id)
    subject_id = values.get("subject_id", assignment.subject_id)
    teacher_id = values.get("teacher_id", assignment.teacher_id)
    department_id = values.get("dept_id", assignment.dept_id)
    subject = db.query(models.Subject).filter(models.Subject.subject_id == subject_id).first()
    teacher = db.query(models.Teacher).filter(models.Teacher.teacher_id == teacher_id).first()
    if (
        subject is None
        or teacher is None
        or subject.dept_id != department_id
        or teacher.user.college_id != current_user.college_id
    ):
        raise HTTPException(status_code=403, detail="Subject and teacher must belong to the selected department")
    _apply_values(assignment, schemas.SubjectTeacherUpdate.model_validate(values))
    return _commit(db, assignment)


@router.patch("/slots/{slot_id}", response_model=schemas.SlotOut)
def update_slot(
    slot_id: int,
    payload: schemas.SlotUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    slot = db.query(models.Slot).filter(models.Slot.slot_id == slot_id).first()
    if slot is None:
        raise HTTPException(status_code=404, detail="Time slot not found")
    _apply_values(slot, payload)
    return _commit(db, slot)