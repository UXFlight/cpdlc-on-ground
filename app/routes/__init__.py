from .general import general_bp
from .request_routes import request_bp
from .action_routes import action_bp

all_blueprints = [general_bp, request_bp, action_bp]
