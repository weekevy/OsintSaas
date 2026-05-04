# ~/Desktop/OsintSaas/docker/job-recruitment/tools/api_server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import json
import os
from datetime import datetime
import uuid

app = FastAPI()

# ==================== CORS Configuration (FIX) ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# ==================== Data Models ====================

class ScanEvent(BaseModel):
    """Model for all scan events"""
    event_id: str
    event_type: Literal['create', 'start', 'pause', 'resume', 'delete', 'update', 'complete', 'failed']
    scan_id: Optional[int] = None
    scan_name: Optional[str] = None
    target: Optional[str] = None
    timestamp: str
    data: Optional[dict] = None
    previous_state: Optional[str] = None
    new_state: Optional[str] = None

class JobScanData(BaseModel):
    """Job recruitment scan data model"""
    scan_id: Optional[int] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    salary_offered: Optional[str] = None
    company_website: Optional[str] = None
    company_linkedin: Optional[str] = None
    company_email_domain: Optional[str] = None
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    company_email: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_phone: Optional[str] = None
    recruiter_linkedin: Optional[str] = None
    recruiter_title: Optional[str] = None
    suspicious_message: Optional[str] = None
    communication_channel: Optional[str] = None
    red_flags_noticed: Optional[str] = None
    notes: Optional[str] = None

# ==================== Helper Functions ====================

def ensure_directories():
    """Create necessary directories if they don't exist"""
    dirs = ['/app/output', '/app/logs', '/app/data', '/app/events']
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def save_event_to_json(event: ScanEvent):
    """Save a single event as a JSON file"""
    ensure_directories()
    
    events_dir = '/app/events'
    os.makedirs(events_dir, exist_ok=True)
    
    # Save individual event file
    event_filename = f"{events_dir}/event_{event.event_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(event_filename, 'w') as f:
        json.dump(event.dict(), f, indent=2)
    
    # Also append to master log file
    master_log = f"{events_dir}/all_events.jsonl"
    with open(master_log, 'a') as f:
        f.write(json.dumps(event.dict()) + '\n')
    
    return event_filename

def save_scan_data_to_json(scan_data: JobScanData, event_type: str):
    """Save scan data to JSON file"""
    ensure_directories()
    
    output_dir = '/app/output'
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    scan_filename = f"{output_dir}/scan_{scan_data.scan_id}_{timestamp}_{event_type}.json"
    with open(scan_filename, 'w') as f:
        json.dump({
            'event_type': event_type,
            'timestamp': datetime.now().isoformat(),
            'scan_data': scan_data.dict()
        }, f, indent=2)
    
    return scan_filename

# ==================== OPTIONS Handlers (CORS preflight) ====================

@app.options("/event/{event_type}")
async def options_handler(event_type: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}

@app.options("/scan")
async def options_scan_handler():
    """Handle OPTIONS requests for /scan endpoint"""
    return {"message": "OK"}

@app.options("/events")
async def options_events_handler():
    """Handle OPTIONS requests for /events endpoint"""
    return {"message": "OK"}

# ==================== Event Handlers ====================

@app.post("/event/create")
async def handle_create_event(scan_data: JobScanData):
    """Handle scan creation event"""
    event_id = str(uuid.uuid4())[:8]
    
    event = ScanEvent(
        event_id=event_id,
        event_type='create',
        scan_id=scan_data.scan_id,
        scan_name=scan_data.job_title,
        target=scan_data.company_name,
        timestamp=datetime.now().isoformat(),
        data=scan_data.dict(),
        new_state='created'
    )
    
    filepath = save_event_to_json(event)
    scan_filepath = save_scan_data_to_json(scan_data, 'create')
    
    print(f"\n📝 EVENT: CREATE")
    print(f"   Event ID: {event_id}")
    print(f"   Scan ID: {scan_data.scan_id}")
    print(f"   Company: {scan_data.company_name}")
    print(f"   Job: {scan_data.job_title}")
    print(f"   Saved to: {filepath}")
    
    return {
        "success": True,
        "event_id": event_id,
        "event_type": "create",
        "message": "Scan creation event recorded",
        "files": {"event": filepath, "scan_data": scan_filepath}
    }

@app.post("/event/start")
async def handle_start_event(event_data: dict):
    """Handle scan start event"""
    event_id = str(uuid.uuid4())[:8]
    
    event = ScanEvent(
        event_id=event_id,
        event_type='start',
        scan_id=event_data.get('scan_id'),
        scan_name=event_data.get('scan_name'),
        target=event_data.get('target'),
        timestamp=datetime.now().isoformat(),
        data=event_data.get('data', {}),
        previous_state=event_data.get('previous_state', 'pending'),
        new_state='running'
    )
    
    filepath = save_event_to_json(event)
    
    print(f"\n▶️ EVENT: START")
    print(f"   Event ID: {event_id}")
    print(f"   Scan ID: {event_data.get('scan_id')}")
    print(f"   Scan Name: {event_data.get('scan_name')}")
    print(f"   Target: {event_data.get('target')}")
    print(f"   Saved to: {filepath}")
    
    return {
        "success": True,
        "event_id": event_id,
        "event_type": "start",
        "message": "Scan start event recorded"
    }

@app.post("/event/pause")
async def handle_pause_event(event_data: dict):
    """Handle scan pause event"""
    event_id = str(uuid.uuid4())[:8]
    
    event = ScanEvent(
        event_id=event_id,
        event_type='pause',
        scan_id=event_data.get('scan_id'),
        scan_name=event_data.get('scan_name'),
        target=event_data.get('target'),
        timestamp=datetime.now().isoformat(),
        data=event_data.get('data', {}),
        previous_state='running',
        new_state='paused'
    )
    
    filepath = save_event_to_json(event)
    
    print(f"\n⏸️ EVENT: PAUSE")
    print(f"   Event ID: {event_id}")
    print(f"   Scan ID: {event_data.get('scan_id')}")
    print(f"   Saved to: {filepath}")
    
    return {
        "success": True,
        "event_id": event_id,
        "event_type": "pause",
        "message": "Scan pause event recorded"
    }

@app.post("/event/resume")
async def handle_resume_event(event_data: dict):
    """Handle scan resume event"""
    event_id = str(uuid.uuid4())[:8]
    
    event = ScanEvent(
        event_id=event_id,
        event_type='resume',
        scan_id=event_data.get('scan_id'),
        scan_name=event_data.get('scan_name'),
        target=event_data.get('target'),
        timestamp=datetime.now().isoformat(),
        data=event_data.get('data', {}),
        previous_state='paused',
        new_state='running'
    )
    
    filepath = save_event_to_json(event)
    
    print(f"\n🔄 EVENT: RESUME")
    print(f"   Event ID: {event_id}")
    print(f"   Scan ID: {event_data.get('scan_id')}")
    print(f"   Saved to: {filepath}")
    
    return {
        "success": True,
        "event_id": event_id,
        "event_type": "resume",
        "message": "Scan resume event recorded"
    }

@app.post("/event/delete")
async def handle_delete_event(event_data: dict):
    """Handle scan delete event"""
    event_id = str(uuid.uuid4())[:8]
    
    event = ScanEvent(
        event_id=event_id,
        event_type='delete',
        scan_id=event_data.get('scan_id'),
        scan_name=event_data.get('scan_name'),
        target=event_data.get('target'),
        timestamp=datetime.now().isoformat(),
        data=event_data.get('data', {}),
        previous_state=event_data.get('previous_state', 'any'),
        new_state='deleted'
    )
    
    filepath = save_event_to_json(event)
    
    print(f"\n🗑️ EVENT: DELETE")
    print(f"   Event ID: {event_id}")
    print(f"   Scan ID: {event_data.get('scan_id')}")
    print(f"   Scan Name: {event_data.get('scan_name')}")
    print(f"   Saved to: {filepath}")
    
    return {
        "success": True,
        "event_id": event_id,
        "event_type": "delete",
        "message": "Scan delete event recorded"
    }

@app.post("/event/update")
async def handle_update_event(event_data: dict):
    """Handle scan update event (assets edited)"""
    event_id = str(uuid.uuid4())[:8]
    
    event = ScanEvent(
        event_id=event_id,
        event_type='update',
        scan_id=event_data.get('scan_id'),
        scan_name=event_data.get('scan_name'),
        target=event_data.get('target'),
        timestamp=datetime.now().isoformat(),
        data=event_data.get('data', {}),
        new_state='updated'
    )
    
    filepath = save_event_to_json(event)
    
    print(f"\n✏️ EVENT: UPDATE")
    print(f"   Event ID: {event_id}")
    print(f"   Scan ID: {event_data.get('scan_id')}")
    print(f"   Scan Name: {event_data.get('scan_name')}")
    print(f"   Saved to: {filepath}")
    
    return {
        "success": True,
        "event_id": event_id,
        "event_type": "update",
        "message": "Scan update event recorded"
    }

# ==================== Backward Compatible /scan endpoint ====================

@app.post("/scan")
async def scan_backward_compatible(scan_data: JobScanData):
    """Backward compatible endpoint - calls create event"""
    print(f"\n⚠️ /scan endpoint called (backward compatible)")
    return await handle_create_event(scan_data)

# ==================== Query Endpoints ====================

@app.get("/events")
async def get_all_events():
    """Retrieve all events from the master log"""
    events_dir = '/app/events'
    master_log = f"{events_dir}/all_events.jsonl"
    
    events = []
    if os.path.exists(master_log):
        with open(master_log, 'r') as f:
            for line in f:
                if line.strip():
                    events.append(json.loads(line))
    
    return {
        "success": True,
        "total_events": len(events),
        "events": events[-100:]
    }

@app.get("/events/{scan_id}")
async def get_scan_events(scan_id: int):
    """Get all events for a specific scan"""
    events_dir = '/app/events'
    master_log = f"{events_dir}/all_events.jsonl"
    
    events = []
    if os.path.exists(master_log):
        with open(master_log, 'r') as f:
            for line in f:
                if line.strip():
                    event = json.loads(line)
                    if event.get('scan_id') == scan_id:
                        events.append(event)
    
    return {
        "success": True,
        "scan_id": scan_id,
        "total_events": len(events),
        "events": events
    }

@app.get("/output")
async def list_output_files():
    """List all stored JSON output files"""
    output_dir = '/app/output'
    files = []
    
    if os.path.exists(output_dir):
        for f in os.listdir(output_dir):
            if f.endswith('.json'):
                files.append(f)
    
    return {
        "success": True,
        "output_directory": output_dir,
        "files": sorted(files, reverse=True)
    }

@app.get("/output/{filename}")
async def get_output_file(filename: str):
    """Retrieve a specific output JSON file"""
    output_dir = '/app/output'
    filepath = os.path.join(output_dir, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    return data

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    ensure_directories()
    return {
        "status": "healthy",
        "container": "job-recruitment-tool",
        "directories": {
            "output": "/app/output",
            "events": "/app/events",
            "logs": "/app/logs",
            "data": "/app/data"
        }
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Job Recruitment Scanner",
        "status": "running",
        "endpoints": {
            "POST /event/create": "Record scan creation",
            "POST /event/start": "Record scan start",
            "POST /event/pause": "Record scan pause",
            "POST /event/resume": "Record scan resume",
            "POST /event/delete": "Record scan deletion",
            "POST /event/update": "Record scan update",
            "GET /events": "Get all events",
            "GET /events/{scan_id}": "Get events for a scan",
            "GET /output": "List output files",
            "GET /output/{filename}": "Get output file",
            "GET /health": "Health check"
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    ensure_directories()
    
    print("\n" + "="*70)
    print("🐳 JOB RECRUITMENT DOCKER CONTAINER (Event Logger)")
    print("="*70)
    print("CORS enabled - Accepting requests from any origin")
    print("Directories:")
    print("  - /app/output     : Scan data files")
    print("  - /app/events     : Event log files")
    print("  - /app/logs       : General logs")
    print("  - /app/data       : Data storage")
    print("="*70 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")