from datetime import datetime, timezone

def get_current_timestamp():
    return datetime.now(timezone.utc).isoformat()

def get_current_timestamp_in_ms():
    return int(datetime.now(timezone.utc).timestamp() * 1000)  # timestamp en millisecondes
