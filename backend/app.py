from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from pathlib import Path

from .routes import *
from .models import * 

# Ruta absoluta al .env dentro de config
env_path = Path(__file__).parent / "config" / ".env"
load_dotenv(dotenv_path=env_path)

# Inicializar la base de datos antes de iniciar la aplicación
Asiento.inicializar_db()
Pasajero.inicializar_db()
Persona.inicializar_db()
Reserva.inicializar_bd()
TarjetaBeneficio.inicializar_bd()
Tripulacion.inicializar_db()
Avion.inicializar_db()
Aeropuerto.inicializar_db()
Vuelo.inicializar_db()

# Inicializar la aplicación Flask
app = Flask(__name__)

# CORS abierto para cualquier origen (puedo poner un dominio en producción)
CORS(app)

# Registrar el Blueprint
app.register_blueprint(Pasajero_routes)
app.register_blueprint(Avion_routes)
app.register_blueprint(Reserva_routes)
app.register_blueprint(Tripulacion_routes)
app.register_blueprint(Vuelo_routes)
app.register_blueprint(Tarjeta_routes)
app.register_blueprint(Asiento_routes)
app.register_blueprint(Aeropuerto_routes)

# No arranco con app.run porque Render usará gunicorn para producción
#if __name__ == "__main__":
#    app.run(debug=True)