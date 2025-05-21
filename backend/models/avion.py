from conexion import get_connection

class Avion:
    
    @classmethod
    def inicializar_db(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS avion(
                    matricula TEXT NOT NULL PRIMARY KEY,
                    fechaFabricacion DATE NOT NULL,
                    capacidad INTEGER NOT NULL,
                    nombreModelo TEXT NOT NULL,
                    nombreMarca TEXT NOT NULL,
                    kilometros REAL NOT NULL
                );     
            """)
            conn.commit()
    
    @classmethod
    def eliminarAvion(cls, matricula):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM avion WHERE matricula = (%s)",(matricula,))
            conn.commit()
    
    @classmethod
    def obtenerAvion(cls, matricula):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(" SELECT * FROM avion WHERE matricula = (%s)",(matricula,))
            respuesta = cursor.fetchone()
            
            if not (respuesta):
                raise ValueError(f"No existe el avion con matricula {matricula}")
            
            avion = cls(
                matricula=respuesta[0],
                fechaFabricacion=respuesta[1],
                capacidad=respuesta[2],
                nombreModelo=respuesta[3],
                nombreMarca=respuesta[4],
            )       
            avion.kilometros = respuesta[5]
            
            return avion  
    
    @classmethod
    def obtenerTodos(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM avion")
            respuesta = cursor.fetchall()
            
            aviones = []
            for avion in respuesta:
                a = cls(
                        matricula=avion[0],
                        fechaFabricacion=avion[1],
                        capacidad=avion[2],
                        nombreModelo=avion[3],
                        nombreMarca=avion[4],
                    )
                a.kilometros = avion[5]
                aviones.append(a)
            
            return aviones
    
    @classmethod
    def actualizarAvion(cls, matricula, datos):
        campos_actualizables=["fechaFabricacion","capacidad","nombreModelo","nombreMarca"]
        
        mensaje="UPDATE avion SET "
        
        for campo, valor in datos.items():
            if campo in campos_actualizables:
                mensaje+=f"{campo} = '{valor}', "
            else:
                raise ValueError(f"El parametro {campo} no es un campo actualizable")
    
        mensaje = mensaje[:-2]
        mensaje += f" WHERE matricula = '{matricula}'"
        
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(mensaje)
            conn.commit()
            
    
    def __init__(self, matricula, fechaFabricacion, capacidad, nombreModelo, nombreMarca):
        self.matricula = matricula
        self.nombreModelo = nombreModelo
        self.fechaFabricacion = fechaFabricacion
        self.capacidad = capacidad
        self.nombreMarca = nombreMarca
        self.kilometros = 0.0
    
    def guardar(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO avion (matricula, capacidad, nombreModelo, fechaFabricacion, nombreMarca, kilometros) VALUES (%s,%s,%s,%s,%s,%s)",(self.matricula, self.capacidad,  self.nombreModelo, self.fechaFabricacion, self.nombreMarca, self.kilometros))
            conn.commit()
            
    def obtenerAsientos(self):
        from .asiento import Asiento
        with get_connection() as conn:
            cursor = conn.cursor()
            # (self, numero, matricula, precio)
            cursor.execute("""
                SELECT a.numero, a.matricula, a.precio, a.habilitado
                FROM avion av
                    INNER JOIN asiento a ON (a.matricula=av.matricula)
            """)
            
            respuesta = cursor.fetchall()
            asientos = []
            for asiento in respuesta:
                a = Asiento(asiento[0],asiento[1],asiento[2],asiento[3])
                
                estado = "libre"
                if (a.estaOcupado()):
                    estado="ocupado"
                
                if(not a.habilitado):
                    estado="inhabilitado"
                    
                asientos.append({
                    'numero': a.numero,
                    'matricula': a.matricula,
                    'precio': a.precio,
                    'estado': estado
                } )
                
            return asientos
            
    # agregar funcion para cuando finalize un viaje que se le agregue los km, tambien hay que hacerlo en tripulacion 
    # eso se implementa en vuelo como un "terminarVuelo"