from fastapi import  HTTPException
from sqlalchemy.orm import Session

from ...models import models

def _get_teacher(db: Session, current_user: models.User) -> models.Teacher:
    teacher = (
        db.query(models.Teacher)
        .filter(models.Teacher.user_id == current_user.user_id)
        .first()
    )
    if not teacher:
        raise HTTPException(404, "No teacher profile linked to this account")
    return teacher