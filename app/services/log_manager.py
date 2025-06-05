import json
from datetime import datetime, timezone
from pathlib import Path

LOGS_DIR = Path(__file__).resolve().parent.parent / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

LOG_FILE = LOGS_DIR / "cpdlc_backend.log"

def get_timestamp():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

def log_event(event_type: str, message: str):
    """
    Écrit un événement simple dans le fichier log, format texte lisible.
    """
    line = f"[{get_timestamp()}] [{event_type.upper():<10}] {message}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)

def log_json(event_type: str, data: dict):
    """
    Écrit un événement structuré en JSON dans le fichier log.
    """
    line = f"[{get_timestamp()}] [{event_type.upper():<10}] {json.dumps(data, ensure_ascii=False)}\n"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line)
