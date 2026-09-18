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


@router.delete("/departments/{dept_id}", status_code=204)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin)),
):
    department = _require_department(db, dept_id, current_user.college_id)  # type: ignore
    db.delete(department)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Department cannot be deleted while it has teachers, students, subjects, or related records",
        )


def _delete_with_conflict_handling(db: Session, obj, message: str):
    db.delete(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=message)


@router.delete("/teachers/{teacher_id}", status_code=204)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin))):
    teacher = db.query(models.Teacher).join(models.User).filter(
        models.Teacher.teacher_id == teacher_id,
        models.User.college_id == current_user.college_id,
    ).first()
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    user = teacher.user
    db.delete(teacher)
    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Teacher cannot be deleted while assigned to subjects or routines")


@router.delete("/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin))):
    student = db.query(models.Student).join(models.Department).filter(
        models.Student.student_id == student_id,
        models.Department.college_id == current_user.college_id,
    ).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    user = student.user
    db.delete(student)
    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Student cannot be deleted while attendance records exist")


@router.delete("/subjects/{subject_id}", status_code=204)
def delete_subject(subject_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin))):
    subject = db.query(models.Subject).join(models.Department).filter(
        models.Subject.subject_id == subject_id,
        models.Department.college_id == current_user.college_id,
    ).first()
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    _delete_with_conflict_handling(db, subject, "Subject cannot be deleted while assignments or attendance records exist")


@router.delete("/subject-teachers/{st_id}", status_code=204)
def delete_subject_teacher(st_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin))):
    assignment = db.query(models.SubjectTeacher).join(models.Department, models.SubjectTeacher.dept_id == models.Department.dept_id).filter(
        models.SubjectTeacher.st_id == st_id,
        models.Department.college_id == current_user.college_id,
    ).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    _delete_with_conflict_handling(db, assignment, "Assignment cannot be deleted while routines or attendance records exist")


@router.delete("/slots/{slot_id}", status_code=204)
def delete_slot(slot_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.require_role(models.RoleEnum.admin))):
    slot = db.query(models.Slot).filter(models.Slot.slot_id == slot_id).first()
    if slot is None:
        raise HTTPException(status_code=404, detail="Time slot not found")
    _delete_with_conflict_handling(db, slot, "Time slot cannot be deleted while routines use it")
