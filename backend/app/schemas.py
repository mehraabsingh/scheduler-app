from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, time, datetime
import uuid

class EventTypeBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = True

class EventTypeCreate(EventTypeBase):
    pass

class EventTypeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    slug: Optional[str] = None
    is_active: Optional[bool] = None

class EventType(EventTypeBase):
    id: uuid.UUID
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AvailabilityBase(BaseModel):
    weekday: int
    enabled: Optional[bool] = True
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = "UTC"

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityUpdate(BaseModel):
    enabled: Optional[bool] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None

class Availability(AvailabilityBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class BookingBase(BaseModel):
    event_type_id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    email: Optional[str] = None
    booking_date: Optional[date] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: uuid.UUID
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
