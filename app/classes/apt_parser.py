import json
import math
from pathlib import Path
import random
from typing import Dict, List, Optional, Tuple, TypeGuard, cast
from custom_types.airport_types import AirportInfo, AirportMapData, Helipad, LonLat, ParkingPosition, ParkingType, Runway, Taxiway
from custom_types.types import Clearance, ClearanceEvent, PilotPublicView, Plane
from xplane_airports.AptDat import AptDat, AptDatLine, RowCode

class APTParser:
    def __init__(self):
        self.airports_cache: Dict[str, AirportMapData] = {}
        self.selected_icao = "KJFK"

        geojson = self._load_geojson_from_disk_cache(self.selected_icao)
        if geojson:
            self.airports_cache[self.selected_icao] = geojson
            print(f"[APTParser] Loaded {self.selected_icao} from disk cache.")
            self.apt_data = None 
        else:
            self._init_apt_data()
            self._select_airport(self.selected_icao)

        
    def _init_apt_data(self) -> None:
        base_dir = Path(__file__).resolve().parent.parent
        apt_path = base_dir / 'apt.dat'
        self.apt_file = Path(apt_path)
        if not apt_path.exists():
            raise FileNotFoundError(f"apt.dat not found at {apt_path}")
        self.apt_data = AptDat(apt_path)

    def _select_airport(self, arpt: str) -> None:
        if not self.apt_data:
            raise ValueError("APT data not loaded. Call _init_apt_data() first.")
        
        self.selected_airport = self.apt_data[arpt]
        
        if not self.selected_airport:
            raise ValueError(f"{self.selected_icao} airport not found in apt.dat")
                

    def _get_selected_airport_map_data(self) -> AirportMapData:
        if not self.apt_data or self.selected_icao not in self.apt_data:
            raise ValueError("No airport selected or apt.dat not loaded")
        
        airport = self.selected_airport
        
        # parse runways 
        runways :  List[Runway] = self._parse_runways(airport)
        
        # parse helipads
        helipads : List[Helipad] = self._parse_helipads(airport)
        
        # parse taxiways (if available)
        taxiways :  List[Taxiway] = self._parse_taxiways(airport)
        
        # parse parking positions/gates
        parking : List[ParkingPosition] = self._parse_parking_positions(airport)

        # static airport info
        airport_info : AirportInfo = {
            "icao": airport.id,
            "name": airport.name,
            "elevation": airport.elevation_ft_amsl
        }
        
        return {
            "runways": runways,
            "helipads": helipads,
            "taxiways": taxiways,
            "parking": parking,
            "airport_info": airport_info
        }
    
    def _parse_runways(self, airport) ->  List[Runway]:
        runways = []
        for line in airport.text:
            if isinstance(line, AptDatLine) and line.tokens:
                code = line.tokens[0]
                if isinstance(code, RowCode):
                    code = code.value

                if code == RowCode.LAND_RUNWAY:
                    tokens = line.tokens
                    try:
                        width = float(tokens[1])
                        surface = int(tokens[2])

                        name1 = tokens[8]
                        lat1 = float(tokens[9])
                        lon1 = float(tokens[10])

                        name2 = tokens[17]
                        lat2 = float(tokens[18])
                        lon2 = float(tokens[19])

                        runways.append({
                            "name": f"{name1}/{name2}",
                            "start": [lat1, lon1],
                            "end": [lat2, lon2],
                            "width": width,
                            "surface": surface
                        })
                    except Exception as e:
                        continue
        return runways
    
    def _parse_helipads(self, airport) ->  List[Helipad]:
        helipads = []
        for line in airport.text:
            if line.is_runway() and line.runway_type == RowCode.HELIPAD:
                tokens = line.tokens
                try:
                    name = tokens[1]
                    lat = float(tokens[2])
                    lon = float(tokens[3])
                    heading = float(tokens[4])
                    length = float(tokens[5])
                    width = float(tokens[6])
                    helipads.append({
                        "name": name,
                        "location": [lat, lon],
                        "heading": heading,
                        "length": length,
                        "width": width
                    })
                except Exception as e:
                    print(f"[APTParser] Error parsing helipad line: {tokens} → {e}")
        return helipads
    
    def _parse_taxiways(self, airport) -> List[Taxiway]:
        taxiways = []
        network = airport.taxi_network
        for edge in network.edges:
            try:
                start = network.nodes[edge.node_begin]
                end = network.nodes[edge.node_end]
                taxiways.append({
                    "name": edge.name or "unnamed",
                    "start": [start.lat, start.lon],
                    "end": [end.lat, end.lon],
                    "is_runway": edge.is_runway,
                    "one_way": edge.one_way,
                    "width": edge.icao_width.name if edge.icao_width else None
                })
            except Exception as e:
                print(f"[APTParser] Failed to parse taxiway edge: {e}")
                continue
        return taxiways
    
    def _parse_parking_positions(self, airport) -> List[ParkingPosition]:
        parking = []

        for line in airport.text:
            if isinstance(line, AptDatLine) and line.tokens:
                code = line.tokens[0]
                if isinstance(code, RowCode):
                    code = code.value

                if int(code) == 1300: 
                    tokens = line.tokens
                    try:
                        lat = float(tokens[1])
                        lon = float(tokens[2])
                        heading = float(tokens[3])
                        ramp_type = tokens[4] 
                        name = " ".join(tokens[6:]) if len(tokens) > 6 else "Unnamed"

                        parking.append({
                            "location": [lat, lon],
                            "heading": heading,
                            "type": ramp_type,
                            "name": name
                        })
                    except Exception as e:
                        print(f"[APTParser] Skipping malformed parking line: {tokens} → {e}")
                        continue

        return parking

    def _load_geojson_from_disk_cache(self, icao: str) -> GeoJSONFeatureCollection | None:
        cache_path = Path(__file__).resolve().parent.parent / 'airports_cache.json'
        if not cache_path.exists() or cache_path.stat().st_size == 0:
            return None

        try:
            with cache_path.open('r', encoding='utf-8') as f:
                cache = json.load(f)
            return cache.get(icao)
        except Exception as e:
            print(f"[APTParser] Error reading disk cache: {e}")
            return None

    def _write_geojson_to_disk_cache(self, icao: str, geojson: GeoJSONFeatureCollection) -> None:
        cache_path = Path(__file__).resolve().parent.parent / 'airports_cache.json'
        cache: Dict[str, GeoJSONFeatureCollection] = {}

        if cache_path.exists() and cache_path.stat().st_size > 0:
            try:
                with cache_path.open('r', encoding='utf-8') as f:
                    cache = json.load(f)
            except json.JSONDecodeError:
                print("[APTParser] Cache corrompu, il sera écrasé.")

        cache[icao] = geojson

        with cache_path.open('w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2)
            
    #! Parser is calculating the clearances.
    def build_clearance_for_plane(self, plane: Optional[Plane], type : str = "expected_taxi") -> Optional[Clearance]:
        if not plane:
            return None

        geojson = self.get_airport_geojson()
        start = plane.spawn_pos
        destination = plane.final_pos

        # 1. Graphe avec labels
        graph, edge_labels = self._build_taxi_graph(geojson, return_labels=True)

        # 2. Route
        coords = self._find_taxi_route(start, destination, graph)

        # 3. Labels de route
        labels = self._extract_route_labels(coords, edge_labels)

        # 4. Events
        events = self._generate_clearance_events(coords, geojson)

        return {
            "type": "expected_taxi",
            "instruction": self._format_labels_instruction(labels),
            "coords": coords,
            "events": events,
            "expected": type == "expected_taxi",
        }

    # nearest parking position
    def _find_nearest_parking(self, pos: LonLat, geojson: GeoJSONFeatureCollection) -> ParkingPosition:
        candidates = []
        for f in geojson.get("features", []):
            props = (f.get("properties") or {})
            geom = f.get("geometry") or {}
            if geom.get("type") != "Point":
                continue
            if str(props.get("type", "")).lower() != "parking":
                continue

            lon, lat = geom.get("coordinates", (None, None))
            if lon is None or lat is None:
                continue

            name = str(props.get("name", "")) or "PARKING"
            heading = float(props.get("heading", 0.0))

            t = str(props.get("parking_type", "unknown")).lower()
            if t not in ("gate", "tie_down", "hangar", "ramp", "unknown"):
                t = "unknown"

            candidates.append({
                "name": name,
                "location": (lon, lat),
                "heading": heading,
                "type": t,
            })

        if not candidates:
            raise ValueError("No parking positions found in airport data.")

        nearest = min(
            candidates,
            key=lambda p: self._haversine_m(pos[1], pos[0], p["location"][1], p["location"][0])
        )

        return ParkingPosition(
            name=nearest["name"],
            location=nearest["location"],
            heading=nearest["heading"],
            type=cast(ParkingType, nearest["type"])
        )


    # nearest runway entry 
    def _find_nearest_runway_entry(self, pos: LonLat, geojson: GeoJSONFeatureCollection) -> dict:
        entries: list[dict] = []

        for f in geojson.get("features", []):
            props = (f.get("properties") or {})
            geom = (f.get("geometry") or {})
            if props.get("type") != "runway" or geom.get("type") != "LineString":
                continue

            coords = geom.get("coordinates") or []
            if not coords or len(coords) < 2:
                continue

            lon1, lat1 = coords[0]
            lon2, lat2 = coords[-1]

            h_fwd = self._bearing_deg((lon1, lat1), (lon2, lat2))
            h_rev = self._bearing_deg((lon2, lat2), (lon1, lat1))

            name = str(props.get("name", ""))

            entries.append({
                "type": "runway_entry",
                "entry": "start",
                "name": name,
                "location": (lon1, lat1),
                "heading": float(h_fwd),
            })
            entries.append({
                "type": "runway_entry",
                "entry": "end",
                "name": name,
                "location": (lon2, lat2),
                "heading": float(h_rev),
            })

        if not entries:
            raise ValueError("No runway entries found in airport data.")

        nearest = min(
            entries,
            key=lambda r: self._haversine_m(pos[1], pos[0], r["location"][1], r["location"][0])
        )
        return nearest


    def _find_taxi_route(
        self,
        start: LonLat,
        destination: Optional[LonLat],
        graph: dict
    ) -> list[LonLat]:
        from heapq import heappush, heappop
        if not graph:
            raise ValueError("Aucun segment de taxiway/runway trouvé.")

        # 3. Dijkstra (heap)
        visited = set()
        heap = [(0.0, start, [])]

        while heap:
            cost, current, path = heappop(heap)
            if current in visited:
                continue
            visited.add(current)
            path = path + [current]
            if current == destination:
                return path
            for neighbor, dist in graph.get(current, []):
                if neighbor not in visited:
                    heappush(heap, (cost + dist, neighbor, path))

        return []


    def closest_node(self, p: LonLat, graph: dict[LonLat, list[tuple[LonLat, float]]]) -> LonLat:
        return min(graph.keys(), key=lambda n: self._haversine_m(p[1], p[0], n[1], n[0]))

    def _build_taxi_graph(self, geojson, return_labels=False):
        graph = {}
        edge_labels = {}

        def edge_key(a, b): return (a, b) if a <= b else (b, a)
        def hav_m(a, b): return self._haversine_m(a[1], a[0], b[1], b[0])

        for feature in geojson.get("features", []):
            geometry = feature.get("geometry", {})
            if geometry.get("type") != "LineString":
                continue

            props = feature.get("properties", {})
            if props.get("type") not in {"taxiway", "runway"}:
                continue

            label = (
                str(props.get("name") or "")
                or str(props.get("ref") or "")
                or str(props.get("ident") or "")
                or str(props.get("designation") or "")
                or props.get("type")
            )

            coords = [(float(lon), float(lat)) for lon, lat in geometry.get("coordinates", [])]
            for a, b in zip(coords, coords[1:]):
                a, b = tuple(a), tuple(b)
                d = hav_m(a, b)
                graph.setdefault(a, []).append((b, d))
                graph.setdefault(b, []).append((a, d))
                if return_labels:
                    edge_labels[edge_key(a, b)] = label

        return (graph, edge_labels) if return_labels else graph
    
    def _extract_route_labels(self, coords: list[LonLat], edge_labels: dict[tuple[LonLat, LonLat], str]) -> list[str]:
        def edge_key(a, b): return (a, b) if a <= b else (b, a)
        seen = set()
        ordered_labels = []
        for a, b in zip(coords, coords[1:]):
            label = edge_labels.get(edge_key(a, b), None)
            if label and label not in seen:
                ordered_labels.append(label)
                seen.add(label)
        return ordered_labels

    def _format_labels_instruction(self, labels: list[str]) -> str:
        if not labels:
            return "TAXI VIA ???"
        return "TAXI VIA " + ", ".join(labels)

    # clearance events
    def _generate_clearance_events(self, coords: list[LonLat], geojson: GeoJSONFeatureCollection) -> list[ClearanceEvent]:
        events = []
        for i, coord in enumerate(coords):
            if self._is_runway_crossing(coord, geojson):
                events.append({
                    "i": i,
                    "kind": "HOLD_SHORT",
                    "name": "RUNWAY"
                })
        return events

    def _distance(self, p1: LonLat, p2: LonLat) -> float:
        return ((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) ** 0.5

    # helpers
    def _is_runway_crossing(self, coord: LonLat, geojson: GeoJSONFeatureCollection) -> bool:
        for f in geojson["features"]:
            if f["properties"].get("feature_type") == "runway":
                coords_raw = f["geometry"]["coordinates"]
                if not isinstance(coords_raw, list):
                    continue
                coords = [self._to_lonlat(pt) for pt in coords_raw]
                # Vérifier distance minimale à n'importe quel segment
                for i in range(len(coords) - 1):
                    if self._distance_to_segment(coord, coords[i], coords[i+1]) < 0.0001:
                        return True
        return False

    def _distance_to_segment(self, p: LonLat, a: LonLat, b: LonLat) -> float:
        import math
        ax, ay = a
        bx, by = b
        px, py = p

        dx, dy = bx - ax, by - ay
        if dx == dy == 0:
            return self._distance(p, a)

        t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        proj = (ax + t * dx, ay + t * dy)
        return self._distance(p, proj)


    def _to_lonlat(self, value: object) -> LonLat:
        if not isinstance(value, (list, tuple)):
            raise ValueError(f"Invalid location type: {value}")
        if len(value) != 2 or not all(isinstance(x, (int, float)) for x in value):
            raise ValueError(f"Invalid location format: {value}")
        return cast(LonLat, (float(value[0]), float(value[1])))
    
    def format_t_decimal(self, coord: Optional[LonLat]) -> LonLat:
        if not coord:
            return (0.0, 0.0)
        return (round(coord[0], 2), round(coord[1], 2))


        
    ###! SIMULATION THANKS GPT-5, I DIDNT READ THE CODE I HOPE IT WORKS
    #! NORMALLY THE DATA WOULD BE FETCHED FROM X-PLANE THROUGH INGESCAPE
    def sample_random_plane(self) -> Optional[Plane]:
        fc = self.airports_cache.get(self.selected_icao)
        geojson = self.get_airport_geojson()
        graph = self._build_taxi_graph(geojson)
        
        if not fc:
            return None

        line = self._pick_random_path_feature(fc, True)  # guaranteed LineString feature
        spawn_lon, spawn_lat, heading = self._random_point_and_heading_on_line(line)
        spawn_node = self.closest_node((spawn_lon, spawn_lat), graph)

        gates = self._collect_gates(fc)
        curr_gate_name, _curr_gate_pos = self._find_closest_gate((spawn_lon, spawn_lat), gates)
        
        final_line = self._pick_random_path_feature(fc, False)  # guaranteed LineString feature
        final_lon, final_lat, heading = self._random_point_and_heading_on_line(final_line)
        final_node = self.closest_node((final_lon, final_lat), graph)
        
        plane = Plane(
            spawn_pos=spawn_node,
            current_pos=spawn_node,
            final_pos=final_node,                 # Optional[LonLat]
            current_heading=heading,
            current_speed=0.0,
            current_altitude=0.0,
            current_gate=curr_gate_name,
        )
        
        return plane
    
    # ---------- Internal helpers ----------
    def _pick_random_path_feature(self, fc: GeoJSONFeatureCollection, is_spawning : bool) -> GeoJSONFeature:
        constr_points = {"taxiway"} if is_spawning else {"runway"}
        runway_twy: List[GeoJSONFeature] = [
            f for f in fc["features"]
            if f.get("geometry", {}).get("type") == "LineString"
            and str((f.get("properties") or {}).get("type", "")).lower() in constr_points
        ]
        if runway_twy:
            return random.choice(runway_twy)


        # 4) tiny segment around centroid
        cx, cy = self._centroid_lonlat(fc)
        eps = 1e-4
        return cast(GeoJSONFeature, {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [(cx - eps, cy), (cx + eps, cy)],
            },
            "properties": {
                "type": "synthetic",
                "source": "centroid",
            },
        })

    def _random_point_and_heading_on_line(self, feature: GeoJSONFeature) -> Tuple[float, float, float]:
        geom = feature.get("geometry", {})
        if geom.get("type") != "LineString":
            coords = cast(LonLat, geom.get("coordinates", (0.0, 0.0)))
            lon, lat = coords
            return lon, lat, 0.0

        coords = cast(List[LonLat], geom["coordinates"])
        if not coords:
            return 0.0, 0.0, 0.0

        if len(coords) == 1:
            lon, lat = coords[0]
            return lon, lat, 0.0

        i = random.randint(0, len(coords) - 2)
        (lon1, lat1), (lon2, lat2) = coords[i], coords[i + 1]

        t = random.random()
        lon = lon1 + t * (lon2 - lon1)
        lat = lat1 + t * (lat2 - lat1)

        heading = self._bearing_deg((lon1, lat1), (lon2, lat2))
        return lon, lat, heading

    def _collect_gates(self, fc: GeoJSONFeatureCollection) -> List[Tuple[str, LonLat]]:
        gates: List[Tuple[str, LonLat]] = []
        allowed = {"gate", "stand", "parking", "tie_down", "ramp", "hangar"}
        for f in fc.get("features", []):
            geom = f.get("geometry", {})
            if geom.get("type") != "Point":
                continue
            props = f.get("properties", {}) or {}
            ptype = str(props.get("type", "")).lower()
            if ptype not in allowed:
                continue

            lon, lat = cast(LonLat, geom["coordinates"])
            name = (
                str(props.get("name") or "")
                or str(props.get("gate") or "")
                or f"GATE-{len(gates)+1}"
            )
            gates.append((name, (lon, lat)))
        return gates

    def _find_closest_gate(self, pos: LonLat, gates: List[Tuple[str, LonLat]]) -> Tuple[Optional[str], LonLat]:
        if not gates:
            return None, (pos[0], pos[1])

        best_name: Optional[str] = None
        best_pos: LonLat = gates[0][1]
        best_d = float("inf")

        for name, (glon, glat) in gates:
            d = self._haversine_m(pos[1], pos[0], glat, glon)
            if d < best_d:
                best_d = d
                best_name = name
                best_pos = (glon, glat)
        return best_name, best_pos

    # ---------- Geo utils ----------
    def _haversine_m(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000.0
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dl = math.radians(lon2 - lon1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _bearing_deg(self, p1: LonLat, p2: LonLat) -> float:
        lon1, lat1 = map(math.radians, (p1[0], p1[1]))
        lon2, lat2 = map(math.radians, (p2[0], p2[1]))
        dlon = lon2 - lon1
        x = math.sin(dlon) * math.cos(lat2)
        y = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(dlon)
        brng = math.degrees(math.atan2(x, y))
        return (brng + 360.0) % 360.0
    
    def _centroid_lonlat(self, fc: GeoJSONFeatureCollection) -> LonLat:
        xs: List[float] = []
        ys: List[float] = []

        for f in fc["features"]:
            geom = f.get("geometry", {})
            gtype = geom.get("type")

            if gtype == "Point":
                coords = cast(LonLat, geom.get("coordinates"))
                lon, lat = coords
                xs.append(lon)
                ys.append(lat)

            elif gtype == "LineString":
                coords = cast(List[LonLat], geom.get("coordinates", []))
                for lon, lat in coords:
                    xs.append(lon)
                    ys.append(lat)

        if not xs:
            return (0.0, 0.0)

        return (sum(xs) / len(xs), sum(ys) / len(ys))