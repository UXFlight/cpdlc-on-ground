import threading
import time
from app.classes.state.step import Step
from app.classes.socket.socket import SocketService
from app.managers.log_manager.log_manager_instance import logger

class TimerManager:
    def __init__(self, sid : str):
        self.timers = {}      # request_type -> threading.Thread
        self.stop_flags = {}  # request_type -> threading.Event
        self.log_manager = logger
        self.sid = sid

    def start_timer(self, step: Step, socket: SocketService, sid: str, on_timeout=None):
        request_type = step.label.lower().replace(' ', '_')
        self.stop_timer(request_type)

        stop_event = threading.Event()
        self.stop_flags[request_type] = stop_event

        def run():
            while not stop_event.is_set():
                if step.time_left is None or step.time_left <= 0:
                    break

                time.sleep(1)
                step.time_left -= 1

                logger.log_event(self.sid, 'TICK', f"{request_type} — {step.time_left}s left")
                socket.send("tick", {
                    "requestType": request_type,
                    "timeLeft": step.time_left
                }, room=sid)

            if not stop_event.is_set():
                step.status = "timeout"
                step.time_left = 0
                socket.send("atcTimeout", { "requestType": request_type }, room=sid)
                if on_timeout:
                    on_timeout()

        thread = threading.Thread(target=run, daemon=True)
        self.timers[request_type] = thread
        thread.start()

    def stop_timer(self, request_type: str):
        if request_type in self.stop_flags:
            self.stop_flags[request_type].set()
            del self.stop_flags[request_type]
        if request_type in self.timers:
            del self.timers[request_type]

    def stop_all(self):
        for flag in self.stop_flags.values():
            flag.set()
        self.timers.clear()
        self.stop_flags.clear()
