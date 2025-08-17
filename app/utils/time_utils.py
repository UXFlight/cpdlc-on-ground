from datetime import datetime
from zoneinfo import ZoneInfo

def get_current_timestamp() -> float:
    now = datetime.now(ZoneInfo('America/Toronto'))
    return now.timestamp()

def get_formatted_time(ts: float) -> str:
    return datetime.fromtimestamp(ts, ZoneInfo("America/Toronto")).strftime("%H:%M:%S")


def get_current_timestamp_in_ms():
    dt = datetime.now(ZoneInfo('America/Toronto'))
    return int(dt.timestamp() * 1000)  # timestamp en millisecondes
