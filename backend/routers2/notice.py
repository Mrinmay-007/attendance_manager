# from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form,status
# from sqlalchemy.orm import Session
# import models,schemas
# from db import get_db
# import uuid, os
# # from fastapi.responses import StreamingResponse
# import io
# from fastapi.responses import FileResponse,Response ,JSONResponse
# import traceback


# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# router = APIRouter(
#     prefix="/notice",
#     tags=["Notice"]
# )


# @router.post("/", status_code=status.HTTP_201_CREATED)
# async def create_notice(
#     email: str = Form(...),
#     Did: int = Form(...),
#     content: str = Form(...),
#     file: UploadFile = File(None),
#     db: Session = Depends(get_db)
# ):
#     tch = db.query(models.Teacher).filter(models.Teacher.email == email).first()
#     if not tch:
#         raise HTTPException(status_code=404, detail="Teacher not found")

#     file_data = None
#     file_type = None
#     if file:
#         file_data = await file.read()
#         if file.filename:
#             # Safely extract extension
#             parts = file.filename.rsplit(".", 1)
#             if len(parts) > 1:
#                 file_type = parts[1].lower()   # e.g. "pdf", "jpg", "png"
#             else:
#                 file_type = "unknown"

#     new_notice = models.Notice(
#         Tid=tch.Tid,
#         Did=Did,
#         content=content,
#         file_type=file_type,
#         file=file_data
#     )
#     db.add(new_notice)
#     db.commit()
#     db.refresh(new_notice)

#     return {"message": "Notice created", "id": new_notice.N_id}



# @router.get("/history/{email}")
# def notice_history(email: str, db: Session = Depends(get_db)):
   
#     user = db.query(models.Teacher).filter(models.Teacher.email == email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="Teacher not found")

#     notices = db.query(models.Notice).filter(models.Notice.Tid == user.Tid).all()

#     return [
#         {
#             'id':notice.N_id,
#             'dep':notice.department.dep,
#             'content':notice.content,
#             'date_time': notice.date_time,
#             'file': f'notice_{notice.N_id}.{notice.file_type}' if notice.file else None #type: ignore
#         }for notice in notices
#     ]


# @router.get("/{email}")
# def get_notice(email: str, db: Session = Depends(get_db)):
#     user = db.query(models.Student).filter(models.Student.email == email).first()
#     if not user:
#         user = db.query(models.Teacher).filter(models.Teacher.email == email).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     notices = db.query(models.Notice).filter(models.Notice.Did == user.Did).all()

#     return [
#         {
#             'id':notice.N_id,
#             'content':notice.content,
            
#         }for notice in notices 
#     ]


    
# @router.get("/image/{id}")
# def get_notice_image(id: int, db: Session = Depends(get_db)):

#     notice = db.query(models.Notice).filter(models.Notice.N_id == id).first()

#     if not notice:
#         raise HTTPException(status_code=404, detail="Notice not found")
    
#     if not notice.file:  # type: ignore
#         raise HTTPException(status_code=404, detail="Image not found for this notice")

#     return Response(
#         content=notice.file,   
#         media_type=f"image/{notice.file_type}",  
#         headers={
#             "Content-Disposition": f'attachment; filename="notice_{notice.N_id}.{notice.file_type}"'
#         }
#     )


# @router.delete("/{id}")
# def delete_notice(id: int, db: Session = Depends(get_db)):
#     notice = db.query(models.Notice).filter(models.Notice.N_id == id).first()
#     if not notice:
#         raise HTTPException(status_code=404, detail="Notice not found")

#     db.delete(notice)
#     db.commit()

#     return {"message": "Notice deleted"}