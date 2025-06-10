from datetime import datetime, timezone

def get_current_timestamp():
    return datetime.now(timezone.utc).strftime("%H:%M:%S")