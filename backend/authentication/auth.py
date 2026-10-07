import datetime as dt
import hashlib
import os

import bcrypt #type: ignore
from dotenv import load_dotenv #type: ignore
from fastapi import Depends, HTTPException, status #type: ignore
from fastapi.security import OAuth2PasswordBearer #type: ignore
from jose import JWTError, jwt #type: ignore
from sqlalchemy.orm import Session #type: ignore

from ..dependency import get_db
from ..models import models

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _bcrypt_input(password: str) -> bytes:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        # Bcrypt has a hard 72-byte limit; hash longer passwords first rather
        # than truncating them and reducing their effective entropy.
        return hashlib.sha256(password_bytes).digest()
    return password_bytes


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_bcrypt_input(password), bcrypt.gensalt()).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_bcrypt_input(plain), hashed.encode("ascii"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = dt.datetime.utcnow() + dt.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub") # type: ignore
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.user_id == int(user_id)).first()
    if user is None or not user.is_active: # pyright: ignore[reportGeneralTypeIssues]
        raise credentials_exception
    return user


def require_role(*allowed_roles: models.RoleEnum):
    """Dependency factory: require_role(RoleEnum.admin) restricts an endpoint to admins."""

    def checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.value}' is not permitted for this action",
            )
        return current_user

    return checker


def _decode(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def current_teacher_id(
    token: str = Depends(oauth2_scheme),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> int:
    teacher_id = _decode(token).get("tid")
    if teacher_id is None:
        # Token issued before this change: fall back to the database.
        teacher_id = (
            db.query(models.Teacher.teacher_id)
            .filter(models.Teacher.user_id == user.user_id)
            .scalar()
        )
    if teacher_id is None:
        raise HTTPException(404, "No teacher profile linked to this account")
    return teacher_id


def current_student_id(
    token: str = Depends(oauth2_scheme),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> int:
    student_id = _decode(token).get("sid")
    if student_id is None:
        student_id = (
            db.query(models.Student.student_id)
            .filter(models.Student.user_id == user.user_id)
            .scalar()
        )
    if student_id is None:
        raise HTTPException(404, "No student profile linked to this account")
    return student_id