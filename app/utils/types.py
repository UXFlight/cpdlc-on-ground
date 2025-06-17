from typing import TypedDict

class SocketMessage(TypedDict):
    event: str
    payload: Payload 

class SocketError(TypedDict):
    context: str
    message: str
    request_type: str

class Payload(TypedDict):
    label: str
