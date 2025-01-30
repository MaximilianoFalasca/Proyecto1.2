from flask import Blueprint, jsonify, request
from models import Aeropuerto

Aeropuerto_routes = Blueprint('aeropuerto_routes',__name__)

# aca mas que nada es importante agregar aviones y eliminarlos, tambien modificar los km y demas

@Aeropuerto_routes.route('/aeropuertos/<int:codigo>', methods=["GET"])
def obtener_aeropuerto(codigo):
    try:
        aeropuerto = Aeropuerto.obtenerAeropuerto(codigo)
        return jsonify({
            "codigo":aeropuerto.codigo,
            "nombre":aeropuerto.nombre,
            "nombreCiudad":aeropuerto.nombreCiudad,
            "nombrePaiz" : aeropuerto.nombrePaiz
        }), 200
    except Exception as e:
        return jsonify({"error":str(e)}), 400

@Aeropuerto_routes.route('/aeropuertos', methods=['GET'])
def obtener_aeropuertos():
    try:
        aeropuertos = Aeropuerto.obtenerTodos()
        return jsonify([
            {
                "codigo":aeropuerto.codigo,
                "nombre":aeropuerto.nombre,
                "nombreCiudad":aeropuerto.nombreCiudad,
                "nombrePaiz" : aeropuerto.nombrePaiz
            } for aeropuerto in aeropuertos
        ]), 200
    except Exception as e:
        return jsonify({"error":str(e)}), 400
    
@Aeropuerto_routes.route('/aeropuertos', methods=['POST'])
def registrar_aeropuerto():
    aeropuerto = request.json
    
    if not aeropuerto or not aeropuerto.get('nombre') or not aeropuerto.get('nombreCiudad') or not aeropuerto.get('nombrePaiz'):
        return jsonify({"error": "Faltan datos"}), 
    
    try:
        nuevo_aeropuerto = Aeropuerto(**aeropuerto)
        nuevo_aeropuerto.guardar()
        return jsonify({"mensaje":"Avion registrado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400 
    
@Aeropuerto_routes.route('/aeropuertos/<int:codigo>', methods=['PUT'])
def modificar_aeropuerto(codigo):
    datos = request.json
    try:
        Aeropuerto.actualizarAeropuerto(codigo,datos)
        return jsonify({"mensaje":"Datos de avion actualizados con exito"}), 201
    except Exception as e:
        return jsonify({"error":str(e)}), 400
    
@Aeropuerto_routes.route('/aeropuertos/<int:codigo>', methods=['DELETE'])
def eliminar_aeropuerto(codigo):
    try:
        Aeropuerto.eliminarAeropuerto(codigo)
        return jsonify({"mensaje":"Avion eliminado con exito"}), 204
    except Exception as e:
        return jsonify({"error":str(e)}), 400