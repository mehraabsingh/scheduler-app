from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/availabilities", tags=["Availability"])

@router.post("/", response_model=schemas.Availability)
def create_availability(availability: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    db_availability = models.Availability(**availability.model_dump())
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability

@router.put("/{availability_id}", response_model=schemas.Availability)
def update_availability(availability_id: uuid.UUID, availability: schemas.AvailabilityUpdate, db: Session = Depends(get_db)):
    db_avail = db.query(models.Availability).filter(models.Availability.id == availability_id).first()
    if not db_avail:
        raise HTTPException(status_code=404, detail="Availability not found")
    
    update_data = availability.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_avail, key, value)
        
    db.commit()
    db.refresh(db_avail)
    return db_avail

@router.get("/", response_model=List[schemas.Availability])
def read_availabilities(db: Session = Depends(get_db)):
    return db.query(models.Availability).all()

@router.delete("/{availability_id}")
def delete_availability(availability_id: uuid.UUID, db: Session = Depends(get_db)):
    db_availability = db.query(models.Availability).filter(models.Availability.id == availability_id).first()
    if db_availability is None:
        raise HTTPException(status_code=404, detail="Availability not found")
    db.delete(db_availability)
    db.commit()
    return {"ok": True}
