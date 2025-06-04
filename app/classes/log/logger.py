import json
from pathlib import Path
from app.utils.time_utils import get_current_timestamp

class LogManager:
    def __init__(self, logs_dir: Path = None):
        self.logs_dir = logs_dir or Path(__file__).resolve().parent.parent / "logs"
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self.main_log = self.logs_dir / "cpdlc_backend.log"
        self.error_log = self.logs_dir / "cpdlc_errors.log"

        # In-memory store
        self.logs = {
            "events": [],
            "requests": [],
            "actions": [],
            "errors": []
        }

    def _write_line(self, path: Path, line: str):
        with open(path, "a", encoding="utf-8") as f:
            f.write(line)

    def log_event(self, event_type: str, message: str):
        timestamp = get_current_timestamp()
        line = f"[{timestamp}] [{event_type.upper():<10}] {message}\n"
        self._write_line(self.main_log, line)
        self.logs["events"].append({
            "timestamp": timestamp,
            "type": event_type,
            "message": message
        })

    def log_request(self, pilot_id: str, request_type: str, status: str, message: str = ""):
        timestamp = get_current_timestamp()
        log_data = {
            "timestamp": timestamp,
            "pilot": pilot_id,
            "type": request_type,
            "status": status,
            "message": message
        }
        line = f"[{timestamp}] [REQUEST   ] {json.dumps(log_data, ensure_ascii=False)}\n"
        self._write_line(self.main_log, line)
        self.logs["requests"].append(log_data)

    def log_action(self, pilot_id: str, action_type: str, status: str, message: str = ""):
        timestamp = get_current_timestamp()
        log_data = {
            "timestamp": timestamp,
            "pilot": pilot_id,
            "action": action_type,
            "status": status,
            "message": message
        }
        line = f"[{timestamp}] [ACTION    ] {json.dumps(log_data, ensure_ascii=False)}\n"
        self._write_line(self.main_log, line)
        self.logs["actions"].append(log_data)

    def log_error(self, context: str, error: Exception | str):
        timestamp = get_current_timestamp()
        error_msg = str(error)
        line = f"[{timestamp}] [ERROR     ] [{context}] {error_msg}\n"
        self._write_line(self.error_log, line)
        self.logs["errors"].append({
            "timestamp": timestamp,
            "context": context,
            "error": error_msg
        })
        print(f"❌ ERROR [{context}]: {error_msg}")

    def get_logs(self, log_type=None):
        if log_type is None:
            return self.logs
        return self.logs.get(log_type, [])
