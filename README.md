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
   git clone https://github.com/CPDLC-research-program/cpdlc-flask-app.git
   cd cpdlc-flask-app
   ```

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
├── agent.py
├── app.py
├── img
│   └── project.png
├── project-structure.txt
├── README.md
├── requirements.txt
├── services
├── static
│   ├── css
│   │   ├── logs.css
│   │   ├── pilot-buttons.css
│   │   ├── request.css
│   │   ├── style.css
│   │   └── taxi-clearance.css
│   ├── favicon.ico
│   ├── js
│   │   ├── api.js
│   │   ├── state.js
│   │   └── ui.js
│   ├── main.js
│   └── mp3
│       └── notif.mp3
└── templates
    └── index.html

8 directories, 18 files

```

# Visualisation
