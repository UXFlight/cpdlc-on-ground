from app.state import pilot_state
from app.ingsvc import Echo
from app.constants import DEFAULT_ATC_RESPONSES
from app.utils.helpers import get_current_timestamp
from app.services import log_event

agent = Echo()

def process_request(action_name: str):
    """Met à jour l'état et prépare une réponse HTTP"""
    agent.set_request(action_name, True)
    pilot_state.update_step(action_name, "requested", "Sent to ATC")

    step = pilot_state.steps.get(action_name)
    log_event("REQUEST", f"Pilot requested '{action_name}' → Status set to 'requested'")

    return {
        "status": step["status"],
        "message": step["message"],
        "timestamp": step["timestamp"],
        "new_history_entry": step["history"][-1] if step["history"] else None
    }

def simulate_atc_response(action_name: str, socket_manager):
    """Émet une réponse WebSocket simulée"""
    step = pilot_state.steps.get(action_name)
    if not step or step.get("cancelled"):
        log_event("SOCKET", f"Response for '{action_name}' skipped (cancelled)")
        return

    socket_manager.send_message(
        action=action_name,
        message=DEFAULT_ATC_RESPONSES.get(action_name, "NO MESSAGE"),
        status="responded",
        timestamp=get_current_timestamp()
    )
    log_event("SOCKET", f"ATC response emitted for action '{action_name}'")

def cancel_request(action_name: str):
    """
    Gère l'annulation complète d'une requête : état local + agent externe.
    """
    result = pilot_state.cancel_request(action_name)
    if "error" in result:
        return result

    agent.set_request(action_name, False)
    log_event("CANCEL", f"Pilot cancelled request '{action_name}'")
    return result

def get_state():
    """Expose l'état complet du backend pour le client frontend"""
    log_event("STATE", "State requested by client")
    return pilot_state.get_state()