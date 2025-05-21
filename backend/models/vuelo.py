from datetime import datetime
from conexion import get_connection

class Vuelo:
    
    @classmethod
    def inicializar_db(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vuelo(
                    nro INTEGER NOT NULL,
                    fechaYHoraSalida TIMESTAMP NOT NULL,
                    fechaYHoraLlegada TIMESTAMP NOT NULL,
                    matricula INTEGER NOT NULL,
                    codigoAeropuertoSalida INTEGER NOT NULL,
                    codigoAeropuertoLlegada INTEGER NOT NULL,
                    PRIMARY KEY (nro, fechaYHoraSalida),
                    FOREIGN KEY (matricula) REFERENCES avion(matricula),
                    FOREIGN KEY (codigoAeropuertoSalida) REFERENCES aeropuerto(codigoAeropuertoSalida),
                    FOREIGN KEY (codigoAeropuertoLlegada) REFERENCES aeropuerto(codigoAeropuertoLlegada)
                )               
            """)
            conn.commit()
            
    @classmethod
    def obtenerVuelo(cls, nro, fechaYHoraSalida):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vuelo WHERE nro = (%s) and fechaYHoraSalida = (%s)",(nro,fechaYHoraSalida))
            respuesta = cursor.fetchone()
            
            if not (respuesta):
                raise ValueError("No se encontro un vuelo con ese nro y/o fecha de salida")
            
            avion = cls( 
                nro = nro,
                fechaYHoraSalida = fechaYHoraSalida,
                fechaYHoraLlegada= respuesta[2],
                matricula = respuesta[3],
                codigoAeropuertoSalida = respuesta[4],
                codigoAeropuertoLlegada = respuesta[5],
            )
            
            return avion
    
    @classmethod
    def obtenerTodos(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vuelo")
            vuelos = cursor.fetchall()
            vuelosP = []
            
            for vuelo in vuelos:
                v = cls( 
                    nro = vuelo[0],
                    fechaYHoraSalida = vuelo[1],
                    fechaYHoraLlegada = vuelo[2],
                    matricula = vuelo[3],
                    codigoAeropuertoSalida = vuelo[4],
                    codigoAeropuertoLlegada = vuelo[5],
                )
                vuelosP.append(v)
            
            return  vuelosP
            
    @classmethod
    def eliminarVuelo(cls, nro, fechaYHoraSalida):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM vuelo WHERE nro = (%s) and fechaYHoraSalida = (%s)",(nro, fechaYHoraSalida))
            conn.commit()
    
    def __init__(self, nro, fechaYHoraSalida, fechaYHoraLlegada, matricula, codigoAeropuertoSalida, codigoAeropuertoLlegada):
        self.nro = nro
        self.fechaYHoraSalida = fechaYHoraSalida
        self.fechaYHoraLlegada = fechaYHoraLlegada
        self.matricula = matricula
        self.codigoAeropuertoSalida = codigoAeropuertoSalida
        self.codigoAeropuertoLlegada = codigoAeropuertoLlegada
    
    def guardar(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO vuelo 
                    (nro, fechaYHoraSalida, fechaYHoraLlegada, matricula, codigoAeropuertoSalida, codigoAeropuertoLlegada) 
                VALUES (%s,%s,%s,%s,%s,%s)""",
            (
                self.nro, 
                self.fechaYHoraSalida, 
                self.fechaYHoraLlegada, 
                self.matricula, 
                self.codigoAeropuertoSalida, 
                self.codigoAeropuertoLlegada)
            )
            conn.commit()
            
    # esto no esta obteniendo los asientos??
    def obtenerAsientos(self):
        from .avion import Avion
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT a.matricula, a.fechaFabricacion, a.capacidad, a.nombreModelo, a.nombreMarca
                FROM vuelo v
                    INNER JOIN avion a ON (a.matricula = v.matricula) 
            """)
            # (self, matricula, fechaFabricacion, capacidad, nombreModelo, nombreMarca)
            respuesta = cursor.fetchone()
            
            avion = Avion(respuesta[0],respuesta[1],respuesta[2],respuesta[3],respuesta[4])
            
            asientos = avion.obtenerAsientos()
            
            return asientos