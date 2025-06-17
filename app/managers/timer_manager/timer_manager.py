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

    def start_timer(self, step: Step, request_type: str, on_tick, on_timeout=None):
        self.stop_timer(request_type)
        stop_event = threading.Event()
        self.stop_flags[request_type] = stop_event

        def run():
            while not stop_event.is_set():
                with step.lock:
                    if step.time_left is None or step.time_left <= 0:
                        break
                    step.time_left -= 1

                if on_tick:
                    on_tick(request_type, step)

                time.sleep(1)

            if not stop_event.is_set() and on_timeout:
                print(f"Timer for {request_type} has timed out.")
                on_timeout(request_type, step)

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
