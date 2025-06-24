from collections import Counter, defaultdict
from statistics import mean, median
from datetime import datetime
from dateutil.parser import isoparse
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
                "average_response_time_sec": StatsCalculator._calculate_average_step_duration(history),
                "response_time_by_clearance": StatsCalculator._calculate_step_durations_by_label(history),
                "completion_ratio": StatsCalculator._calculate_completion_rate(history),
                "fast_response_rate": StatsCalculator._calculate_fast_response_rate(history),
                "slow_response_rate": StatsCalculator._calculate_slow_response_rate(history),
                "timeout_rate": StatsCalculator._calculate_status_rate(history, "timeout"),
                "standby_usage_rate": StatsCalculator._calculate_status_rate(history, "standby"),
                "manual_cancel_rate": StatsCalculator._calculate_status_rate(history, "cancelled"),
                "retry_rate": StatsCalculator._calculate_retry_rate(history),
                "standby_before_response_avg": StatsCalculator._calculate_avg_standby_before_response(history),
                "median_response_time_sec": StatsCalculator._calculate_median_reaction_delay(history),
                "active_session_duration_sec": StatsCalculator._calculate_session_duration(history)
            }
        }

    # --- Pilot Metrics ---

    @staticmethod
    def _calculate_average_step_duration(history):
        durations = StatsCalculator._extract_response_durations(history)
        return round(mean(durations), 2) if durations else None

    @staticmethod
    def _calculate_most_common_action(steps):
        labels = [step.label for step in steps if step.status]
        counter = Counter(labels)
        return {'label': most_common[0], 'count': most_common[1]} if (most_common := counter.most_common(1)) else None

    @staticmethod
    def _calculate_step_durations_by_label(history):
        transitions = defaultdict(list)

        for entry in history:
            step_key = entry.get("stepKey")
            snap = entry.get("snapshot", {})
            status = snap.get("status")
            timestamp = snap.get("timestamp")
            if step_key and status and timestamp:
                transitions[step_key].append((status, timestamp))

        durations = defaultdict(list)

        for key, changes in transitions.items():
            changes.sort(key=lambda x: x[1])
            start = None
            for status, ts in changes:
                try:
                    if status == "requested":
                        start = isoparse(ts)
                    elif status in ("wilco", "cancelled", "unable") and start:
                        end = isoparse(ts)
                        durations[key].append((end - start).total_seconds())
                        break
                except Exception:
                    continue

        return {k: round(mean(v), 2) for k, v in durations.items() if v}

    @staticmethod
    def _calculate_completion_rate(history):
        step_responses = set()
        total_steps = set()
        for entry in history:
            step_key = entry.get("stepKey")
            status = entry.get("snapshot", {}).get("status")
            if step_key:
                total_steps.add(step_key)
                if status in ("wilco", "unable", "cancelled"):
                    step_responses.add(step_key)
        return round(len(step_responses) / len(total_steps), 3) if total_steps else None

    @staticmethod
    def _calculate_fast_response_rate(history, threshold=5):
        durations = StatsCalculator._extract_response_durations(history)
        fast = [d for d in durations if d <= threshold]
        return round(len(fast) / len(durations), 3) if durations else None

    @staticmethod
    def _calculate_slow_response_rate(history, threshold=30):
        durations = StatsCalculator._extract_response_durations(history)
        slow = [d for d in durations if d >= threshold]
        return round(len(slow) / len(durations), 3) if durations else None

    @staticmethod
    def _calculate_status_rate(history, target_status):
        total = 0
        match = 0
        seen = set()

        for entry in history:
            key = entry.get("stepKey")
            status = entry.get("snapshot", {}).get("status")
            if not key or not status:
                continue
            if key not in seen:
                seen.add(key)
                total += 1
            if status == target_status:
                match += 1
        return round(match / total, 3) if total else None

    @staticmethod
    def _calculate_retry_rate(history):
        counter = defaultdict(int)
        for entry in history:
            key = entry.get("stepKey")
            status = entry.get("snapshot", {}).get("status")
            if key and status == "requested":
                counter[key] += 1
        retries = [v for v in counter.values() if v > 1]
        total = len(counter)
        return round(len(retries) / total, 3) if total else None

    @staticmethod
    def _calculate_avg_standby_before_response(history):
        transitions = defaultdict(list)
        for entry in history:
            key = entry.get("stepKey")
            snap = entry.get("snapshot", {})
            if key and snap.get("status"):
                transitions[key].append(snap["status"])

        counts = []
        for statuses in transitions.values():
            standby_count = 0
            for s in statuses:
                if s == "standby":
                    standby_count += 1
                elif s in ("wilco", "unable", "cancelled"):
                    counts.append(standby_count)
                    break
        return round(mean(counts), 2) if counts else 0.0

    @staticmethod
    def _calculate_median_reaction_delay(history):
        durations = StatsCalculator._extract_response_durations(history)
        return round(median(durations), 2) if durations else None

    @staticmethod
    def _calculate_session_duration(history):
        timestamps = []
        for entry in history:
            ts = entry.get("snapshot", {}).get("timestamp")
            try:
                if ts:
                    timestamps.append(isoparse(ts))
            except Exception:
                continue
        if not timestamps:
            return None
        return round((max(timestamps) - min(timestamps)).total_seconds(), 2)

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
            changes.sort(key=lambda x: x[1])
            start = None
            for status, ts in changes:
                try:
                    if status == "requested":
                        start = isoparse(ts)
                    elif status in ("wilco", "cancelled", "unable") and start:
                        end = isoparse(ts)
                        durations.append((end - start).total_seconds())
                        break
                except Exception:
                    continue

        return durations

    # --- System Metrics ---

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