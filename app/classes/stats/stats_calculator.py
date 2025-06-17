from collections import Counter, defaultdict
from statistics import mean, median
from datetime import datetime
import math
import numpy as np

class StatsCalculator:
    @staticmethod
    def compute(steps, logs, history):
        return {
            "system_metrics": {
                "total_clearances_configured": len(steps),
                "log_entries_recorded": len(logs),
                "interaction_events_recorded": len(history),
                "system_event_distribution": StatsCalculator._calculate_log_frequencies(logs),
            },
            "pilot_metrics": {
                "most_frequent_clearance": StatsCalculator._calculate_most_common_action(steps),
                "average_response_time_sec": StatsCalculator._calculate_average_step_duration(steps),
                "response_time_by_clearance": StatsCalculator._calculate_step_durations(steps),
                "completion_ratio": StatsCalculator._calculate_completion_rate(steps, history),
                "median_response_time_sec": StatsCalculator._calculate_median_reaction_delay(history),
                "p95_response_time_sec": StatsCalculator._calculate_percentile_reaction_delay(history, 95),
            }
        }

    @staticmethod
    def _calculate_average_step_duration(steps):
        durations = [max(0, 90 - step.time_left) for step in steps if step.time_left is not None]
        return round(mean(durations), 2) if durations else None

    @staticmethod
    def _calculate_most_common_action(steps):
        labels = [step.label for step in steps if step.status]
        counter = Counter(labels)
        if not counter:
            return None
        most_common = counter.most_common(1)[0]
        return {'label': most_common[0], 'count': most_common[1]}

    @staticmethod
    def _calculate_step_durations(steps):
        durations = {}
        for step in steps:
            if step.label and step.time_left is not None:
                durations[step.label] = max(0, 90 - step.time_left)
        return durations

    @staticmethod
    def _calculate_log_frequencies(logs):
        LABELS = {
            "[ACTION": "Action",
            "[REQUEST": "Request",
            "[ERROR": "Error",
            "[TICK": "Tick",
            "[SOCKET": "Socket",
            "[TIMEOUT": "Timeout",
            "[TIMEOUT_SKIP": "Timeout (skipped)",
            "[SKIP": "Skipped"
        }

        counts = defaultdict(int)
        for line in logs:
            if "[" in line and "]" in line:
                try:
                    type_code = line.split("]")[1].strip().split()[0]
                    label = LABELS.get(type_code, type_code.strip("[]"))
                    counts[label] += 1
                except Exception:
                    continue
        return dict(counts)

    @staticmethod
    def _calculate_completion_rate(steps, history):
        total = sum(1 for s in steps if s.status)
        responded = sum(1 for h in history if h.get("snapshot", {}).get("status") in ("wilco", "unable", "cancelled"))
        return round(responded / total, 3) if total else None

    @staticmethod
    def _calculate_median_reaction_delay(history):
        durations = StatsCalculator._extract_response_durations(history)
        return round(median(durations), 2) if durations else None

    @staticmethod
    def _calculate_percentile_reaction_delay(history, p):
        durations = StatsCalculator._extract_response_durations(history)
        return round(float(np.percentile(durations, p)), 2) if durations else None

    @staticmethod
    def _extract_response_durations(history):
        transitions = defaultdict(list)
        durations = []

        for entry in history:
            step_key = entry.get("stepKey")
            snap = entry.get("snapshot", {})
            status = snap.get("status")
            timestamp = snap.get("timestamp")

            if step_key and status and timestamp:
                transitions[step_key].append((status, timestamp))

        for changes in transitions.values():
            valid = [c for c in changes if c[1] is not None]
            valid.sort(key=lambda x: x[1])

            start = None
            for status, ts in valid:
                if status == "requested":
                    start = ts
                elif status in ("wilco", "cancelled", "unable") and start:
                    try:
                        t0 = datetime.fromisoformat(start)
                        t1 = datetime.fromisoformat(ts)
                        durations.append((t1 - t0).total_seconds())
                    except Exception:
                        continue
                    break

        return durations