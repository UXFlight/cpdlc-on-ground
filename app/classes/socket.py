class SocketService:
    def __init__(self, socketio): 
        self.socketio = socketio

    def listen(self, event_name, callback):
        self.socketio.on(event_name)(callback)

    def send(self, event, data, room=None): 
        self.socketio.emit(event, data, room=room)