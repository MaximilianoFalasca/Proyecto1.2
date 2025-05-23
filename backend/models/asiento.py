from .conexion import get_connection

class Asiento:
    
    @classmethod
    def inicializar_db(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS asiento (
                    numero INTEGER,
                    matricula TEXT NOT NULL,
                    precio REAL NOT NULL,
                    habilitado BOOLEAN NOT NULL,
                    PRIMARY KEY (numero, matricula),
                    FOREIGN KEY (matricula) REFERENCES avion(matricula)
                );
               
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ocupa (
                    numeroAsiento INTEGER,
                    matricula TEXT,
                    numeroReserva INTEGER,
                    PRIMARY KEY (matricula, numeroAsiento, numeroReserva),
                    FOREIGN KEY (numeroAsiento, matricula) REFERENCES asiento(numero, matricula),
                    FOREIGN KEY (numeroReserva) REFERENCES reserva(numero)
                );
            """)
            conn.commit()
        
    @classmethod
    def obtenerTodos(cls):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * from asiento")
            resultado = cursor.fetchall()
            
            return [
                cls(
                    numero = asiento[0],
                    matricula = asiento[1],
                    precio = asiento[2],
                    habilitado = asiento[3]
                ) for asiento in resultado
            ]
    
    @classmethod
    def obtenerAsiento(cls, numero, matricula):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * from asiento WHERE numero = %s and matricula = %s",(numero, matricula))
            resultado = cursor.fetchone()
            
            if not resultado:
                raise ValueError(f"No existe un asiento con el numero {numero} y matricula {matricula} registrada")

            return cls(
                numero = resultado[0],
                matricula = resultado[1],
                precio = resultado[2],
                habilitado = resultado[3]
            )

    @classmethod
    def actualizarAsiento(cls, numero, matricula ,datos:dict):
        datos_modificables = ["precio"]
        
        columnas = []
        valores = []
        
        for key, value in datos.items():
            if (key in datos_modificables):
                columnas.append(f"{key} = %s")
                valores.append(value)
            else:
                raise ValueError(f"El dato {key} no es un dato modificable")
        
        if (columnas):
            query_set = ", ".join(columnas)
            query = f"UPDATE asiento SET {query_set} WHERE numero = %s AND matricula = %s"
            
            valores.extend([numero, matricula])
            
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, valores)
                conn.commit()
    
    @classmethod
    def eliminarAsiento(cls, numero, matricula):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM asiento WHERE numero = %s AND matricula = %s", (numero, matricula))
            cursor.execute("DELETE FROM ocupa WHERE numeroAsiento = %s AND matricula = %s", (numero, matricula))
            conn.commit()

    # hago esto para poder consultarlo desde reserva y mandar desde ahi los asientos reservados 
    @classmethod
    def asientos_ocupados_por(cls, numeroReserva):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT a.numero, a.matricula, a.precio, a.habilitado
                FROM ocupa o
                    INNER JOIN asiento a ON (a.numero=o.numeroAsiento)
                WHERE numeroReserva = (%s)
            """, (numeroReserva,))
            asientos_ocupados = cursor.fetchall()
            
            asientos=[]
            for asiento in asientos_ocupados:
                a = cls(
                    numero = asiento[0],
                    matricula = asiento[1],
                    precio = asiento[2],
                    habilitado = asiento[3]                             
                )
                
                asientos.append(a)
            
            return asientos
    
    def __init__(self, numero, matricula, precio, habilitado=True):
        self.numero = numero
        self.matricula = matricula
        self.precio = precio
        self.habilitado = habilitado
    
    def guardar(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO asiento (numero, matricula, precio, habilitado) VALUES (%s,%s,%s,%s)",(self.numero, self.matricula,self.precio, self.habilitado))
            conn.commit()
            
    def estaRelacionadoCon(self,numeroReserva):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 1  
                FROM ocupa o
                WHERE (o.numeroAsiento = %s AND o.matricula = %s AND o.numeroReserva = %s)
            """, (self.numero, self.matricula, numeroReserva))
            respuesta = cursor.fetchone()
            return respuesta
            
    def estaOcupado(self):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 1  
                FROM ocupa o
                    INNER JOIN esta e ON (e.numeroReserva = o.numeroReserva)
                WHERE (o.numeroAsiento = %s AND o.matricula = %s AND e.fechaFin IS NULL AND e.nombreEstado = 'Paid')
            """, (self.numero, self.matricula))
            respuesta = cursor.fetchone()
            return respuesta
            
    def relacionarConReserva(self, numeroReserva):
        with get_connection() as conn:
            cursor = conn.cursor()
            respuesta = self.estaOcupado()
            if(respuesta):
                raise ValueError("El asiento ya esta reservado")
            cursor.execute("INSERT INTO ocupa (numeroAsiento, matricula, numeroReserva) VALUES (%s,%s,%s)",(self.numero, self.matricula, numeroReserva))
            conn.commit()
            self.numeroReserva=numeroReserva
    
    def cancelarRelacionConReserva(self, numeroReserva):
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM ocupa WHERE numeroAsiento = (%s) and matricula = (%s) and numeroReserva = (%s)",(self.numero, self.matricula, numeroReserva))
            conn.commit()
            
    def inhabilitarAsiento(self):
        if(not self.habilitado):
            return "El asiento ya se encuentra inhabilitado"
        
        self.habilitado = False
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE asiento SET habilitado = (%s) WHERE numero = (%s) AND matricula = (%s)",(self.habilitado, self.numero, self.matricula)) 
            conn.commit()
            
        return "Asiento inhabilitado con exito"