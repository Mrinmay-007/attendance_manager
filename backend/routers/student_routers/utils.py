from fastapi import  HTTPException
from sqlalchemy.orm import Session

from ...models import models


def _get_student(db: Session, current_user: models.User) -> models.Student:
    student = (
        db.query(models.Student)
        .filter(models.Student.user_id == current_user.user_id)
        .first()
    )
    if not student:
        raise HTTPException(404, "No student profile linked to this account")
    return student