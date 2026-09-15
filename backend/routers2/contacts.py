# from fastapi import APIRouter, Form, UploadFile, File, HTTPException
# from typing import Optional
# import shutil
# import os

# router = APIRouter(
#     prefix="/contact",
#     tags=["Contact"]
# )

# UPLOAD_DIR = "uploads"

# # Create upload directory if not exists
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# @router.post("/")
# async def submit_contact(
#     name: str = Form(...),
#     email: str = Form(...),
#     subject: str = Form(...),
#     message: str = Form(...),
#     file: Optional[UploadFile] = File(None)
# ):
#     # ✅ Basic email validation
#     if "@" not in email:
#         raise HTTPException(status_code=400, detail="Invalid email")

#     file_path = None

#     # ✅ Handle file upload
#     if file:
#         file_path = os.path.join(UPLOAD_DIR, file.filename) #type: ignore

#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#     # ✅ You can store in DB here instead of print
#     print("New Contact Message:")
#     print({
#         "name": name,
#         "email": email,
#         "subject": subject,
#         "message": message,
#         "file": file_path
#     })

#     return {
#         "message": "Message received successfully"
#     }