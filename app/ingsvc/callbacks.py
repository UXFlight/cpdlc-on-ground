from app.state import pilot_state
from app.ingsvc import Echo
import ingescape as igs # type: ignore
import signal
import sys
from app.services import log_event

def on_agent_event_callback(event, uuid, name, event_data, my_data):
    print(event, uuid, name, event_data)
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    # add code here if needed
    log_event("AGENT_EVENT", f"{event} from {name} ({uuid}) → {event_data}")

def on_freeze_callback(my_data):
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    # add code here if needed
    log_event("FREEZE", "Ingescape freeze callback triggered")

def reset_callback(my_data):
    igs.info(f"Output reset")
    agent_object = my_data
    assert isinstance(agent_object, Echo)
    log_event("RESET", "System reset via Ingescape callback")    
    agent_object.reset() # reset the agent state
    pilot_state.reset() # reset the pilot state

def signal_handler(signal_received, frame):
    print("\n", signal.strsignal(signal_received), sep="")
    print("\nExiting the app...")
    sys.exit(0)