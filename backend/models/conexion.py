"""Este módulo se encarga de la conexión a la base de datos."""
import psycopg2
import os

def get_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise EnvironmentError("La variable DATABASE_URL no está definida.")
    return psycopg2.connect(db_url)
