from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...authentication import auth
from ...dependency import get_db
from ...models import models
from ...schemas import schemas
from .utils import _get_teacher

router = APIRouter(
    prefix="/teacher",
    tags=["teacher"],
    dependencies=[Depends(auth.require_role(models.RoleEnum.teacher))],
)


@router.patch("/attendance/{attendance_id}", response_model=schemas.AttendanceOut)
def update_attendance(
    attendance_id: int,
    payload: schemas.AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    teacher = _get_teacher(db, current_user)
    record = (
        db.query(models.Attendance)
        .join(models.SubjectTeacher, models.Attendance.st_id == models.SubjectTeacher.st_id)
        .filter(
            models.Attendance.attendance_id == attendance_id,
            models.SubjectTeacher.teacher_id == teacher.teacher_id,
        )
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if record.marked_at is not None and record.marked_at > datetime.utcnow() - timedelta(hours=1):
        raise HTTPException(status_code=409, detail="Attendance can only be edited from history after one hour")
    record.status = payload.status
    db.commit()
    db.refresh(record)
    return record
from datetime import datetime, timedelta
