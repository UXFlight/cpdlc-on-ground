class Clearance:
    @staticmethod
    def format_clearance_message(message: str) -> str:
        formatted = message.strip()
        if not formatted.endswith('.'):
            formatted += '.'
        return formatted

    