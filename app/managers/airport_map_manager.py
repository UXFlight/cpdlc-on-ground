from app.classes.airport_cache import AirportCache
from app.classes.apt_parser import APTParser
from app.utils.simulate_pos import simulate_plane_from_map
from app.utils.types import AirportMapData, Plane

class AirportMapManager:
    def __init__(self, icao: str = "OMDB"):
        self.icao = icao
        self.cache = AirportCache()
        self.map_data = self.get_or_parse_map(icao)
        self.parser = None

    def get_or_parse_map(self, icao: str) -> AirportMapData:
        if self.cache.is_cached(icao):
            print(f"[AirportMapManager] Loading {icao} from cache")
            return self.cache.load(icao)

        print(f"[AirportMapManager] Parsing {icao} via apt.dat")
        self.parser = APTParser()
        parsed = self.parser.parse_airport(icao)
        self.cache.save(icao, parsed)
        return parsed

    # for ingescape!
    def change_airport(self, new_icao: str):
        if new_icao != self.icao:
            self.icao = new_icao
            self.map_data = self.get_or_parse_map(new_icao)

    def get_map(self) -> AirportMapData:
        return self.map_data

    def simulate_plane(self) -> Plane:
        map = self.get_map()
        return simulate_plane_from_map(map)
    