from datetime import date, datetime
from sqlalchemy.dialects.mysql import insert as mysql_insert

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


from ...models import models
from ...schemas import schemas
from ...authentication import auth
from ...dependency import get_db
from .utils import _get_teacher

router = APIRouter(
    prefix="/teacher",
    tags=["teacher"],
    dependencies=[Depends(auth.require_role(models.RoleEnum.teacher))],
)




@router.post("/attendance", response_model=schemas.AttendanceOut)
def mark_attendance(
    payload: schemas.AttendanceMark,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if payload.date > date.today():
        raise HTTPException(status_code=400, detail="Attendance date cannot be in the future")
    teacher = _get_teacher(db, current_user)

    # Ensure the st_id being marked actually belongs to this teacher.
    st = (
        db.query(models.SubjectTeacher)
        .filter(
            models.SubjectTeacher.st_id == payload.st_id,
            models.SubjectTeacher.teacher_id == teacher.teacher_id,
        )
        .first()
    )
    if not st:
        raise HTTPException(403, "You are not assigned to this subject")

    record = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.st_id == payload.st_id,
            models.Attendance.student_id == payload.student_id,
            models.Attendance.date == payload.date,
        )
        .first()
    )
    if record:
        record.status = payload.status
    else:
        record = models.Attendance(**payload.model_dump(), marked_at=datetime.utcnow())
        db.add(record)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(400, f"Attendance already marked or invalid: {e.orig}")
    db.refresh(record)
    return record


@router.post("/attendance/bulk", response_model=schemas.BulkAttendanceOut)
def mark_attendance_bulk(
    payload: schemas.BulkAttendanceMark,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if payload.date > date.today():
        raise HTTPException(status_code=400, detail="Attendance date cannot be in the future")

    teacher = _get_teacher(db, current_user)

    # One query: confirms the class belongs to this teacher and fetches its dept/year/sem.
    assignment = (
        db.query(models.SubjectTeacher.dept_id, models.Subject.year, models.Subject.sem)
        .join(models.Subject, models.SubjectTeacher.subject_id == models.Subject.subject_id)
        .filter(
            models.SubjectTeacher.st_id == payload.st_id,
            models.SubjectTeacher.teacher_id == teacher.teacher_id,
        )
        .first()
    )
    if assignment is None:
        raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    # If a student appears twice, the last entry wins.
    latest = {record.student_id: record.status for record in payload.records}

    # One query: every student must actually belong to this class.
    valid_ids = {
        student_id
        for (student_id,) in db.query(models.Student.student_id).filter(
            models.Student.student_id.in_(latest.keys()),
            models.Student.dept_id == assignment.dept_id,
            models.Student.year == assignment.year,
            models.Student.sem == assignment.sem,
        )
    }
    invalid = sorted(set(latest) - valid_ids)
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Students not in this class: {invalid}",
        )

    now = datetime.utcnow()  # same clock the history/recent-marks filters compare against
    rows = [
        {
            "st_id": payload.st_id,
            "student_id": student_id,
            "date": payload.date,
            "status": status,
            "marked_at": now,
        }
        for student_id, status in latest.items()
    ]

    stmt = mysql_insert(models.Attendance).values(rows)
    # Same rule as your single endpoint: an existing row only changes its status.
    stmt = stmt.on_duplicate_key_update(status=stmt.inserted.status)

    try:
        db.execute(stmt)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Attendance invalid: {e.orig}")

    return {"saved": len(rows)}