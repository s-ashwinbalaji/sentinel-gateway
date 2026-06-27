from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import database
import time
import re

app = FastAPI(title="Sentinel Zero-Trust AI Gateway")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
database.init_db()

class PayloadRequest(BaseModel):
    source: str = "Agent A (Public Bot)"
    destination: str = "Agent B (Internal DB)"
    payload: str

# Mock Security Engine (Rules Based)
def analyze_payload(payload_text: str):
    payload_lower = payload_text.lower()
    
    # 1. Prompt Injection Check
    injection_keywords = ["ignore previous", "system override", "you are now", "forget instructions"]
    if any(keyword in payload_lower for keyword in injection_keywords):
        return {"classification": "Prompt Injection (System Override)", "status": "Blocked"}
        
    # 2. Data Exfiltration Check (Mock Regex for NRIC or SSN patterns)
    # Simple NRIC regex: Starts with S, T, F, or G, followed by 7 digits and a letter.
    nric_pattern = r"^[STFG]\d{7}[A-Z]$"
    # Basic credit card mock regex (16 digits)
    cc_pattern = r"\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b"
    
    if re.search(nric_pattern, payload_text, re.IGNORECASE) or re.search(cc_pattern, payload_text):
        return {"classification": "Data Exfiltration (Dump PII)", "status": "Blocked"}
        
    # 3. Default Safe
    return {"classification": "Safe Query (Balance Check)", "status": "Allowed"}

@app.post("/api/chat")
def process_payload(request: PayloadRequest, db: Session = Depends(database.get_db)):
    start_time = time.time()
    
    # Analyze payload
    analysis_result = analyze_payload(request.payload)
    
    # Create log entry
    db_log = database.SecurityLog(
        source=request.source,
        destination=request.destination if analysis_result["status"] == "Allowed" else "Sentinel Gateway (Proxy)",
        payload_classification=analysis_result["classification"],
        status=analysis_result["status"],
        payload=request.payload
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # Gateway Latency Simulation
    process_time_ms = int((time.time() - start_time) * 1000)
    
    return {
        "id": db_log.id,
        "classification": analysis_result["classification"],
        "status": analysis_result["status"],
        "latency_ms": process_time_ms
    }

@app.get("/api/logs")
def get_logs(limit: int = 10, db: Session = Depends(database.get_db)):
    logs = db.query(database.SecurityLog).order_by(database.SecurityLog.timestamp.desc()).limit(limit).all()
    return logs

@app.get("/api/metrics")
def get_metrics(db: Session = Depends(database.get_db)):
    total_traffic = db.query(database.SecurityLog).count()
    threats_intercepted = db.query(database.SecurityLog).filter(database.SecurityLog.status == "Blocked").count()
    
    # Calculate a simple average latency mock
    avg_latency = 12 if total_traffic > 0 else 0
    
    return {
        "total_traffic": total_traffic,
        "threats_intercepted": threats_intercepted,
        "avg_latency_ms": avg_latency
    }
