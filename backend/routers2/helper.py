# from fastapi import APIRouter, Depends ,BackgroundTasks, UploadFile, File, Form
# from sqlalchemy.orm import Session
# from sqlalchemy import select, union_all
# from db import get_db
# from models import Department, Teacher, Student

# from pydantic import EmailStr

# router = APIRouter()


# from fastapi import APIRouter, BackgroundTasks, Form, UploadFile, File
# from pydantic import EmailStr
# from typing import Optional
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from email.mime.application import MIMEApplication

# router = APIRouter()

# # ---- Email Config ----
# SMTP_SERVER = "smtp.gmail.com"
# SMTP_PORT = 587
# MY_EMAIL = "projtest2025@gmail.com"
# MY_PASSWORD = "qpazhkxtwdykouzq"  # Use env variable in production!

# # ---- Email Sender Function ----
# def send_to_me(
#     user_name: str,
#     user_email: str,
#     subject: str,
#     message: str,
#     file_content: Optional[bytes] = None,
#     filename: Optional[str] = None
# ):
#     msg = MIMEMultipart()
#     msg["From"] = MY_EMAIL   # IMPORTANT: must be your email (not user's)
#     msg["To"] = MY_EMAIL
#     msg["Subject"] = f"[Contact Form] {subject}"

#     body = f"""
# You received a new message:

# Name: {user_name}
# Email: {user_email}

# Message:
# {message}
# """
#     msg.attach(MIMEText(body, "plain"))

#     # Attachment (optional)
#     if file_content and filename:
#         part = MIMEApplication(file_content, Name=filename)
#         part["Content-Disposition"] = f'attachment; filename="{filename}"'
#         msg.attach(part)

#     # Send mail
#     with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
#         server.starttls()
#         server.login(MY_EMAIL, MY_PASSWORD)
#         server.sendmail(MY_EMAIL, MY_EMAIL, msg.as_string())


# # ---- Router ----
# @router.post("/contact")
# async def contact(
#     background_tasks: BackgroundTasks,
#     name: str = Form(...),
#     email: EmailStr = Form(...),
#     subject: str = Form(...),
#     message: str = Form(...),
#     file: Optional[UploadFile] = File(None)
# ):
#     file_content = None
#     filename = None

#     if file:
#         file_content = await file.read()
#         filename = file.filename

#     background_tasks.add_task(
#         send_to_me, name, email, subject, message, file_content, filename
#     )

#     return {
#         "status": "success",
#         "message": "✅ Message sent successfully!"
#     }

# # from fastapi import  BackgroundTasks, UploadFile, File, Form



# # import smtplib
# # from email.mime.text import MIMEText
# # from email.mime.multipart import MIMEMultipart
# # from email.mime.application import MIMEApplication
# # from typing import Optional
# # # from fastapi.middleware.cors import CORSMiddleware
# # # import os

# # # ---- Your Email Config ----
# # SMTP_SERVER = "smtp.gmail.com"
# # SMTP_PORT = 587
# # MY_EMAIL = "projtest2025@gmail.com"
# # MY_PASSWORD = "qpazhkxtwdykouzq"  # Gmail app password (no spaces)

# # # ---- Utility ----
# # def send_to_me(user_name: str, user_email: str, subject: str, message: str, file_content: Optional[bytes] = None, filename: Optional[str] = None):
# #     """
# #     Constructs and sends an email with optional attachment.
# #     """
# #     msg = MIMEMultipart()
# #     msg["From"] = user_email
# #     msg["To"] = MY_EMAIL
# #     msg["Subject"] = f"[Contact Form] {subject}"

# #     # Body text
# #     body = f"""
# #     You received a new message from {user_name} <{user_email}>:

# #     {message}
# #     """
# #     msg.attach(MIMEText(body, "plain"))

# #     # If a file was uploaded, attach it
# #     if file_content and filename:
# #         part = MIMEApplication(file_content, Name=filename)
# #         part['Content-Disposition'] = f'attachment; filename="{filename}"'
# #         msg.attach(part)

# #     # Send email
# #     try:
# #         with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
# #             server.starttls()
# #             server.login(MY_EMAIL, MY_PASSWORD)
# #             server.sendmail(user_email, MY_EMAIL, msg.as_string())
# #         print("Email sent successfully!")
# #     except Exception as e:
# #         print(f"Failed to send email: {e}")


# # # ---- Route ----
# # @router.post("/contact/")
# # async def contact(
# #     background_tasks: BackgroundTasks,
# #     name: str = Form(...),
# #     email: EmailStr = Form(...),
# #     subject: str = Form(...),
# #     message: str = Form(...),
# #     file: Optional[UploadFile] = File(None)
# # ):
# #     """
# #     Handles the contact form submission.
# #     Reads an optional uploaded file and schedules an email to be sent in the background.
# #     """
# #     file_content = None
# #     filename = None
# #     if file:
# #         file_content = await file.read()
# #         filename = file.filename

# #     # Pass raw bytes + filename to background task
# #     background_tasks.add_task(
# #         send_to_me, name, email, subject, message, file_content, filename
# #     )
# #     return {"message": "✅ Your message has been sent successfully!"}


# @router.get("/manual")
# def get_manual(db: Session = Depends(get_db)):
#     # Teacher query
#     teacher_q = select(
#         Teacher.Did.label("Did"),
#         Teacher.name.label("name"),
#         Teacher.email.label("email"),
#     )

#     # Student query
#     student_q = select(
#         Student.Did.label("Did"),
#         Student.name.label("name"),
#         Student.email.label("email"),
#     )

#     # Union query
#     user_union = union_all(teacher_q, student_q).subquery("user_union")

#     # Join with Department
#     stmt = (
#         select(
#             Department.role,
#             user_union.c.name,
#             user_union.c.email
#         )
#         .outerjoin(user_union, Department.Did == user_union.c.Did)
#     )

#     results = db.execute(stmt).all()

#     return [
#         {
#             "role": role,
#             "name": name,
#             "email": email,
#         }
#         for role, name, email in results
#     ]