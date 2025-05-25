from flask import Blueprint, jsonify, request
from ..models import Pasajero

Pasajero_routes = Blueprint('pasajero_routes',__name__)

@Pasajero_routes.route('/pasajeros/<string:email>/<string:password>', methods=['GET'])
def obtener_pasajero(email,password):
    try:
        pasajero = Pasajero.obtenerPasajero(email, password)
        return jsonify({
            "dni":pasajero.dni, 
            "telefono":pasajero.telefono, 
            "mail":pasajero.mail, 
            "cuil":pasajero.cuil, 
            "nombre":pasajero.nombre, 
            "apellido":pasajero.apellido, 
            "numeroTarjeta":pasajero.numeroTarjeta
        }), 200
    except Exception as e:
        return jsonify({"error":str(e)}), 400

@Pasajero_routes.route('/pasajeros', methods=['GET'])
def obtener_pasajeros():
    pasajeros = Pasajero.obtenerTodos()
    
    return jsonify([
        {
            "dni":pasajero.dni, 
            "telefono":pasajero.telefono, 
            "mail":pasajero.mail, 
            "cuil":pasajero.cuil, 
            "nombre":pasajero.nombre, 
            "apellido":pasajero.apellido, 
            "numeroTarjeta":pasajero.numeroTarjeta
        } for pasajero in pasajeros
    ]), 200
    
@Pasajero_routes.route('/pasajeros', methods=['POST'])
def registrar_pasajero():
    pasajero = request.json
    
    if not pasajero or not pasajero.get('cuil') or not pasajero.get('nombre') or not pasajero.get('apellido') or not pasajero.get('dni'):
        return jsonify({"error": "Faltan datos"}), 400
    
    try:
        nuevo_pasajero = Pasajero(**pasajero)
        nuevo_pasajero.guardar()
        return jsonify({"mensaje":"Pasajero registrado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400 
    
@Pasajero_routes.route('/pasajeros/add_card', methods=['POST'])
def agregar_tarjeta():
    datos = request.json
    
    if not datos or not datos.get('dni') or not datos.get('numerotarjeta'):
        return jsonify({"error":"Faltan datos"}), 400
    
    try:
        pasajero = Pasajero.obtenerPasajeroPorDni(datos.get('dni'))
        pasajero.agregarTarjeta(datos.get('numeroTarjeta'))
        return jsonify({"mensaje":"Tarjeta agregada con exito"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@Pasajero_routes.route('/pasajeros/<int:dni>', methods=['PUT'])
def modificar_pasajero(dni):
    datos = request.json
    try:
        if datos is None:
            raise ValueError("No se puede realizar un put sin datos")
        Pasajero.actualizarPasajero(dni,datos)
        return jsonify({"mensaje":"Datos de pasajero actualizados con exito"}), 201
    except Exception as e:
        return jsonify({"error":str(e)}), 400
    
@Pasajero_routes.route('/pasajeros/<int:dni>', methods=['DELETE'])
def eliminar_pasajero(dni):
    try:
        Pasajero.eliminarPasajero(dni)
        return jsonify({"mensaje":"Pasajero eliminado con exito"}), 204
    except Exception as e:
        return jsonify({"error":str(e)}), 400