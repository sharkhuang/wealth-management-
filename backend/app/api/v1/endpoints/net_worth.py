from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import NetWorthEntry
from app.schemas.schemas import NetWorthEntryCreate, NetWorthEntry as NetWorthEntrySchema

router = APIRouter()

@router.post("/", response_model=NetWorthEntrySchema)
def create_net_worth_entry(entry: NetWorthEntryCreate, db: Session = Depends(get_db)):
    db_entry = NetWorthEntry(value=entry.value, date=entry.date)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/history", response_model=List[NetWorthEntrySchema])
def get_net_worth_history(db: Session = Depends(get_db)):
    entries = db.query(NetWorthEntry).order_by(NetWorthEntry.date.desc()).all()
    return entries

@router.get("/latest", response_model=NetWorthEntrySchema)
def get_latest_net_worth(db: Session = Depends(get_db)):
    entry = db.query(NetWorthEntry).order_by(NetWorthEntry.date.desc()).first()
    if not entry:
        raise HTTPException(status_code=404, detail="No net worth entries found")
    return entry 