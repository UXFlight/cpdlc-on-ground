import json
from pathlib import Path
from typing import Optional
from app.utils.time_utils import get_current_timestamp, get_formatted_time

class LogManager:
    def __init__(self, base_logs_dir: Optional[Path] = None):
        self.base_logs_dir = base_logs_dir or Path.cwd() / "logs"
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
        timestamp = get_formatted_time(get_current_timestamp())
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [{event_type.upper():<10}] {message}\n"
        print(line.strip())
        self._write_line(log_dir / "cpdlc_backend.log", line)

    def log_request(self, pilot_id: str, request_type: str, status: str, message: str = "", time_left=None):
        timestamp = get_formatted_time(get_current_timestamp())
        log_data = {
            "timestamp": timestamp,
            "type": request_type,
            "status": status,
            "message": message,
            "timeLeft": time_left if time_left is not None else None
        }
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [REQUEST   ] {json.dumps(log_data, ensure_ascii=False)}\n"
        print(line.strip())
        self._write_line(log_dir / "cpdlc_backend.log", line)

    def log_action(self, pilot_id: str, action_type: str, status: str, message: str = "", time_left=None):
        timestamp = get_formatted_time(get_current_timestamp())
        log_data = {
            "timestamp": timestamp,
            "action": action_type,
            "status": status,
            "message": message,
            "timeLeft": time_left
        }
        log_dir = self._get_log_dir(pilot_id)
        line = f"[{timestamp}] [ACTION    ] {json.dumps(log_data, ensure_ascii=False)}\n"
        print(line.strip())
        self._write_line(log_dir / "cpdlc_backend.log", line)


    def log_error(self, pilot_id: str, context: str, error: Exception | str, time_left=None):
        timestamp = get_current_timestamp()
        error_msg = str(error)
        log_dir = self._get_log_dir(pilot_id)
        extra = f" [timeLeft={time_left}s]" if time_left is not None else ""
        line = f"[{timestamp}] [ERROR     ] [{context}]{extra} {error_msg}\n"
        print(line.strip())
        self._write_line(log_dir / "cpdlc_errors.log", line)


    def get_logs_for_pilot(self, pilot_id: str) -> list[str]:
        log_dir = self._get_log_dir(pilot_id)
        log_file = log_dir / "cpdlc_backend.log"

        if not log_file.exists():
            return []

        with open(log_file, "r", encoding="utf-8") as f:
            return f.readlines()

logger = LogManager()