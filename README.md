# cpdlc-flask-app

Ce projet fait partie du programme de recherche **CPDLC** et vise à explorer de nouvelles interfaces logicielles autour du simulateur de vol **X-Plane**, en particulier les échanges de données entre les contrôleurs aériens et les pilotes via des protocoles modernes comme le CPDLC (Controller–Pilot Data Link Communications).  
Cette application web, construite avec **Flask**, fournit une interface utilisateur pour visualiser et interagir avec les messages et données CPDLC échangés via le plugin X-Plane.

## Prérequis

- Python 3.8+
- `venv` (inclus avec Python)
- `pip` pour installer les dépendances
- X-Plane installé avec le plugin CPDLC (ou un simulateur de données mockées)

## Installation et exécution

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/UXFlight/cpdlc-flask-app.git
   cd cpdlc-flask-app
   ```
#
2. **Créer un environnement virtuel**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```

3. **Installer les dépendances**

   ```bash
   pip install -r requirements.txt
   ```

4. **Lancer l'application**

   ```bash
   flask run
   ```

   ou bien

   ```bash
   python3 app.py
   ```

   L'application sera disponible sur [http://127.0.0.1:5320/](http://127.0.0.1:5320/)

5. **Arrêter l'environnement virtuel**
   ```bash
   deactivate
   ```

## Structure du projet

```
cpdlc-flask-app/
.
├── app
│   ├── config.py
│   ├── constants.py
│   ├── ingsvc
│   │   ├── agent.py
│   │   ├── callbacks.py
│   │   ├── init_agent.py
│   │   └── __init__.py
│   ├── __init__.py
│   ├── logs
│   ├── routes
│   │   ├── action_routes.py
│   │   ├── general.py
│   │   ├── __init__.py
│   │   └── request_routes.py
│   ├── services
│   │   ├── action_service.py
│   │   ├── __init__.py
│   │   ├── log_manager.py
│   │   ├── request_service.py
│   │   └── socket_event_service.py
│   ├── socket
│   │   ├── __init__.py
│   │   └── sockets.py
│   ├── state
│   │   ├── __init__.py
│   │   └── state.py
│   └── utils
│       ├── helpers.py
│       └── __init__.py
├── main.py
├── project-structure.txt
├── README.md
├── requirements.txt
├── shared
│   └── msg_status.json
├── static
│   ├── css
│   │   ├── header.css
│   │   ├── logs.css
│   │   ├── pilot-buttons.css
│   │   ├── request.css
│   │   ├── style.css
│   │   └── taxi-clearance.css
│   ├── favicon.ico
│   ├── js
│   │   ├── api
│   │   │   └── api.js
│   │   ├── events
│   │   │   ├── action.js
│   │   │   ├── cancelRequest.js
│   │   │   ├── execute.js
│   │   │   ├── filter.js
│   │   │   ├── load.js
│   │   │   ├── overlay.js
│   │   │   ├── pushbackDirection.js
│   │   │   └── sendRequest.js
│   │   ├── main.js
│   │   ├── messages
│   │   │   └── historyLogs.js
│   │   ├── socket
│   │   │   └── socket.js
│   │   ├── socket-events
│   │   │   ├── atcResponse.js
│   │   │   ├── connectionEvents.js
│   │   │   └── timeoutEvent.js
│   │   ├── state
│   │   │   ├── handlerMap.js
│   │   │   ├── init.js
│   │   │   ├── state.js
│   │   │   └── status.js
│   │   ├── ui
│   │   │   ├── buttons-ui.js
│   │   │   ├── timer-ui.js
│   │   │   └── ui.js
│   │   └── utils
│   │       └── utils.js
│   └── mp3
│       └── notif.mp3
└── templates
    └── index.html

23 directories, 59 files
```

# Visualisation
