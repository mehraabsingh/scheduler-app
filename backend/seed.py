import os
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app import models
import datetime

def seed():
    db = SessionLocal()
    
    # Check if we already seeded using the exact name
    if db.query(models.EventType).filter(models.EventType.slug == '15min').first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with initial events and availability...")

    # Create default event
    event = models.EventType(
        title="15 Min Meeting",
        description="A quick 15 minute catch-up.",
        duration=15,
        slug="15min",
        is_active=True
    )
    db.add(event)
    
    # Adding availability for Mon-Fri (weekdays 0 to 4 in Python)
    for day in range(5):
        avail = models.Availability(
            weekday=day,
            enabled=True,
            start_time=datetime.time(9, 0),
            end_time=datetime.time(17, 0),
            timezone="UTC"
        )
        db.add(avail)

    db.commit()

    # Create a generic booking linked to the new event
    active_event = db.query(models.EventType).filter(models.EventType.slug == '15min').first()
    
    booking = models.Booking(
        event_type_id=active_event.id,
        name="John Doe",
        email="john@example.com",
        booking_date=datetime.date.today() + datetime.timedelta(days=1),
        start_time=datetime.datetime.combine(datetime.date.today() + datetime.timedelta(days=1), datetime.time(10, 0)),
        end_time=datetime.datetime.combine(datetime.date.today() + datetime.timedelta(days=1), datetime.time(10, 15)),
        status="booked",
        notes="Just a test booking!"
    )
    db.add(booking)
    db.commit()

    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    seed()
