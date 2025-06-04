from app.state import pilot_state
from app.services import log_event
from app.ingsvc import Echo

agent = Echo()

def handle_client_disconnect():
    """
    Appelé lorsque le client se déconnecte (WebSocket).
    Réinitialise l'état du pilote.
    """
    from app.socket.sockets import socket_manager 

    pilot_state.reset()
    agent.reset()
    socket_manager.stop_all_timers()

    log_event("SOCKET", "Client disconnected → Pilot state reset")

def cancel_timer(request_type: str):
    """
    Annule un timer spécifique pour un type de requête.
    """
    from app.socket.sockets import socket_manager 

    socket_manager.stop_timer(request_type)
    log_event("TIMER", f"Timer cancelled for requestType '{request_type}'")