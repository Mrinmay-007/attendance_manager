from fastapi import APIRouter, Depends, HTTPException, HTTPException
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
        record = models.Attendance(**payload.model_dump())
        db.add(record)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(400, f"Attendance already marked or invalid: {e.orig}")
    db.refresh(record)
    return record


