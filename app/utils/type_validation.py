
def validate_atc_payload(payload: dict) -> tuple[str, str, str, str, str]:
    required_fields = ["pilot_sid", "step_code", "action", "message", "request_id"]

    for field in required_fields:
        value = payload.get(field)
        if not value:
            raise ValueError(f"Missing {field}")

    return (
        payload["pilot_sid"],
        payload["step_code"],
        payload["action"],
        payload["message"],
        payload["request_id"]
    )