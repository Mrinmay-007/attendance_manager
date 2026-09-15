from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# from .. import models, schemas, auth
# from ..database import get_db
from ...models import models
from ...schemas import schemas
from ...authentication import auth
from ...dependency import get_db
from .utils import _get_student

router = APIRouter(
    prefix="/student",
    tags=["student"],
    dependencies=[Depends(auth.require_role(models.RoleEnum.student))],
)




@router.get("/my-attendance", response_model=list[schemas.AttendanceOut])
def my_attendance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    student = _get_student(db, current_user)
    return (
        db.query(models.Attendance)
        .filter(models.Attendance.student_id == student.student_id)
        .all()
    )


@router.get("/attendance-summary", response_model=list[schemas.AttendanceSummaryOut])
def attendance_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    student = _get_student(db, current_user)
    records = (
        db.query(models.Attendance, models.Subject)
        .join(models.SubjectTeacher, models.Attendance.st_id == models.SubjectTeacher.st_id)
        .join(models.Subject, models.SubjectTeacher.subject_id == models.Subject.subject_id)
        .filter(models.Attendance.student_id == student.student_id)
        .all()
    )
    grouped = {}
    for attendance, subject in records:
        item = grouped.setdefault(subject.subject_id, {
            "subject_id": subject.subject_id,
            "subject_name": subject.subject_name,
            "subject_code": subject.subject_code,
            "attended": 0,
            "total": 0,
        })
        item["total"] += 1
        if attendance.status == models.StatusEnum.present:
            item["attended"] += 1
        elif attendance.status == models.StatusEnum.late:
            item["attended"] += 0.5
    return [
        {**item, "percentage": round(item["attended"] * 100 / item["total"], 2) if item["total"] else 0}
        for item in grouped.values()
    ]


@router.get("/attendance-history", response_model=list[schemas.AttendanceHistoryOut])
def attendance_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    student = _get_student(db, current_user)
    records = (
        db.query(models.Attendance, models.Subject)
        .join(models.SubjectTeacher, models.Attendance.st_id == models.SubjectTeacher.st_id)
        .join(models.Subject, models.SubjectTeacher.subject_id == models.Subject.subject_id)
        .filter(models.Attendance.student_id == student.student_id)
        .order_by(models.Attendance.date.desc())
        .all()
    )
    return [
        {
            "date": attendance.date,
            "subject_name": subject.subject_name,
            "subject_code": subject.subject_code,
            "status": attendance.status,
        }
        for attendance, subject in records
    ]


@router.get("/my-routine", response_model=list[schemas.RoutineOut])
def my_routine(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    student = _get_student(db, current_user)
    # A student's routine = all routine entries for their department.
    return (
        db.query(models.Routine)
        .filter(models.Routine.dept_id == student.dept_id)
        .all()
    )
