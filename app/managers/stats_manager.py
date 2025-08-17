from app.classes.stats_calculator import StatsCalculator
from app.managers.log_manager import logger
from app.managers import PilotManager

class PilotStats:
    def __init__(self, pilot_manager: PilotManager):
        self.pilot_manager = pilot_manager

    def get_stats(self, pilot_id: str):
        pilot = self.pilot_manager.get(pilot_id)
        steps = list(pilot.state.steps.values())

        # -- BUGGIN
        logs = logger.get_logs_for_pilot(pilot_id=pilot_id)
        history = pilot.state.history
        stats = StatsCalculator.compute(steps, logs, history)
        return stats
