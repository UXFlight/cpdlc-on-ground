import sys
import signal
import ingescape as igs
from app.ingsvc import Echo
from app.ingsvc.callbacks import (
    reset_callback,
    on_freeze_callback,
    on_agent_event_callback,
    signal_handler
)
from app.constants import REQUEST_OUTPUTS, ACTION_OUTPUTS

def initialize_agent(agent_name: str, device: str, port: int) -> Echo:
    # ingescape configuration
    igs.agent_set_name(agent_name)
    igs.definition_set_version("1.0")
    igs.log_set_console(True)
    igs.log_set_file(True, None)
    igs.log_set_stream(True)
    igs.set_command_line(sys.executable + " " + " ".join(sys.argv))

    agent = Echo()

    # observation of agent events 
    igs.observe_agent_events(on_agent_event_callback, agent)
    igs.observe_freeze(on_freeze_callback, agent)

    # inputs declaration
    igs.input_create("reset", igs.IMPULSION_T, None)

    # requests declaration
    for name in REQUEST_OUTPUTS:
        igs.output_create(name, igs.BOOL_T, None)

    # action declaration
    for name in ACTION_OUTPUTS:
        igs.output_create(name, igs.BOOL_T, None)

    # input callbacks
    igs.observe_input("reset", reset_callback, agent)

    #! look it up in the ingescape documentation
    igs.log_set_console_level(igs.LOG_INFO)

    # running the agent on ingescape via internet
    igs.start_with_device(device, port)

    # signal handler to shutdown shutdown (CTRL+C)
    signal.signal(signal.SIGINT, signal_handler)

    return agent
