# creates a unique color based on sid
# avoids yellow and red
def set_pilot_color(sid: str) -> str:
    hash_value = 0
    for char in sid:
        hash_value = ord(char) + ((hash_value << 5) - hash_value)

    safe_hue = 80 + abs(hash_value) % 170  # 80 → 250

    saturation = 60
    lightness = 65 

    return f"hsl({safe_hue}, {saturation}%, {lightness}%)"
