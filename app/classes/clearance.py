from typing import TYPE_CHECKING, List, Dict, Optional, Tuple, Set
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
        
    def to_lonlat(self, coord: object) -> LonLat:
        if (isinstance(coord, (list, tuple)) and len(coord) == 2 and
            isinstance(coord[0], (int, float)) and isinstance(coord[1], (int, float))):
            return (float(coord[0]), float(coord[1]))
        raise ValueError(f"Invalid coord format: {coord}")


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
            try:
                a = self.to_lonlat(twy["start"])
                b = self.to_lonlat(twy["end"])
                label = str(twy.get("name", "TAXIWAY"))
                add_edge(a, b, label)
            except Exception as e:
                print(f"[Taxiway skipped] {e}")

        for rwy in self.airport_map["runways"]:
            try:
                a = self.to_lonlat(rwy["start"])
                b = self.to_lonlat(rwy["end"])
                label = str(rwy.get("name", "RUNWAY"))
                add_edge(a, b, label)
            except Exception as e:
                print(f"[Runway skipped] {e}")

        # add parkings to graph : pilots spawn at a parking positions
        for parking in self.airport_map.get("parking", []):
            try:
                parking_coord = self.to_lonlat(parking["location"])
                parking_name = str(parking.get("name", "PARKING"))

                if not graph:
                    continue

                closest_node = self._closest_node(parking_coord, graph)
                if closest_node:
                    add_edge(parking_coord, closest_node, parking_name)
            except Exception as e:
                print(f"[Parking skipped] {e}")

        return graph, label_map

    def generate_clearance(self, pilot: "Pilot") -> Tuple[str, List[LocationInfo]]:
        start_raw = pilot.plane["current_pos"]["coord"]
        end_raw = pilot.plane["final_pos"]["coord"]

        start = self._closest_node(self.to_lonlat(start_raw))
        end = self._closest_node(self.to_lonlat(end_raw))

        path = self._find_path(start, end)
        if not path:
            return "UNABLE TO GENERATE CLEARANCE", [pilot.plane["current_pos"]]

        labels = self._extract_labels(path)
        instruction = f"TAXI VIA {' '.join(labels)}"

        locations = self._build_location_infos(path)

        return instruction, locations


    def _find_path(self, start: LonLat, goal: LonLat) -> List[LonLat]:
        if start not in self.graph or goal not in self.graph:
            return []
        
        if self._is_close(start, goal):
            return [start]
        
        connected = set()
        queue = [start]
        while queue:
            current = queue.pop(0)
            if current in connected:
                continue
            connected.add(current)
            for neighbor, _, _ in self.graph.get(current, []):
                if neighbor not in connected:
                    queue.append(neighbor)
        
        if goal not in connected:
            goal = min(connected, key=lambda n: self._distance(n, goal))
        
        from heapq import heappush, heappop
        queue = [(0.0, start, [])]
        visited = set()
        
        while queue:
            cost, current, path = heappop(queue)
            
            if current in visited:
                continue
            
            visited.add(current)
            new_path = path + [current]
            
            if self._is_close(current, goal):
                return new_path
            
            for neighbor, dist, _ in self.graph.get(current, []):
                if neighbor not in visited:
                    heappush(queue, (cost + dist, neighbor, new_path))
        
        return []


    def _closest_node(self, point: LonLat, graph: Optional[Graph] = None) -> LonLat:
        if graph is None:
            graph = self.graph  # fallback
        return min(graph.keys(), key=lambda n: self._distance(n, point))


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