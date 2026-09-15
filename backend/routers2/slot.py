
# from fastapi import APIRouter, Depends, HTTPException, Response, status
# from sqlalchemy.orm import Session
# import schemas,models
# from models import Slot
# from db import get_db




# router  = APIRouter(
#     prefix="/slot",
#     tags=["Slot"]
# )

# @router.get("/")
# def get_all_slot(response: Response, db: Session = Depends(get_db)):
#     slots = db.query(models.Slot).all()
#     result = []
#     for slot in slots:
#         result.append({
#             "id": slot.Sl_id,
#             "start": slot.start,
#             "end": slot.end,
#             # "day": slot.day,
#             "sl_name": slot.sl_name
#         })
#     total = len(result)
    
#     # Example: Content-Range: items 0-9/100
#     response.headers["Content-Range"] = f"departments 0-{total-1}/{total}"
#     return result


# @router.post("/", status_code=status.HTTP_201_CREATED)
# def create_slot(slot: schemas.Slot, db: Session = Depends(get_db)):
#     new_slot = models.Slot(
        
#         start=slot.start,
#         end=slot.end,
#         # day=slot.day,
#         sl_name=slot.sl_name
#     )
#     db.add(new_slot)
#     db.commit()
#     db.refresh(new_slot)
#     return {
#         "id": new_slot.Sl_id,
#         "start": new_slot.start,
#         "end": new_slot.end,
#         # "day": new_slot.day,
#         "sl_name": new_slot.sl_name
#     }
    

# @router.delete("/{sl_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_slot(sl_id: int, db: Session = Depends(get_db)):
#     slot = db.query(models.Slot).filter(models.Slot.Sl_id == sl_id).first()
#     if not slot:
#         raise HTTPException(status_code=404, detail="Slot not found")
#     db.delete(slot)
#     db.commit()
#     return {"data": {"id": sl_id}}


# @router.put("/{sl_id}")
# def edit_slot(sl_id: int, updated: schemas.Slot, db: Session = Depends(get_db)):
#     slot = db.query(models.Slot).filter(models.Slot.Sl_id == sl_id).first()
#     if not slot:
#         raise HTTPException(status_code=404, detail="Slot not found")
    
#     slot.start = updated.start #type: ignore
#     slot.end = updated.end #type: ignore
#     # slot.day = updated.day #type: ignore
#     slot.sl_name = updated.sl_name #type: ignore

#     db.commit()
#     return {
#         "id": slot.Sl_id,
#         "start": slot.start,
#         "end": slot.end,
#         # "day": slot.day,
#         "sl_name": slot.sl_name
#     }
    
    
# @router.get("/{sl_id}")
# def get_slot(sl_id: int, db: Session = Depends(get_db)):
#     slot = db.query(models.Slot).filter(models.Slot.Sl_id == sl_id).first()
#     if not slot:
#         raise HTTPException(status_code=404, detail="Slot not found")
#     return {
#         "id": slot.Sl_id,
#         "start": slot.start,
#         "end": slot.end,
#         # "day": slot.day,
#         "sl_name": slot.sl_name
#     }