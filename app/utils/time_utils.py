from datetime import datetime
from zoneinfo import ZoneInfo

def get_current_timestamp():
    now = datetime.now(ZoneInfo('America/Toronto'))
    return now.strftime('%H:%M:%S')

def get_current_timestamp_in_ms():
    dt = datetime.now(ZoneInfo('America/Toronto'))
    return int(dt.timestamp() * 1000)  # timestamp en millisecondes
