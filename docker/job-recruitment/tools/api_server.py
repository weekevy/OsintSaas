from fastapi import FastAPI, HTTPException, Request, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
import json
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api_server")

app = FastAPI(title="Job Recruitment OSINT API")

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key Security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_api_key(api_key: str = Depends(api_key_header)):
    expected_key = os.getenv("DOCKER_API_KEY", "your-super-secret-api-key-change-this")
    if not api_key or api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    return api_key

# Models
class ScanRequest(BaseModel):
    scan_id: int
    target: str
    user_id: int = 0

class EventRequest(BaseModel):
    scan_id: int
    user_id: int
    target: str = "Unknown"
    scan_name: str = "Investigation"
    data: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class EventResponse(BaseModel):
    event_id: str
    event_type: str
    scan_id: int
    timestamp: str

# Active scans tracking
active_processes: Dict[int, asyncio.subprocess.Process] = {}

# Background Scan Runner
async def run_osint_scan(scan_id: int, target: str, user_id: int):
    """
    Executes the Main.py orchestrator in a separate process and logs output in real-time.
    Uses -u for unbuffered output to ensure immediate visibility in docker logs.
    """
    try:
        logger.info(f"🧵 Background process started for scan_id {scan_id}")
        
        # Run the Main.py script with -u for unbuffered output
        process = await asyncio.create_subprocess_exec(
            "python3", "-u", "tools/Main.py", str(scan_id), target, str(user_id),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )
        
        active_processes[scan_id] = process
        
        # Read output line by line in real-time
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            # Use sys.stdout.write to bypass any logger buffering
            output = line.decode().strip()
            sys.stdout.write(f"{output}\n")
            sys.stdout.flush()
            
        await process.wait()
        
        if process.returncode == 0:
            logger.info(f"✅ Main.py completed for scan_id {scan_id}")
        else:
            logger.error(f"❌ Main.py failed for scan_id {scan_id} with exit code {process.returncode}")
                
    except Exception as e:
        logger.error(f"💀 Critical error in background task for scan_id {scan_id}: {e}")
    finally:
        if scan_id in active_processes:
            del active_processes[scan_id]

# Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "module": "job-recruitment"
    }

@app.post("/scan/start", dependencies=[Depends(verify_api_key)])
async def start_scan_endpoint(request: ScanRequest, background_tasks: BackgroundTasks):
    logger.info(f"Received scan start request for ID {request.scan_id}")
    
    if request.scan_id in active_processes:
        return {"success": False, "message": "Scan already running"}
        
    # Start the scan in the background
    background_tasks.add_task(run_osint_scan, request.scan_id, request.target, request.user_id)
    
    return {
        "success": True,
        "message": "Scan started in background",
        "scan_id": request.scan_id
    }

@app.post("/event/{event_type}", response_model=EventResponse, dependencies=[Depends(verify_api_key)])
@limiter.limit("20/minute")
async def handle_event(event_type: str, request: Request, event: EventRequest, background_tasks: BackgroundTasks):
    event_dict = event.dict()
    event_dict["event_type"] = event_type
    
    logger.info(f"🔔 EVENT RECEIVED [{event_type.upper()}]: {json.dumps(event_dict, indent=2)}")
    
    valid_types = ["start", "pause", "resume", "delete", "update"]
    if event_type not in valid_types:
        logger.warning(f"❌ Invalid event type: {event_type}")
        raise HTTPException(status_code=400, detail=f"Invalid event type. Must be one of {valid_types}")
    
    # Handle process control
    if event_type == "resume" and event.scan_id not in active_processes:
        logger.info(f"▶️ Resuming scan {event.scan_id} in background")
        background_tasks.add_task(run_osint_scan, event.scan_id, event.target, event.user_id)
    
    if event.scan_id in active_processes:
        process = active_processes[event.scan_id]
        if event_type == "delete" or event_type == "pause":
            try:
                process.terminate()
                logger.info(f"Process for scan {event.scan_id} terminated/paused via event")
            except Exception as e:
                logger.error(f"Error terminating process {event.scan_id}: {e}")
    
    event_id = f"evt_{int(datetime.now().timestamp() * 1000)}"
    
    return {
        "event_id": event_id,
        "event_type": event_type,
        "scan_id": event.scan_id,
        "timestamp": event_dict["timestamp"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
