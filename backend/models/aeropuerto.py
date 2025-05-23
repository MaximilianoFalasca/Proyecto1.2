from .conexion import get_connection

class Aeropuerto:

    @classmethod
    def inicializar_db(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS aeropuerto(
                    codigo SERIAL PRIMARY KEY,
                    nombre TEXT NOT NULL,
                    nombreCiudad TEXT NOT NULL,
                    nombrePaiz TEXT NOT NULL
                )               
            """)
            conn.commit()
            
    @classmethod
    def eliminarAeropuerto(cls, codigo):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM aeropuerto WHERE codigo = (%s)",(codigo,))
            conn.commit()
    
    @classmethod
    def obtenerAeropuerto(cls, codigo):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(" SELECT * FROM aeropuerto WHERE codigo = (%s)",(codigo,))
            respuesta = cursor.fetchone()
            
            if not (respuesta):
                raise ValueError(f"No existe el aeropuerto con codigo {codigo}")
            
            aeropuerto = cls(
                        codigo=respuesta[0],
                        nombre=respuesta[1],
                        nombreCiudad=respuesta[2],
                        nombrePaiz=respuesta[3],
                    )   
            
            return aeropuerto  
    
    @classmethod
    def obtenerTodos(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM aeropuerto")
            respuesta = cursor.fetchall()
            
            aeropuertos = []
            for aeropuerto in respuesta:
                a = cls(
                        codigo=aeropuerto[0],
                        nombre=aeropuerto[1],
                        nombreCiudad=aeropuerto[2],
                        nombrePaiz=aeropuerto[3],
                    )
                aeropuertos.append(a)
            
            return aeropuertos
    
    @classmethod
    def actualizarAeropuerto(cls, codigo, datos):
        campos_actualizables=["nombre","nombreCiudad","nombrePaiz"]
        
        mensaje="UPDATE aeropuerto SET "
        
        for campo, valor in datos.items():
            if campo in campos_actualizables:
                mensaje+=f"{campo} = '{valor}', "
            else:
                raise ValueError(f"El parametro {campo} no es un campo actualizable")
    
        mensaje = mensaje[:-2]
        mensaje += f" WHERE codigo = '{codigo}'"
        
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(mensaje)
            conn.commit()
    
    def __init__(self, nombre, nombreCiudad, nombrePaiz, codigo=None):
        self.codigo = codigo
        self.nombre = nombre
        self.nombreCiudad = nombreCiudad
        self.nombrePaiz = nombrePaiz
    
    def guardar(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Aeropuerto (codigo, nombre, nombreCiudad, nombrePaiz) VALUES (%s,%s,%s,%s) RETURNING codigo",(self.codigo, self.nombre,  self.nombreCiudad, self.nombrePaiz))
            conn.commit()
            self.codigo = cursor.fetchone()[0]