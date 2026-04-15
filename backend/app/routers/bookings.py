from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # Check if time slot is already booked for this specific event type (prevent double booking)
    # The assignment says: "Check if another booking exists for same event + same date + same time"
    existing_booking = db.query(models.Booking).filter(
        models.Booking.event_type_id == booking.event_type_id,
        models.Booking.booking_date == booking.booking_date,
        models.Booking.start_time == booking.start_time,
        models.Booking.status != 'cancelled'
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="Time slot already booked")

    db_booking = models.Booking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/", response_model=List[schemas.Booking])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Ensure they are returned descending by start_time
    return db.query(models.Booking).order_by(models.Booking.start_time.desc()).offset(skip).limit(limit).all()

@router.patch("/{booking_id}/cancel", response_model=schemas.Booking)
def cancel_booking(booking_id: uuid.UUID, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db_booking.status = "cancelled"
    db.commit()
    db.refresh(db_booking)
    return db_booking
