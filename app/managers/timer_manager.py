import threading
import time
from app.classes.step import Step
from app.managers.log_manager import logger

class TimerManager:
    def __init__(self, sid : str):
        self.timers = {}      # step_code -> threading.Thread
        self.stop_flags = {}  # step_code -> threading.Event
        self.log_manager = logger
        self.sid = sid

    def start_timer(self, step: Step, step_code: str, on_tick, on_timeout=None):
        self.stop_timer(step_code)
        stop_event = threading.Event()
        self.stop_flags[step_code] = stop_event

        def run():
            while not stop_event.is_set():
                with step.lock:
                    if step.time_left is None or step.time_left <= 0:
                        break
                    step.time_left -= 1

                if on_tick:
                    on_tick(step_code, step)

                time.sleep(1)

            if not stop_event.is_set() and on_timeout:
                print(f"Timer for {step_code} has timed out.")
                on_timeout(step_code, step)

        thread = threading.Thread(target=run, daemon=True)
        self.timers[step_code] = thread
        thread.start()


    def stop_timer(self, step_code: str):
        if step_code in self.stop_flags:
            self.stop_flags[step_code].set()
            del self.stop_flags[step_code]
        if step_code in self.timers:
            del self.timers[step_code]

    def stop_all(self):
        for flag in self.stop_flags.values():
            flag.set()
        self.timers.clear()
        self.stop_flags.clear()
