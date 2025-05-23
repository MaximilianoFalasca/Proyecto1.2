from .persona import Persona
from .conexion import get_connection

#tengo qeu seguir revisando todo bien
class Tripulacion(Persona):
    @classmethod
    def inicializar_db(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tripulacion(
                    legajo SERIAL PRIMARY KEY,
                    dni INTEGER UNIQUE NOT NULL,
                    rol TEXT NOT NULL,
                    horasAcumuladas REAL NOT NULL,
                    nroVuelo INTEGER NOT NULL,
                    fechaYHoraSalida TIMESTAMP NOT NULL,
                    FOREIGN KEY (nroVuelo, fechaYHoraSalida) REFERENCES vuelo(nro, fechaYHoraSalida)
                )               
            """)
            conn.commit()
            
    @classmethod
    def eliminarTripulacion(cls, legajo):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tripulacion WHERE legajo = (%s)",(legajo,))
            conn.commit()
            
    @classmethod
    def obtenerTripulacion(cls, legajo):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM tripulacion t 
                INNER JOIN persona p ON (p.dni = t.dni)     
                WHERE t.legajo = %s
            """,(legajo,))
            respuesta = cursor.fetchone()
            
            if not respuesta or len(respuesta)<9:
                return None  

            tripulacion = cls(
                dni=respuesta[1],
                nombre=respuesta[7],
                apellido=respuesta[8],
                cuil=respuesta[6],
                nroVuelo=respuesta[4],
                fechaYHoraSalida=respuesta[5],
                rol=respuesta[2],
                numeroTarjeta=respuesta[9] if len(respuesta) > 9 else None,
                horasAcumuladas=respuesta[3],
            )
            tripulacion.legajo = respuesta[0]
            return tripulacion
            
    @classmethod
    def obtenerTodos(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * 
                FROM tripulacion t
                    INNER JOIN persona p ON (p.dni=t.dni)           
            """)
            filas = cursor.fetchall()
            tripulacion = []
            
            for f in filas:
                if f and len(f)>=9:
                    t = cls(
                        dni=f[1], 
                        nombre=f[7],
                        apellido=f[8],
                        cuil=f[6],
                        nroVuelo=f[4],
                        fechaYHoraSalida=f[5],
                        rol=f[2], 
                        numeroTarjeta=f[9] if len(f)>9 else None,
                        horasAcumuladas = f[3],
                    )
                    t.legajo = f[0]
                    
                    tripulacion.append(t)
            
            return tripulacion
    
    # 1- hay que fixearlo por seguridad
    # 2- al finalizar un vuelo se acumulan las horas y se deja el nroVuelo, fechaYHoraSalida y rol vacios
    # hay que ver eso 
    @classmethod
    def actualizarTripulacion(cls, dni, datos:dict):
        campos_actualizables=["nroVuelo","fechaYHoraSalida","nombre","apellido","horasAcumuladas","rol"]
        
        mensaje="UPDATE tripulacion SET "
        datos_a_actualizar_padre={}
        
        for campo, valor in datos.items():
            if campo in campos_actualizables:
                mensaje+=f"{campo} = {valor}, "
            else:
                if campo == "nombre" or campo == "apellido":
                    datos_a_actualizar_padre[campo]=valor
                else:
                    raise ValueError(f"El parametro {campo} no es un campo actualizable")

        mensaje = mensaje[:-2]
        mensaje += f" WHERE dni = $s"
        
        
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(mensaje,(dni,))
            conn.commit()
            
        Persona.actualizarPersona(dni,datos_a_actualizar_padre)
            
    def __init__(self, dni, cuil, nombre, apellido, nroVuelo, fechaYHoraSalida, rol, numeroTarjeta=None, horasAcumuladas=None):
        super().__init__(dni, cuil, nombre, apellido, numeroTarjeta)
        super().guardar()
        self.dni = dni
        if (horasAcumuladas != None):
            self.horasAcumuladas = horasAcumuladas
        else:
            self.horasAcumuladas = 0
        self.nroVuelo = nroVuelo
        self.rol = rol
        self.fechaYHoraSalida = fechaYHoraSalida
    
    def guardar(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tripulacion (dni, horasAcumuladas, nroVuelo, fechaYHoraSalida, rol)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING legajo
            """, (self.dni, self.horasAcumuladas, self.nroVuelo, self.fechaYHoraSalida, self.rol))
            row = cursor.fetchone()
            self.legajo =  row if row is not None else None
            conn.commit()