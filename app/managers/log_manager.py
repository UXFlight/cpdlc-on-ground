import json
from pathlib import Path
from app.utils.time_utils import get_current_timestamp

class LogManager:
    def __init__(self, base_logs_dir: Path = None):
        self.base_logs_dir = base_logs_dir or Path(__file__).resolve().parents[1] / "../../logs"
        self.base_logs_dir = self.base_logs_dir.resolve()
        self.base_logs_dir.mkdir(parents=True, exist_ok=True)

    # PRIVATE
    def _get_log_dir(self, pilot_id: str) -> Path:
        log_dir = self.base_logs_dir / f"{pilot_id}-log"
        log_dir.mkdir(parents=True, exist_ok=True)
        return log_dir

    def _write_line(self, path: Path, line: str):
        with open(path, "a", encoding="utf-8") as f:
            f.write(line)

    # PUBLIC
    def log_event(self, pilot_id: str, event_type: str, message: str):
        timestamp = get_current_timestamp()
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [{event_type.upper():<10}] {message}\n"
        self._write_line(log_dir / "cpdlc_backend.log", line)

    def log_request(self, pilot_id: str, request_type: str, status: str, message: str = ""):
        timestamp = get_current_timestamp()
        log_data = {
            "timestamp": timestamp,
            "pilot": pilot_id,
            "type": request_type,
            "status": status,
            "message": message
        }
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [REQUEST   ] {json.dumps(log_data, ensure_ascii=False)}\n"
        self._write_line(log_dir / "cpdlc_backend.log", line)

    def log_action(self, pilot_id: str, action_type: str, status: str, message: str = ""):
        timestamp = get_current_timestamp()
        log_data = {
            "timestamp": timestamp,
            "pilot": pilot_id,
            "action": action_type,
            "status": status,
            "message": message
        }
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [ACTION    ] {json.dumps(log_data, ensure_ascii=False)}\n"
        self._write_line(log_dir / "cpdlc_backend.log", line)

    def log_error(self, pilot_id: str, context: str, error: Exception | str):
        timestamp = get_current_timestamp()
        error_msg = str(error)
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [ERROR     ] [{context}] {error_msg}\n"
        self._write_line(log_dir / "cpdlc_errors.log", line)
        print(f"❌ ERROR [{context}] [{pilot_id}]: {error_msg}")

    def get_logs(self, log_type=None):
        if log_type is None:
            return self.logs
        return self.logs.get(log_type, [])
