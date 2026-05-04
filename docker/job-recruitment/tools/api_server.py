from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import json
import os
import uuid
import logging
from datetime import datetime
import ipaddress
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
DOCKER_API_KEY = os.getenv("DOCKER_API_KEY", "your-super-secret-api-key-change-this")
ALLOWED_IP_RANGE = os.getenv("ALLOWED_IP_RANGE", "172.0.0.0/8")
EVENTS_DIR = "/app/events"
LOGS_DIR = "/app/logs"
OUTPUT_DIR = "/app/output"

# Ensure directories exist
for d in [EVENTS_DIR, LOGS_DIR, OUTPUT_DIR]:
    os.makedirs(d, exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"{LOGS_DIR}/api_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api_server")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Job Recruitment Event API")
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
api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != DOCKER_API_KEY:
        logger.warning(f"Invalid API Key attempt: {api_key}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials"
        )
    return api_key

async def verify_ip_whitelist(request: Request):
    client_ip = request.client.host
    # In Docker, the client IP might be the gateway or the other container's IP
    try:
        allowed_network = ipaddress.ip_network(ALLOWED_IP_RANGE)
        is_localhost = client_ip in ["127.0.0.1", "localhost", "::1", "testclient"]
        
        if not is_localhost and ipaddress.ip_address(client_ip) not in allowed_network:
            logger.warning(f"IP Blocked: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"IP {client_ip} not authorized"
            )
    except ValueError:
        logger.error(f"Invalid ALLOWED_IP_RANGE: {ALLOWED_IP_RANGE}")
        # If range is invalid, we might want to fail safe or fail fast. 
        # For now, we'll log it and let it pass if it's localhost.
        if client_ip not in ["127.0.0.1", "localhost", "::1"]:
            raise HTTPException(status_code=500, detail="Internal IP validation error")

# Data Models
class EventRequest(BaseModel):
    scan_id: int
    scan_name: str
    target: str
    user_id: int
    event_type: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    previous_state: Optional[str] = "pending"
    new_state: Optional[str] = None

class EventResponse(BaseModel):
    event_id: str
    event_type: str
    scan_id: int
    timestamp: str
    status: str = "recorded"

# Helper to save events
def save_event(event_data: Dict[str, Any]):
    event_id = str(uuid.uuid4())
    event_data["event_id"] = event_id
    event_data["timestamp"] = datetime.now().isoformat()
    
    # Save individual JSON
    filename = f"event_{event_id}_{int(datetime.now().timestamp())}.json"
    filepath = os.path.join(EVENTS_DIR, filename)
    with open(filepath, "w") as f:
        json.dump(event_data, f, indent=2)
    
    # Append to .jsonl
    master_log = os.path.join(EVENTS_DIR, "all_events.jsonl")
    with open(master_log, "a") as f:
        f.write(json.dumps(event_data) + "\n")
    
    return event_id

# Endpoints
@app.post("/event/{event_type}", response_model=EventResponse, dependencies=[Depends(verify_api_key), Depends(verify_ip_whitelist)])
@limiter.limit("10/minute")
async def handle_event(event_type: str, request: Request, event: EventRequest):
    logger.info(f"Received {event_type} event for scan {event.scan_id} from {request.client.host}")
    
    valid_types = ["start", "pause", "resume", "delete", "update"]
    if event_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid event type. Must be one of {valid_types}")
    
    event_dict = event.dict()
    event_dict["event_type"] = event_type
    
    # Set new_state based on event_type
    state_map = {
        "start": "running",
        "pause": "paused",
        "resume": "running",
        "delete": "deleted",
        "update": "updated"
    }
    event_dict["new_state"] = state_map.get(event_type, "unknown")
    
    event_id = save_event(event_dict)
    
    return {
        "event_id": event_id,
        "event_type": event_type,
        "scan_id": event.scan_id,
        "timestamp": event_dict["timestamp"]
    }

@app.get("/events", response_model=List[Dict[str, Any]], dependencies=[Depends(verify_api_key)])
async def get_events():
    master_log = os.path.join(EVENTS_DIR, "all_events.jsonl")
    events = []
    if os.path.exists(master_log):
        with open(master_log, "r") as f:
            for line in f:
                if line.strip():
                    events.append(json.loads(line))
    return events

@app.get("/events/{scan_id}", response_model=List[Dict[str, Any]], dependencies=[Depends(verify_api_key)])
async def get_scan_events(scan_id: int):
    master_log = os.path.join(EVENTS_DIR, "all_events.jsonl")
    events = []
    if os.path.exists(master_log):
        with open(master_log, "r") as f:
            for line in f:
                if line.strip():
                    event = json.loads(line)
                    if event.get("scan_id") == scan_id:
                        events.append(event)
    return events

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "directories": {
            "events": os.path.exists(EVENTS_DIR),
            "logs": os.path.exists(LOGS_DIR),
            "output": os.path.exists(OUTPUT_DIR)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
