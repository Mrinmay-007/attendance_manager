
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

# from .. import models, schemas, auth
# from ..database import get_db
from ...models import models
from ...schemas import schemas
from ...authentication import auth

def _commit(db: Session, obj):
    db.add(obj)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Constraint violated: {e.orig}")
    db.refresh(obj)
    return obj


def _require_department(db: Session, dept_id: int, college_id: int):
    department = (
        db.query(models.Department)
        .filter(
            models.Department.dept_id == dept_id,
            models.Department.college_id == college_id,
        )
        .first()
    )
    if department is None:
        raise HTTPException(
            status_code=403,
            detail="College admins can only access departments in their own college",
        )
    return department