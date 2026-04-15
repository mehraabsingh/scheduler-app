from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/event-types", tags=["Event Types"])

@router.post("/", response_model=schemas.EventType)
def create_event_type(event_type: schemas.EventTypeCreate, db: Session = Depends(get_db)):
    db_event_type = models.EventType(**event_type.model_dump())
    db.add(db_event_type)
    db.commit()
    db.refresh(db_event_type)
    return db_event_type

@router.put("/{event_id}", response_model=schemas.EventType)
def update_event_type(event_id: uuid.UUID, event_type: schemas.EventTypeUpdate, db: Session = Depends(get_db)):
    db_event = db.query(models.EventType).filter(models.EventType.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    update_data = event_type.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
        
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[schemas.EventType])
def read_event_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.EventType).offset(skip).limit(limit).all()

@router.get("/{slug}", response_model=schemas.EventType)
def read_event_type_by_slug(slug: str, db: Session = Depends(get_db)):
    event_type = db.query(models.EventType).filter(models.EventType.slug == slug).first()
    if event_type is None:
        raise HTTPException(status_code=404, detail="Event type not found")
    return event_type

@router.get("/{slug}/slots")
def get_available_slots(slug: str, date: str, db: Session = Depends(get_db)):
    import datetime as dt
    # 1. Verify Event Type
    event_type = db.query(models.EventType).filter(models.EventType.slug == slug).first()
    if not event_type:
        raise HTTPException(status_code=404, detail="Event type not found")
    
    # 2. Determine requested weekday (Python weekday() -> Monday=0. DB -> 0 to 6)
    target_date = dt.date.fromisoformat(date)
    day_of_week = target_date.weekday()
    
    # 3. Check Base Availability
    availability = db.query(models.Availability).filter(
        models.Availability.weekday == day_of_week,
        models.Availability.enabled == True
    ).first()
    
    if not availability:
        return []
        
    # 4. Filter existing bookings
    existing_bookings = db.query(models.Booking).filter(
        models.Booking.event_type_id == event_type.id,
        models.Booking.booking_date == target_date,
        models.Booking.status != 'cancelled'
    ).all()
    
    # 5. Iteratively build slot strings
    slots = []
    start_dt = dt.datetime.combine(target_date, availability.start_time)
    end_dt = dt.datetime.combine(target_date, availability.end_time)
    duration_delta = dt.timedelta(minutes=event_type.duration)
    
    current_time = start_dt
    while current_time + duration_delta <= end_dt:
        is_conflict = False
        slot_end = current_time + duration_delta
        
        for b in existing_bookings:
            # Overlap check: max(start1, start2) < min(end1, end2)
            if max(current_time, b.start_time) < min(slot_end, b.end_time):
                is_conflict = True
                break
                
        if not is_conflict:
            slots.append(current_time.strftime("%H:%M:%S"))
            
        # Standard Cal.com intervals are typical event durations (or 30 mins)
        current_time += dt.timedelta(minutes=min(30, event_type.duration))
        
    return slots

@router.delete("/{event_id}")
def delete_event_type(event_id: uuid.UUID, db: Session = Depends(get_db)):
    db_event_type = db.query(models.EventType).filter(models.EventType.id == event_id).first()
    if db_event_type is None:
        raise HTTPException(status_code=404, detail="Event type not found")
    db.delete(db_event_type)
    db.commit()
    return {"ok": True}
