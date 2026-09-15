from fastapi import APIRouter, Depends, HTTPException
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





@router.get("/my-subjects", response_model=list[schemas.SubjectTeacherOut])
def my_subjects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    teacher = _get_teacher(db, current_user)
    assignments = (
        db.query(models.SubjectTeacher)
        .join(models.Subject)
        .join(models.Department, models.SubjectTeacher.dept_id == models.Department.dept_id)
        .filter(models.SubjectTeacher.teacher_id == teacher.teacher_id)
        .all()
    )
    return [
        {
            **{column.name: getattr(assignment, column.name) for column in models.SubjectTeacher.__table__.columns},
            "dept_name": assignment.subject.department.dept_name,
            "dept_code": assignment.subject.department.dept_code,
            "subject_name": assignment.subject.subject_name,
            "subject_code": assignment.subject.subject_code,
            "year": assignment.subject.year,
            "sem": assignment.subject.sem,
        }
        for assignment in assignments
    ]


@router.get("/my-routine", response_model=list[schemas.RoutineOut])
def my_routine(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    teacher = _get_teacher(db, current_user)
    st_ids = [
        st.st_id
        for st in db.query(models.SubjectTeacher)
        .filter(models.SubjectTeacher.teacher_id == teacher.teacher_id)
        .all()
    ]
    if not st_ids:
        return []
    return db.query(models.Routine).filter(models.Routine.st_id.in_(st_ids)).all()





@router.get("/attendance", response_model=list[schemas.AttendanceOut])
def view_marked_attendance(
    st_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    teacher = _get_teacher(db, current_user)
    st_ids = [
        st.st_id
        for st in db.query(models.SubjectTeacher)
        .filter(models.SubjectTeacher.teacher_id == teacher.teacher_id)
        .all()
    ]
    q = (
        db.query(models.Attendance)
        .join(models.Student, models.Attendance.student_id == models.Student.student_id)
        .join(models.User, models.Student.user_id == models.User.user_id)
        .filter(models.Attendance.st_id.in_(st_ids))
    )
    if st_id:
        q = q.filter(models.Attendance.st_id == st_id)
    records = q.all()
    return [
        {
            **{column.name: getattr(record, column.name) for column in models.Attendance.__table__.columns},
            "student_name": record.student.user.name,
            "roll_no": record.student.roll_no,
            "c_roll_no": record.student.c_roll_no,
        }
        for record in records
    ]


@router.get("/assigned-students", response_model=list[schemas.TeacherStudentOut])
def assigned_students(
    st_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    teacher = _get_teacher(db, current_user)
    assignment = (
        db.query(models.SubjectTeacher)
        .join(models.Subject)
        .filter(
            models.SubjectTeacher.st_id == st_id,
            models.SubjectTeacher.teacher_id == teacher.teacher_id,
        )
        .first()
    )
    if assignment is None:
        raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    students = (
        db.query(models.Student)
        .join(models.User)
        .filter(
            models.Student.dept_id == assignment.dept_id,
            models.Student.year == models.Subject.year,
            models.Student.sem == models.Subject.sem,
            models.Subject.subject_id == assignment.subject_id,
        )
        .all()
    )
    return [
        {
            "student_id": student.student_id,
            "name": student.user.name,
            "email": student.user.email,
            "roll_no": student.roll_no,
            "c_roll_no": student.c_roll_no,
            "year": student.year,
            "sem": student.sem,
            "section": student.section,
        }
        for student in students
    ]
