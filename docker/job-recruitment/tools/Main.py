import os
import json
import sys
import logging
import asyncio
import httpx
import aiomysql
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# --- CONFIGURATION ---
class ConfigManager:
    def __init__(self):
        self.docker_key = os.getenv("DOCKER_API_KEY", "your-super-secret-api-key-change-this")
        self.backend_url = os.getenv("BACKEND_URL", "http://172.19.0.1:4000")
        self.ws_notify_url = os.getenv("WS_NOTIFY_URL", "http://172.19.0.1:4005/notify")
        
        # Database Direct Connection
        self.db_host = os.getenv("MARIADB_HOST", "mariadb")
        self.db_name = os.getenv("MARIADB_DATABASE", "osintsaas")
        self.db_user = os.getenv("MARIADB_USER", "osintuser")
        self.db_pass = os.getenv("MARIADB_PASSWORD", "osintpassword")
        
        self.output_dir = Path(os.getenv("OUTPUT_DIR", "output"))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.max_concurrent_tasks = 4

config = ConfigManager()

def loud_log(msg, level="INFO", module=None, scan_id=None, data=None, user_id=0):
    timestamp = datetime.now().strftime("%H:%M:%S")
    mod_tag = f"[{module}]" if module else "[SYSTEM]"
    scan_tag = f"[SCAN-{scan_id}]" if scan_id else ""
    log_msg = f"{timestamp} - {level} - {scan_tag}{mod_tag} {msg}"
    sys.stdout.write(f"{log_msg}\n")
    if data:
        sys.stdout.write(f"--- DATA: {json.dumps(data, indent=2, default=str)}\n")
    sys.stdout.flush()
    
    # Send WebSocket log if user_id is provided
    if user_id:
        asyncio.create_task(send_ws_log(user_id, scan_id, log_msg, level, module))

async def send_ws_log(user_id, scan_id, message, level="INFO", module=None):
    try:
        async with httpx.AsyncClient() as client:
            await client.post(config.ws_notify_url, json={
                "type": "scan_log",
                "userId": user_id,
                "data": {
                    "scan_id": scan_id,
                    "message": message,
                    "level": level,
                    "module": module,
                    "timestamp": datetime.now().isoformat()
                }
            }, timeout=2.0)
    except: pass

# --- DATABASE MANAGER ---
class DatabaseManager:
    def __init__(self):
        self.pool = None
        self.last_progress = 0
        self.lock = asyncio.Lock()

    async def ensure_pool(self):
        async with self.lock:
            if not self.pool:
                self.pool = await aiomysql.create_pool(
                    host=config.db_host,
                    port=3306,
                    user=config.db_user,
                    password=config.db_pass,
                    db=config.db_name,
                    autocommit=True,
                    minsize=1,
                    maxsize=10
                )

    async def update_progress(self, scan_id: int, progress: int, user_id: int = 0):
        await self.ensure_pool()
        async with self.lock:
            # We still update the DB only if progress increased
            if progress > self.last_progress:
                self.last_progress = progress
                try:
                    async with self.pool.acquire() as conn:
                        async with conn.cursor() as cur:
                            await cur.execute("UPDATE scans SET progress = %s, updated_at = NOW() WHERE id = %s", (progress, scan_id))
                except Exception as e:
                    loud_log(f"DB PROGRESS UPDATE ERROR: {e}", "ERROR")
            
            # ALWAYS send WebSocket notification to ensure the UI stays updated
            # Even if progress didn't change, it acts as a heartbeat
            try:
                await self.send_ws_notification("scan_progress", user_id, {
                    "scan_id": scan_id,
                    "progress": progress,
                    "status": "running"
                })
            except: pass

    async def send_ws_notification(self, event_type: str, user_id: int, data: Dict):
        if not user_id: return
        try:
            async with httpx.AsyncClient() as client:
                await client.post(config.ws_notify_url, json={
                    "type": event_type,
                    "userId": user_id,
                    "data": data
                }, timeout=5.0) # Increased timeout
        except Exception as e:
            loud_log(f"WS NOTIFY ERROR: {e}", "DEBUG")

    async def finalize_scan(self, scan_id: int, analysis: Dict, user_id: int = 0):
        """Persists the final analyzed results to the database."""
        await self.ensure_pool()
        async with self.lock:
            try:
                score = analysis['score']
                level = analysis['level']
                findings = analysis['findings']
                
                async with self.pool.acquire() as conn:
                    async with conn.cursor() as cur:
                        # 1. Update main scans table
                        await cur.execute(
                            "UPDATE scans SET status = 'completed', progress = 100, findings_count = %s, completed_at = NOW(), updated_at = NOW() WHERE id = %s",
                            (len(findings), scan_id)
                        )
                        
                        # 2. Update job_recruitment_scans table
                        findings_json = json.dumps(findings)
                        await cur.execute(
                            """UPDATE job_recruitment_scans 
                               SET risk_score = %s, risk_level = %s, analysis_status = 'completed', findings_summary = %s, updated_at = NOW() 
                               WHERE scan_id = %s""",
                            (score, level, findings_json, scan_id)
                        )
                        
                        # 3. Insert individual findings
                        for flag in findings[:20]: # Limit to 20 findings
                            await cur.execute(
                                """INSERT INTO findings (scan_id, finding_type, severity, title, description, created_at) 
                                   VALUES (%s, 'security_risk', %s, %s, 'Automated OSINT module finding', NOW())""",
                                (scan_id, level, flag)
                            )
                        
                        # 4. Create notification
                        if not user_id:
                            await cur.execute(
                                "SELECT p.user_id FROM scans s JOIN targets t ON s.target_id = t.id JOIN projects p ON t.project_id = p.id WHERE s.id = %s",
                                (scan_id,)
                            )
                            res = await cur.fetchone()
                            if res: user_id = res[0]
                        
                        if user_id:
                            # Ensure we have project_id for the completion notification
                            if not self.project_id:
                                await cur.execute("SELECT t.project_id FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.id = %s", (scan_id,))
                                res_pid = await cur.fetchone()
                                if res_pid: self.project_id = res_pid[0]

                            await cur.execute(
                                "INSERT INTO notifications (user_id, title, message, type, scan_id, created_at) VALUES (%s, %s, %s, %s, %s, NOW())",
                                (user_id, f"Investigation Ready #{scan_id}", f"Risk Score: {score}% - {len(findings)} red flags found", "threat" if score > 70 else "warning", scan_id)
                            )
                            
                            # Send WebSocket notification for completion
                            await self.send_ws_notification("scan_completed", user_id, {
                                "scan_id": scan_id,
                                "score": score,
                                "level": level,
                                "findings_count": len(findings),
                                "projectId": self.project_id
                            })

                            # ALSO send new_notification event to trigger real-time alert UI
                            await self.send_ws_notification("new_notification", user_id, {
                                "type": "success" if score < 25 else "threat" if score > 70 else "warning",
                                "title": f"Scan Completed #{scan_id}",
                                "message": f"Risk Score: {score}% - Findings: {len(findings)}",
                                "scan_id": scan_id,
                                "projectId": self.project_id
                            })

                loud_log(f"DB FINALIZED: Score {score}%", scan_id=scan_id, user_id=user_id)
            except Exception as e:
                loud_log(f"DB FINALIZE ERROR: {e}", "ERROR", scan_id=scan_id, user_id=user_id)

    async def close(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

# --- RESULT ANALYZER ---
class ResultAnalyzer:
    """Algorithm to process aggregated module data into a final risk score."""
    def __init__(self, results: Dict):
        self.results = results
        # Weighted importance of each module
        self.weights = {
            "Domain Intel": 0.15,
            "Email Forensics": 0.15,
            "Infra Mapping": 0.10,
            "Typosquatting": 0.15,
            "SSL Analysis": 0.05,
            "Company Verify": 0.15,
            "Recruiter Check": 0.10,
            "Job Analysis": 0.15
        }

    def analyze(self) -> Dict:
        total_score = 0
        all_findings = []
        modules_data = self.results.get("modules", {})
        
        for name, mod in modules_data.items():
            if not mod.get("success"): continue
            
            data = mod.get("data", {})
            # Extract score (handle different possible field names from modules)
            score = data.get("overall_risk_score") or data.get("risk_score") or 0
            findings = data.get("red_flags") or []
            
            # Apply weight
            weight = self.weights.get(name, 0.05)
            total_score += score * weight
            all_findings.extend(findings)
            
        final_score = int(min(100, total_score))
        
        # Deduplicate and limit findings
        unique_findings = list(set(all_findings))
        
        return {
            "score": final_score,
            "level": "critical" if final_score >= 75 else "high" if final_score >= 50 else "medium" if final_score >= 25 else "low",
            "findings": unique_findings,
            "analyzed_at": datetime.now().isoformat()
        }

# --- MODULE REGISTRY ---
MODULES_MAP = {}
module_configs = [
    ("DomainIntelligence", "module1_domain_intelligence"),
    ("EmailForensics", "module2_email_forensics"),
    ("InfrastructureMapping", "module3_infrastructure_mapping"),
    ("TyposquattingDetector", "module4_typosquatting_brandabuse"),
    ("SSLAnalyzer", "module5_ssl_deepanalysis"),
    ("CompanyVerifier", "module6_company_verficiation"),
    ("RecruiterVerifier", "module7_recruiter_deepcheck"),
    ("JobAnalyzer", "module8_job_posing_analysis"),
    ("ChannelAnalyzer", "module9_communication_channel_forn"),
    ("FileForensics", "module10_evidence_file_metadata"),
    ("SocialFootprintMapper", "module12_social_footprint"),
    ("GeoTemporalAnalyzer", "module14_geo_analysis"),
]

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

for class_name, package_name in module_configs:
    try:
        mod = __import__(package_name, fromlist=[class_name])
        MODULES_MAP[class_name] = getattr(mod, class_name)
        loud_log(f"REGISTERED: {class_name}")
    except Exception as e:
        loud_log(f"REGISTRATION FAILED: {class_name} - {e}", "ERROR")

class OSINTOrchestrator:
    def __init__(self, scan_id: int, target: str, user_id: int):
        self.scan_id = scan_id
        self.target = target.strip()
        self.user_id = user_id
        self.project_id = 0
        self.results = {
            "metadata": {"scan_id": scan_id, "target": target, "user_id": user_id, "timestamp": datetime.now().isoformat()},
            "modules": {},
            "analysis": {}
        }
        self.completed_ids = []
        self.db = DatabaseManager()
        
        self.execution_plan = [
            {"id": "mod1", "name": "Domain Intel", "class": "DomainIntelligence", "method": "investigate_domain", "arg": "domain"},
            {"id": "mod2", "name": "Email Forensics", "class": "EmailForensics", "method": "analyze_email", "arg": "email"},
            {"id": "mod3", "name": "Infra Mapping", "class": "InfrastructureMapping", "method": "investigate_domain", "arg": "domain"},
            {"id": "mod4", "name": "Typosquatting", "class": "TyposquattingDetector", "method": "investigate_brand", "arg": "domain"},
            {"id": "mod5", "name": "SSL Analysis", "class": "SSLAnalyzer", "method": "analyze_domain", "arg": "domain"},
            {"id": "mod6", "name": "Company Verify", "class": "CompanyVerifier", "method": "verify_company", "arg": "comp_name"},
            {"id": "mod7", "name": "Recruiter Check", "class": "RecruiterVerifier", "method": "analyze_email_pattern", "arg": "email"},
            {"id": "mod8", "name": "Job Analysis", "class": "JobAnalyzer", "method": "analyze_job", "arg": "job_dict"},
            {"id": "mod9", "name": "Channel Analysis", "class": "ChannelAnalyzer", "method": "analyze_communication", "arg": "comm_dict"},
            {"id": "mod10", "name": "File Forensics", "class": "FileForensics", "method": "analyze_file", "arg": "target"},
            {"id": "mod12", "name": "Social Footprint", "class": "SocialFootprintMapper", "method": "analyze_social_footprint", "arg": "social_dict"},
            {"id": "mod14", "name": "Geo Temporal", "class": "GeoTemporalAnalyzer", "method": "analyze_geo_temporal", "arg": "geo_dict"},
        ]

    async def run_module(self, step, domain, email, semaphore):
        mid, mname, mclass, mmethod = step["id"], step["name"], step["class"], step["method"]
        async with semaphore:
            loud_log(f"INVOKING: {mname}", scan_id=self.scan_id, user_id=self.user_id, module=mname)
            try:
                # Ensure we have project_id for notifications
                if not self.project_id:
                    await self.db.ensure_pool()
                    async with self.db.pool.acquire() as conn:
                        async with conn.cursor() as cur:
                            await cur.execute("SELECT t.project_id FROM scans s JOIN targets t ON s.target_id = t.id WHERE s.id = %s", (self.scan_id,))
                            res = await cur.fetchone()
                            if res: self.project_id = res[0]

                cls = MODULES_MAP.get(mclass)
                if not cls: raise Exception("Class not registered")
                
                arg_type = step["arg"]
                if arg_type == "domain": val = domain
                elif arg_type == "email": val = email
                elif arg_type == "comp_name": val = domain.split('.')[0] if domain else "Unknown"
                elif arg_type == "job_dict": val = {"target": self.target, "title": "Software Engineer"}
                elif arg_type == "comm_dict": val = {"target": self.target, "type": "web"}
                elif arg_type == "social_dict": val = {"company_name": domain.split('.')[0] if domain else "Unknown", "domain": domain}
                elif arg_type == "geo_dict": val = {"target": self.target, "domain": domain}
                else: val = self.target

                if not val: 
                    loud_log(f"SKIPPING: {mname} - No target value", scan_id=self.scan_id, user_id=self.user_id, module=mname)
                    return

                instance = cls(verbose=True)
                func = getattr(instance, mmethod, None)
                if not func: raise Exception(f"Method {mmethod} not found")

                loud_log(f"EXECUTING: {mmethod} for {mname}", scan_id=self.scan_id, user_id=self.user_id, module=mname)
                raw_data = await func(val) if asyncio.iscoroutinefunction(func) else func(val)
                self.results["modules"][mname] = {"module_id": mid, "class": mclass, "timestamp": datetime.now().isoformat(), "data": raw_data, "success": True}
                self.completed_ids.append(mid)
                
                loud_log(f"COMPLETED: {mname}", scan_id=self.scan_id, user_id=self.user_id, module=mname)
                
                # --- LIVE DETECTION: Push notification if red flags found ---
                if isinstance(raw_data, dict):
                    red_flags = raw_data.get("red_flags", [])
                    if red_flags:
                        message = red_flags[0]
                        # 1. Save to DB for persistence
                        try:
                            await self.db.ensure_pool()
                            async with self.db.pool.acquire() as conn:
                                async with conn.cursor() as cur:
                                    await cur.execute(
                                        "INSERT INTO notifications (user_id, title, message, type, scan_id, created_at) VALUES (%s, %s, %s, 'threat', %s, NOW())",
                                        (self.user_id, f"Live Threat: {mname}", message, self.scan_id)
                                    )
                        except Exception as e:
                            loud_log(f"DB LIVE NOTIFY ERROR: {e}", "DEBUG")

                        # 2. Push immediate WebSocket notification for the finding
                        await self.db.send_ws_notification("new_notification", self.user_id, {
                            "type": "threat",
                            "title": f"Live Threat: {mname}",
                            "message": message,
                            "scan_id": self.scan_id,
                            "projectId": self.project_id,
                            "created_at": datetime.now().isoformat()
                        })

                progress = int((len(self.completed_ids) / len(self.execution_plan)) * 100)
                # await is crucial here to ensure the notification is sent BEFORE moving to next step
                await self.db.update_progress(self.scan_id, progress, self.user_id)
                
            except Exception as e:
                self.results["modules"][mname] = {"module_id": mid, "success": False, "error": str(e)}

    async def run_scan(self):
        loud_log(f"STARTING PIPELINE: {self.target}", scan_id=self.scan_id, user_id=self.user_id)
        domain = self.extract_domain()
        email = f"hr@{domain}" if domain else None
        
        semaphore = asyncio.Semaphore(config.max_concurrent_tasks)
        tasks = [self.run_module(s, domain, email, semaphore) for s in self.execution_plan]
        await asyncio.gather(*tasks)

        # 1. RUN ALGORITHM TO ANALYZE DATA
        loud_log("ANALYZING COLLECTED DATA...", scan_id=self.scan_id, user_id=self.user_id)
        analyzer = ResultAnalyzer(self.results)
        analysis_result = analyzer.analyze()
        self.results["analysis"] = analysis_result

        # 2. SAVE FULL JSON REPORT
        self.save_to_file()

        # 3. UPDATE DATABASE WITH REAL SCORE AND FINDINGS
        await self.db.finalize_scan(self.scan_id, analysis_result, self.user_id)
        await self.db.close()

    def save_to_file(self):
        file_path = config.output_dir / f"scan_{self.scan_id}_full.json"
        try:
            with open(file_path, 'w') as f:
                json.dump(self.results, f, indent=4, default=str)
        except: pass

    def extract_domain(self):
        try:
            d = self.target.replace("http://", "").replace("https://", "").split("/")[0].split('?')[0]
            return d[4:] if d.startswith("www.") else d
        except: return ""

async def main():
    if len(sys.argv) < 3: sys.exit(1)
    orchestrator = OSINTOrchestrator(int(sys.argv[1]), sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
    await orchestrator.run_scan()

if __name__ == "__main__":
    asyncio.run(main())
