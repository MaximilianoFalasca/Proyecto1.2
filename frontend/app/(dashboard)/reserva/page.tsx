"use client"
import React from 'react';
import CustomIcon from '../../../components/CustomIcon';
import axios from 'axios';
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from '@/utils/config';
import { Box, Button } from '@mui/material';
import { Grid2 } from '@mui/material';

import { useSession } from "next-auth/react";
interface Asiento{
  numero: number;
  matricula: string;
  precio: number;
  estado: string;
}

export default function ReservaPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const numero = searchParams.get("numero");
  const fechaSalidaEncoded = searchParams.get("fechaSalida");
  const router = useRouter();

  const fechaSalida = fechaSalidaEncoded ? decodeURIComponent(fechaSalidaEncoded) : null;
  const [asientos,setAsientos] = React.useState<any | any>(null)
  const [seleccionados,setSeleccionados] = React.useState<Asiento[]>([])
  
  React.useEffect(() => {
    async function getAsientos(){
      try{
        if (!numero || !fechaSalida) {
          console.error("Numero de vuelo o fecha de salida no proporcionados.");
          return;
        }

        let fechaProcesada = formatoBackend(fechaSalida)
        
        let response = await axios.get(`${API_URL}/vuelos/${numero}/${fechaProcesada}/asientos`)

        setAsientos(response.data)
      } catch (error) {
        console.error(error);
      }
    }

    getAsientos()
  },[numero, fechaSalida])

  function formatoBackend(fechaStr:string) {
    const fecha = new Date(fechaStr);
    
    // formato esperado: "YYYY-MM-DDTHH:mm:ss"
    // el padStart rellena al principio con ceros si es necesario
    const year = fecha.getUTCFullYear();
    const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const day = String(fecha.getUTCDate()).padStart(2, '0');
    const hours = String(fecha.getUTCHours()).padStart(2, '0');
    const minutes = String(fecha.getUTCMinutes()).padStart(2, '0');
    const seconds = String(fecha.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  function seleccionAsiento(asiento:Asiento){
    setAsientos(asientos.map((asientoMap:Asiento) => {
      if (asientoMap.numero == asiento.numero) {
        if (asientoMap.estado=="libre") {
          asientoMap.estado="seleccionado"
          setSeleccionados([...seleccionados, asientoMap])
        } else if (asientoMap.estado=="seleccionado") {
          asientoMap.estado="libre"
          setSeleccionados([...seleccionados.filter((asientoSeleccionado:Asiento) => asientoSeleccionado.numero != asientoMap.numero)])
        }
      }
      return asientoMap
    }))
  }

  function obtenerObjetosAsientos(){
    console.log("asientos:",asientos)
    //if (!asientos || asientos.length < 4) return <p>Cargando asientos o no hay suficientes disponibles.</p>;

    //if (asientos.length < 4) return <p>No hay suficientes asientos disponibles.</p>;

    if (!Array.isArray(asientos) || asientos.length < 1) return <p>No hay asientos disponibles.</p>;

    
    const getJustify = (codigo: number) => {
      const lastTwoBits = codigo & 0b11;
      if (lastTwoBits === 0b10 || lastTwoBits === 0b11) return 'center';
      if (lastTwoBits === 0b00) return 'start';
      if (lastTwoBits === 0b01) return 'end';
      return 'center';
    };

    return (
      <Grid2 container spacing={2} minHeight={160}>
        {asientos.map((asiento, index) => (
          <Grid2
            key={index}
            size={{ xs: 3, sm: 4 }}
            display="flex"
            justifyContent={getJustify(index)}
            alignItems="center"
            component="svg"
            onClick={(e) => seleccionAsiento(asiento)}
          >
            <CustomIcon 
              color={asiento.estado=="libre"?"disabled":asiento.estado=="inhabilitado" || asiento.estado=="ocupado"?"error":"primary"}
              fontSize='large'
            />
          </Grid2>
        ))}
      </Grid2>
    )
  }

  async function reservarAsiento(){
    if (seleccionados.length === 0) {
      console.error("No hay asientos seleccionados para reservar.");
      return;
    }
    const dni = session?.user?.dni || -1;

    if (!numero || !fechaSalida) {
      console.error("Numero de vuelo o fecha de salida no proporcionados.");
      return;
    }

    const fechaProcesada = formatoBackend(fechaSalida);

    let response = await axios.get(`${API_URL}/vuelos/${numero}/${fechaProcesada}`);
    let vuelo = response.data;

    if (!vuelo) {
      console.error("No se encontró el vuelo especificado.");
      return;
    }

    const asientosSeleccionados = seleccionados.map(asiento => ({
      numero: asiento.numero,
      matricula: vuelo.matricula,
      precio: asiento.precio,
      estado: "reservado"
    }));

    const vueloReservado = {
      nro:vuelo.nro,
      fechaYHoraSalida: vuelo.fechaYHoraSalida,
    }

    const reserva = {
      dni: dni,
      vuelo: vueloReservado,
      asientos: asientosSeleccionados
    };

    const reservaJson = JSON.stringify(reserva)

    await axios.post(`${API_URL}/reservas`, reservaJson);
  }

  function cancelarReservas(){
    asientos.forEach((asiento:Asiento) => {
      if (asiento.estado === "seleccionado") {
        asiento.estado = "libre";
      }
    });
    setSeleccionados([]);
  }

  return (    
    <>
      { !session ? ( 
        <p>Debes iniciar sesión para reservar un asiento.</p> 
      ) : ( 
        <Box style={{ display: 'flex', justifyContent: 'space-around', alignItems:'center', height: '100vh', width:'100%', flex: 1}}>
          {obtenerObjetosAsientos()}
          <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 1}} gap={2}>
            <Button variant="outlined" onClick={() => {
              reservarAsiento();
              router.push(`/historial?dni=${session.user.dni}`)
            }}>
              Reservar
            </Button>
            <Button variant="outlined" onClick={() => cancelarReservas()}>
              Cancelar
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}