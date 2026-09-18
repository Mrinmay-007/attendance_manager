import enum 

from sqlalchemy import (
    Column, Integer, String, Boolean, Date, Time, DateTime,
    ForeignKey, Enum, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship

from ..database.db import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"


class DayEnum(str, enum.Enum):
    mon = "Mon"
    tue = "Tue"
    wed = "Wed"
    thu = "Thu"
    fri = "Fri"
    sat = "Sat"


class StatusEnum(str, enum.Enum):
    present = "Present"
    absent = "Absent"
    late = "Late"


class College(Base):
    __tablename__ = "college"

    college_id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String(150), nullable=False)
    address = Column(String(255))
    email = Column(String(120))
    phone = Column(String(20))
    website = Column(String(150))

    departments = relationship("Department", back_populates="college")
    users = relationship("User", back_populates="college")


class Department(Base):
    __tablename__ = "department"

    dept_id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.college_id"), nullable=False)
    dept_name = Column(String(120), nullable=False)
    dept_code = Column(String(20), unique=True, nullable=False)
    description = Column(String(255))

    college = relationship("College", back_populates="departments")
    teachers = relationship("Teacher", back_populates="department")
    students = relationship("Student", back_populates="department")
    subjects = relationship("Subject", back_populates="department")


class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("college.college_id"), nullable=False)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    college = relationship("College", back_populates="users")
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    student = relationship("Student", back_populates="user", uselist=False)


class Teacher(Base):
    __tablename__ = "teacher"

    teacher_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), unique=True, nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), nullable=True)
    teacher_code = Column(String(30), unique=True, nullable=False)
    designation = Column(String(80))
    experience = Column(Integer)
    join_date = Column(Date)

    user = relationship("User", back_populates="teacher")
    department = relationship("Department", back_populates="teachers")
    subject_teachers = relationship("SubjectTeacher", back_populates="teacher")


class Student(Base):
    __tablename__ = "student"

    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), unique=True, nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), nullable=False)
    roll_no = Column(String(30), unique=True, nullable=False)
    c_roll_no = Column(String(30))
    year = Column(Integer, nullable=False)
    sem = Column(Integer, nullable=False)
    section = Column(String(10))

    user = relationship("User", back_populates="student")
    department = relationship("Department", back_populates="students")
    attendances = relationship("Attendance", back_populates="student")


class Subject(Base):
    __tablename__ = "subject"

    subject_id = Column(Integer, primary_key=True, index=True)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), nullable=False)
    subject_name = Column(String(120), nullable=False)
    subject_code = Column(String(30), unique=True, nullable=False)
    year = Column(Integer)
    sem = Column(Integer)

    department = relationship("Department", back_populates="subjects")
    subject_teachers = relationship("SubjectTeacher", back_populates="subject")


class SubjectTeacher(Base):
    __tablename__ = "subject_teacher"
    __table_args__ = (UniqueConstraint("subject_id", "teacher_id", name="uq_subject_teacher"),)

    st_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subject.subject_id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teacher.teacher_id"), nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), nullable=False)

    subject = relationship("Subject", back_populates="subject_teachers")
    teacher = relationship("Teacher", back_populates="subject_teachers")
    routines = relationship("Routine", back_populates="subject_teacher")
    attendances = relationship("Attendance", back_populates="subject_teacher")


class Slot(Base):
    __tablename__ = "slot"

    slot_id = Column(Integer, primary_key=True, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    slot_name = Column(String(50), unique=True)

    routines = relationship("Routine", back_populates="slot")


class Routine(Base):
    __tablename__ = "routine"
    __table_args__ = (
        UniqueConstraint("st_id", "slot_id", "day", name="uq_routine_slot_day"),
    )

    routine_id = Column(Integer, primary_key=True, index=True)
    st_id = Column(Integer, ForeignKey("subject_teacher.st_id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slot.slot_id"), nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), nullable=False)
    day = Column(Enum(DayEnum), nullable=False)

    subject_teacher = relationship("SubjectTeacher", back_populates="routines")
    slot = relationship("Slot", back_populates="routines")


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("st_id", "student_id", "date", name="uq_attendance_once_per_day"),
    )

    attendance_id = Column(Integer, primary_key=True, index=True)
    st_id = Column(Integer, ForeignKey("subject_teacher.st_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(StatusEnum), nullable=False)
    marked_at = Column(DateTime, server_default=func.now(), nullable=True)

    subject_teacher = relationship("SubjectTeacher", back_populates="attendances")
    student = relationship("Student", back_populates="attendances")
