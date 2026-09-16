import datetime as dt
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict

from ..models.models import RoleEnum, DayEnum, StatusEnum


# ---------- Auth ----------
class UserCreate(BaseModel):
    college_id: int
    name: str
    email: EmailStr
    password: str
    role: RoleEnum


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    college_id: int
    name: str
    email: EmailStr
    role: RoleEnum
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- College / Department ----------
class CollegeCreate(BaseModel):
    college_name: str
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None


class CollegeOut(CollegeCreate):
    model_config = ConfigDict(from_attributes=True)
    college_id: int


class DepartmentCreate(BaseModel):
    college_id: int
    dept_name: str
    dept_code: str
    description: Optional[str] = None


class DepartmentOut(DepartmentCreate):
    model_config = ConfigDict(from_attributes=True)
    dept_id: int


# ---------- Teacher / Student ----------
class TeacherCreate(BaseModel):
    user_id: int
    dept_id: int
    teacher_code: str
    designation: Optional[str] = None
    experience: Optional[int] = None
    join_date: Optional[dt.date] = None


class AdminTeacherCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    dept_id: int
    teacher_code: str
    designation: Optional[str] = None
    experience: Optional[int] = None
    join_date: Optional[dt.date] = None


class TeacherOut(TeacherCreate):
    model_config = ConfigDict(from_attributes=True)
    teacher_id: int
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class StudentCreate(BaseModel):
    user_id: int
    dept_id: int
    roll_no: str
    c_roll_no: Optional[str] = None
    year: int
    sem: int
    section: Optional[str] = None


class AdminStudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    dept_id: int
    roll_no: str
    c_roll_no: Optional[str] = None
    year: int
    sem: int
    section: Optional[str] = None


class StudentOut(StudentCreate):
    model_config = ConfigDict(from_attributes=True)
    student_id: int
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class DepartmentUpdate(BaseModel):
    dept_name: Optional[str] = None
    dept_code: Optional[str] = None
    description: Optional[str] = None


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    dept_id: Optional[int] = None
    teacher_code: Optional[str] = None
    designation: Optional[str] = None
    experience: Optional[int] = None
    join_date: Optional[dt.date] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    dept_id: Optional[int] = None
    roll_no: Optional[str] = None
    c_roll_no: Optional[str] = None
    year: Optional[int] = None
    sem: Optional[int] = None
    section: Optional[str] = None

# ---------- Subject / SubjectTeacher ----------
class SubjectCreate(BaseModel):
    dept_id: int
    subject_name: str
    subject_code: str
    year: Optional[int] = None
    sem: Optional[int] = None


class SubjectUpdate(BaseModel):
    dept_id: Optional[int] = None
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    year: Optional[int] = None
    sem: Optional[int] = None


class SubjectOut(SubjectCreate):
    model_config = ConfigDict(from_attributes=True)
    subject_id: int
    dept_name: Optional[str] = None
    dept_code: Optional[str] = None


class SubjectTeacherCreate(BaseModel):
    subject_id: int
    teacher_id: int
    dept_id: int


class SubjectTeacherUpdate(BaseModel):
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    dept_id: Optional[int] = None


class SubjectTeacherOut(SubjectTeacherCreate):
    model_config = ConfigDict(from_attributes=True)
    st_id: int
    dept_name: Optional[str] = None
    dept_code: Optional[str] = None
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    year: Optional[int] = None
    sem: Optional[int] = None


# ---------- Slot / Routine ----------
class SlotCreate(BaseModel):
    start_time: dt.time
    end_time: dt.time
    slot_name: Optional[str] = None


class SlotUpdate(BaseModel):
    start_time: Optional[dt.time] = None
    end_time: Optional[dt.time] = None
    slot_name: Optional[str] = None


class SlotOut(SlotCreate):
    model_config = ConfigDict(from_attributes=True)
    slot_id: int


class RoutineCreate(BaseModel):
    st_id: int
    slot_id: int
    dept_id: int
    day: DayEnum


class RoutineOut(RoutineCreate):
    model_config = ConfigDict(from_attributes=True)
    routine_id: int


# ---------- Attendance ----------
class AttendanceMark(BaseModel):
    st_id: int
    student_id: int
    date: dt.date
    status: StatusEnum


class AttendanceOut(AttendanceMark):
    model_config = ConfigDict(from_attributes=True)
    attendance_id: int
    student_name: Optional[str] = None
    roll_no: Optional[str] = None
    c_roll_no: Optional[str] = None
    marked_at: Optional[dt.datetime] = None
    dept_name: Optional[str] = None
    dept_code: Optional[str] = None
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None


class AttendanceUpdate(BaseModel):
    status: StatusEnum


class TeacherStudentOut(BaseModel):
    student_id: int
    name: str
    email: EmailStr
    roll_no: str
    c_roll_no: Optional[str] = None
    year: int
    sem: int
    section: Optional[str] = None


class AttendanceSummaryOut(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    attended: float
    total: int
    percentage: float


class AttendanceHistoryOut(BaseModel):
    date: dt.date
    subject_name: str
    subject_code: str
    status: StatusEnum
