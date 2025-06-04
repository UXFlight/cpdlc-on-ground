from app.state import pilot_state
from app.ingsvc import Echo
from app.constants import DEFAULT_ATC_RESPONSES, TIMER_DURATION
from app.utils.helpers import get_current_timestamp
from app.services import log_event
import threading
import time

agent = Echo()

def process_request(request_type: str):
    """Valide, met à jour l'état et prépare une réponse HTTP"""
    step = pilot_state.steps.get(request_type)

    if not step:
        return {"error": f"Unknown request type '{request_type}'"}

    if step["status"] == "requested":
        return {"error": f"Request '{request_type}' is already in progress"}

    if step["status"] == "closed":
        return {"error": f"Request '{request_type}' is already completed and closed"}

    if step["status"] == "responded":
        return {"error": f"Request '{request_type}' already received a response"}

    agent.set_request(request_type, True)
    pilot_state.update_step(request_type, "requested", "Sent to ATC")

    log_event("REQUEST", f"Pilot requested '{request_type}' → Status set to 'requested'")

    return {
        "status": step["status"],
        "message": step["message"],
        "timestamp": step["timestamp"],
    }

def simulate_atc_response(request_type: str, socket_manager):
    step = pilot_state.steps.get(request_type)
    if not step or step.get("cancelled"):
        log_event("SOCKET", f"Response for '{request_type}' skipped (cancelled)")
        return

    timestamp = get_current_timestamp()
    pilot_state.update_step(request_type, "responded", DEFAULT_ATC_RESPONSES.get(request_type, "NO MESSAGE"))
    socket_manager.send_message(
        request_type=request_type,
        message=step["message"],
        status="responded",
        timestamp=timestamp
    )

    start_timer(request_type, socket_manager)


def cancel_request(request_type: str):
    """
    Gère l'annulation complète d'une requête : état local + agent externe.
    """
    result = pilot_state.cancel_request(request_type)
    if "error" in result:
        return result

    agent.set_request(request_type, False)
    log_event("CANCEL", f"Pilot cancelled request '{request_type}'")
    return result

def get_state_service():
    """Expose l'état complet du backend pour le client frontend"""
    log_event("STATE", "State requested by client")
    return pilot_state.get_state()

def start_timer(request_type: str, socket_manager):
    duration = TIMER_DURATION
    pilot_state.steps[request_type]["timeLeft"] = duration

    stop_event = threading.Event()
    socket_manager._timers[request_type] = stop_event

    def tick_loop():
        for remaining in range(duration, 0, -1):
            if stop_event.is_set():
                print(f"[TIMER] ⏹ Timer for '{request_type}' stopped early.")
                return

            pilot_state.steps[request_type]["timeLeft"] = remaining
            socket_manager.send("tick", {
                "requestType": request_type,
                "timeLeft": remaining
            })

            time.sleep(1)

        pilot_state.update_step(request_type, "timeout", "No pilot response within time window")

        socket_manager.send("timeout", {
            "requestType": request_type,
            "status": "timeout",
            "message": "No pilot response within 90s"
        })

        del socket_manager._timers[request_type]

    threading.Thread(target=tick_loop, daemon=True).start()
