
# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Teacher,Department,SubjectTeacher,Subject,Student,Attendance
# from db import get_db
# from methods.hashing import Hash
# from sqlalchemy import func, case
# from urllib.parse import unquote

# router = APIRouter()


# @router.get("/student-details/{email}")
# async def get_student_details(email: str, db: Session = Depends(get_db)):
#     # Fetch student by email
#     st = db.query(models.Student).filter(models.Student.email == email).first()
#     if not st:
#         raise HTTPException(status_code=404, detail="Student not found")
    
#     # Fetch department using Did from student
#     dept = db.query(models.Department).filter(models.Department.Did == st.Did).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
    
#     return {
#         "id": st.Sid,
#         "name": st.name,
#         "email": st.email,
#         "dep": dept.dep,
#         "u_roll": st.u_roll,
#         "c_roll": st.c_roll,
#         "year": st.year,
#         "sem": st.sem,
#         # "role": dept.role  # <-- double-check if this should be st.role instead
#     }

# @router.get("/attendance_history/{email}")
# def attn_hist(email: str, db: Session = Depends(get_db)):
#     results = (
#         db.query(
#             Attendance.STid,
#             Attendance.date,
#             Department.dep.label("department"),
#             Subject.sub_name.label("subject"),
#             Subject.sub_code.label("code"),
#             Subject.year,
#             Subject.sem
#         )
#         .join(SubjectTeacher, Attendance.STid == SubjectTeacher.STid)
#         .join(Teacher, SubjectTeacher.Tid == Teacher.Tid)
#         .join(Subject, SubjectTeacher.Sub_id == Subject.Sub_id)
#         .join(Department, Subject.Did == Department.Did)
#         .filter(Teacher.email == email)
#         .distinct()
#         .order_by(Attendance.date.desc())
#         .all()
#     )

#     return [
#         {
#             "STid": r[0],
#             "date": r[1],
#             "department": r[2],
#             "subject": r[3],
#             "code": r[4],
#             "year": r[5],
#             "sem": r[6],
#         }
#         for r in results
#     ]


# @router.get("/admin_details/{email}")
# async def admin_details(email: str, db: Session = Depends(get_db)):
#     dept = db.query(models.Department).filter(models.Department.role == "Admin").first() 
#     admin = db.query(models.Teacher).filter(models.Teacher.email == email ,
#                                             models.Teacher.Did == dept.Did).first() #type: ignore
#     if not admin:
#         raise HTTPException(status_code=404, detail="Admin not found")
#     return admin


# @router.get("/teacher_details/{email}")
# async def teacher_details(email: str, db: Session = Depends(get_db)):
#     teacher = db.query(models.Teacher).filter(models.Teacher.email == email).first()
#     if teacher is None:
#         raise HTTPException(status_code=404, detail="Teacher not found")


#     sub_tch = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.Tid == teacher.Tid).all()

#     sub_ids = [st.Sub_id for st in sub_tch]
#     subjects = db.query(models.Subject).filter(models.Subject.Sub_id.in_(sub_ids)).all()

#     dept_ids = [s.Did for s in subjects]
#     departments = db.query(models.Department).filter(models.Department.Did.in_(dept_ids)).all()

    
    
#     return {
#         "teacher": teacher,
#         "subjects": subjects,
#         "departments": departments,
#     }

# @router.put("/reset_password/{email}")
# async def reset_pw(email: str, body: schemas.ResetPwRequest, db: Session = Depends(get_db)):
#     user = db.query(models.Teacher).filter(models.Teacher.email == email).first()
#     if not user:
#         user = db.query(models.Student).filter(models.Student.email == email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="Email not found")

#     if not Hash.verify(user.pw, body.old_pw):  #type: ignore
#         raise HTTPException(status_code=400, detail="Old password is incorrect")

#     user.pw = Hash.bcrypt(body.new_pw)  #type: ignore
#     db.commit()
#     return {"message": "Password updated successfully"}


# @router.get("/student_attendance/{email}")
# def calculate_attendance(email: str, response: Response, db: Session = Depends(get_db)):
#     # 1️⃣ Find the student
#     student = db.query(Student).filter(Student.email == email).first()
#     if not student:
#         raise HTTPException(status_code=404, detail="Student not found")
#     dept = db.query(Department).filter(Department.Did == student.Did).first()
#     # 2️⃣ Get subjects for the student's department, year, and semester
#     subjects = (
#         db.query(Subject)
#         .filter(
#             Subject.sem == student.sem,
#             Subject.year == student.year,
#             Subject.Did == student.Did
#         )
#         .all()
#     )

#     # 3️⃣ For each subject, calculate total and weighted attended classes
#     result = []
#     for subj in subjects:
#         total_classes = (
#             db.query(func.count(Attendance.A_id))
#             .join(SubjectTeacher, SubjectTeacher.STid == Attendance.STid)
#             .filter(
#                 SubjectTeacher.Sub_id == subj.Sub_id,
#                 Attendance.Sid == student.Sid
#             )
#             .scalar() or 0
#         )

#         weighted_attendance = (
#             db.query(
#                 func.sum(
#                     case(
#                         (Attendance.status == 'Present', 1),
#                         (Attendance.status == 'Late', 0.5),
#                         else_=0
#                     )
#                 )
#             )
#             .join(SubjectTeacher, SubjectTeacher.STid == Attendance.STid)
#             .filter(
#                 SubjectTeacher.Sub_id == subj.Sub_id,
#                 Attendance.Sid == student.Sid
#             )
#             .scalar() or 0
#         )

#         result.append({
#             "id": subj.Sub_id,
#             "sub": f"{subj.sub_name} ({subj.sub_code})",
#             "total_classes": total_classes,
#             "attended_classes": weighted_attendance,
#             "attendance_percentage": round((weighted_attendance / total_classes) * 100, 2) if total_classes else "NA"
#         })

#     return {
#         "student": {
#             "name": student.name,
#             "email": student.email,
#             "dep":dept.dep, #type:ignore
#             "u_roll": student.u_roll,
#             "c_roll":student.c_roll,
#             "year": student.year,
#             "sem": student.sem
#         },
#         "subjects": result
#     }


# @router.get("/sub/{tid}/{dep}/{sem}")
# def get_sub(tid: int, dep: str,sem:int, response: Response, db: Session = Depends(get_db)):
#     # Get department by name
#     dept = db.query(Department).filter(Department.dep == dep).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")

#     # Get all subject-teacher mappings for that teacher in this department
#     sub_tch_list = (
#         db.query(SubjectTeacher)
#         .join(Subject)
#         .filter(
#             SubjectTeacher.Tid == tid,
#             Subject.Did == dept.Did,
#             Subject.sem == sem
#         )
#         .all()
#     )

#     if not sub_tch_list:
#         raise HTTPException(status_code=404, detail="Teacher has no assigned subjects in this department")

#     # Build the response list
#     results = [
#         {
#             "id": sub_tch.STid,
#             "subject": f"{sub_tch.subject.sub_name} ({sub_tch.subject.sub_code})",
#             "sem": sub_tch.subject.sem
#         }
#         for sub_tch in sub_tch_list
#     ]

#     return results

        
# @router.get("/teacher_data/{email}")
# def get_teacher_data(email: str, response: Response, db: Session = Depends(get_db)):
#     email = unquote(email)
#     teacher = db.query(Teacher).filter(Teacher.email == email).first()
#     if not teacher:
#         raise HTTPException(status_code=404, detail="Teacher not found")
#     return {
#         "id": teacher.Tid,
#         "name": teacher.name,
#         "email": teacher.email
#     }


# @router.get("/department_students")
# def get_department_students(response: Response, db: Session = Depends(get_db)):
#     departments = db.query(Department).filter(func.lower(Department.role) == "student").all()

#     result = [
#         {
#             "id": dept.Did,  # React Admin expects 'id'
#             # "val" : dept.dep,
#             "dep": dept.dep  # Display name in dropdown
#         }
#         for dept in departments
#     ]

#     total = len(result)
#     response.headers["Content-Range"] = f"departments 0-{total-1}/{total}"
#     return result


# @router.get("/student_list/{did}/{sem}")
# def get_student_list(did:int,sem:int, response: Response, db: Session = Depends(get_db)):
#     dept = db.query(Department).filter(Department.Did == did).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
#     student =(db.query(Student)
#               .join(Department)
#               .filter(
#                   Department.Did == did,
#                   Student.sem == sem
#                 ).all()
#               )
#     if not student :
#         raise HTTPException(status_code=404, detail="Student not found")
    
#     results = [ 
#                {
#                    "id":st.Sid,
#                    "name" :st.name,
#                    "u_roll" : st.u_roll,
#                    "c_roll" : st.c_roll,
#                    "sem" : st.sem    
#                } for st in student
#     ]
#     return results
    
        
# @router.get("/teacher_list")
# def get_teacher_list(response: Response, db: Session = Depends(get_db)):
#     dept =db.query(models.Department). filter(models.Department.role == "Teacher").first()
#     teachers = db.query(models.Teacher).filter(models.Teacher.Did == dept.Did).all() #type:ignore
#     result = []
#     for tch in teachers:
#         result.append({
#             "id": tch.Tid,  # REQUIRED for React Admin
#             "teacher": f"{tch.name} ( {tch.name_code} )"
#         })

#     total = len(result)
#     response.headers["Content-Range"] = f"teacher 0-{total-1}/{total}"
#     return result


# @router.get("/subject_filter/{yr},{sem},{dep}")
# def filter_subjects(yr: int, sem: int, dep: str, db: Session = Depends(get_db)):
#     # 1️⃣ Get department by name
#     dept = db.query(models.Department).filter(models.Department.dep == dep).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
    
#     # 2️⃣ Filter subjects by Did, year, and sem
#     subjects = db.query(models.Subject).filter(
#         models.Subject.year == yr,
#         models.Subject.sem == sem,
#         models.Subject.Did == dept.Did
#     ).all()
    
#     if not subjects:
#         raise HTTPException(status_code=404, detail="No subjects found")

#     # 3️⃣ Return "label" for dropdown display
#     result = [
#         {
#             "id": sub.sub_code,  # used as value in <SelectInput>
#             "label": f"{sub.sub_name} ({sub.sub_code})"  # shown in dropdown
#         }
#         for sub in subjects
#     ]
    
#     # total = len(result)
#     # response.headers["Content-Range"] = f"departments 0-{total-1}/{total}"

#     return result

# @router.get("/subject_list")
# def get_subject_list(response: Response, db: Session = Depends(get_db)):
#     subjects = db.query(models.Subject).all()
#     result = []
#     for sub in subjects:
#         result.append({
#             "id": sub.Sub_id,
#             "subject" : f"{sub.sub_name} ({sub.sub_code})"
#         })
#     total = len(result)
#     response.headers["Content-Range"] = f"subjects 0-{total-1}/{total}"
#     return result



# @router.get("/get_subject/{sem},{dep}")
# def filter_subject( sem: int, dep: str, db: Session = Depends(get_db)):
#     # 1️⃣ Get department by name
#     dept = db.query(models.Department).filter(models.Department.dep == dep).first()
#     if not dept:
#         raise HTTPException(status_code=404, detail="Department not found")
    
#     # 2️⃣ Filter subjects by Did, year, and sem
#     subjects = db.query(models.Subject).filter(

#         models.Subject.sem == sem,
#         models.Subject.Did == dept.Did
#     ).all()
    
#     if not subjects:
#         raise HTTPException(status_code=404, detail="No subjects found")

#     # 3️⃣ Return "label" for dropdown display
#     result = [
#         {
#             "id": sub.Sub_id,  # used as value in <SelectInput>
#             "label": f"{sub.sub_name} ({sub.sub_code})"  # shown in dropdown
#         }
#         for sub in subjects
#     ]


#     return result


    
# @router.get("/available_teacher/{sub_id}")
# def available_teacher(sub_id: int, slot: int, day: str, db: Session = Depends(get_db)):

#     # 1. Get all teacher-subject mappings for this subject
#     sub_tch = db.query(models.SubjectTeacher).all()
#     sub_tch_list = db.query(models.SubjectTeacher).filter(
#         models.SubjectTeacher.Sub_id == sub_id
#     ).all()
#     st_ids = [st.Tid for st in sub_tch_list]
    
#     if not st_ids:
#         return {"available_teachers": []}
    
#     busy_tch_list = db.query(models.Routine).filter(
#         models.Routine.Sl_id == slot,
#         models.Routine.day == day
#     ).all()
#     busy_st_ids = [bt.STid for bt in busy_tch_list]
#     busy_teacher_ids = []
#     for bt in busy_st_ids:
#         tch = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.STid == bt).first()
#         if tch:
#             busy_teacher_ids.append(tch.Tid)

#     available_tch = list(set(st_ids) - set(busy_teacher_ids))

#     available_teachers = []
#     for st in available_tch:
#         sub_tch = db.query(models.SubjectTeacher).filter(models.SubjectTeacher.Tid == st).first()
#         teacher = db.query(models.Teacher).filter(models.Teacher.Tid == st).first() #type: ignore

#         if teacher:
#             available_teachers.append({
#                 "STid": sub_tch.STid,#type: ignore
#                 "Sub_id": sub_tch.Sub_id, #type: ignore
#                 "Tid": st,
#                 "name": teacher.name,
#                 "email": teacher.email,
#                 "name_code": teacher.name_code,
#                 "department": teacher.Did
#             })

#     return available_teachers
