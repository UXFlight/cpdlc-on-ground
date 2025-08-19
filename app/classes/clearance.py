from typing import TYPE_CHECKING, List, Dict, Tuple, Set
from heapq import heappush, heappop
from app.utils.types import AirportMapData, LonLat, LocationInfo
from math import sqrt

if TYPE_CHECKING:
    from app.classes.pilot import Pilot

Graph = Dict[LonLat, List[Tuple[LonLat, float, str]]]
LabelMap = Dict[Tuple[LonLat, LonLat], str]


class ClearanceEngine:
    def __init__(self, airport_map: AirportMapData):
        self.airport_map = airport_map
        self.graph, self.label_map = self._build_graph()

    def _build_graph(self) -> Tuple[Graph, LabelMap]:
        graph: Graph = {}
        label_map: LabelMap = {}

        def add_edge(a: LonLat, b: LonLat, label: str):
            dist = self._distance(a, b)
            graph.setdefault(a, []).append((b, dist, label))
            graph.setdefault(b, []).append((a, dist, label))
            label_map[(a, b)] = label
            label_map[(b, a)] = label

        for twy in self.airport_map["taxiways"]:
            a, b = tuple(twy["start"]), tuple(twy["end"])
            label = twy["name"]
            add_edge(a, b, label)

        for rwy in self.airport_map["runways"]:
            a, b = tuple(rwy["start"]), tuple(rwy["end"])
            label = rwy["name"]
            add_edge(a, b, label)

        return graph, label_map

    def generate_clearance(self, pilot: "Pilot") -> Tuple[str, List[LocationInfo]]:
        start = tuple(pilot.plane["current_pos"]["coord"])
        end = tuple(pilot.plane["final_pos"]["coord"])

        start = self._closest_node(start)
        end = self._closest_node(end)

        path = self._find_path(start, end)
        if not path:
            return "UNABLE TO GENERATE CLEARANCE", [pilot.plane["current_pos"]]

        labels = self._extract_labels(path)
        instruction = f"TAXI VIA {' '.join(labels)}"

        locations = self._build_location_infos(path)

        return instruction, locations

    def _find_path(self, start: LonLat, goal: LonLat) -> List[LonLat]:
        visited: Set[LonLat] = set()
        heap = [(0.0, start, [])]

        while heap:
            cost, current, path = heappop(heap)
            if current in visited:
                continue
            visited.add(current)
            path = path + [current]
            if self._is_close(current, goal):
                return path
            for neighbor, dist, _ in self.graph.get(current, []):
                if neighbor not in visited:
                    heappush(heap, (cost + dist, neighbor, path))

        return []

    def _closest_node(self, point: LonLat) -> LonLat:
        return min(self.graph.keys(), key=lambda n: self._distance(n, point))

    def _distance(self, a: LonLat, b: LonLat) -> float:
        return sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

    def _is_close(self, a: LonLat, b: LonLat, tol: float = 1e-5) -> bool:
        return abs(a[0] - b[0]) < tol and abs(a[1] - b[1]) < tol

    def _extract_labels(self, path: List[LonLat]) -> List[str]:
        seen = set()
        labels = []
        for a, b in zip(path, path[1:]):
            label = self.label_map.get((a, b))
            if label and label not in seen:
                labels.append(label)
                seen.add(label)
        return labels

    def _build_location_infos(self, path: List[LonLat]) -> List[LocationInfo]:
        locations: List[LocationInfo] = []
        for a, b in zip(path, path[1:]):
            label = self.label_map.get((a, b), "")
            is_runway = any(label == rwy["name"] for rwy in self.airport_map["runways"])
            kind = "runway" if is_runway else "taxiway"
            locations.append({
                "name": label,
                "type": kind,
                "coord": b,
            })
        return locations