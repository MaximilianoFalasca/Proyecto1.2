"use client"
import React from 'react';
import CustomIcon from '../../../../components/CustomIcon';
import axios from 'axios';
import { useSearchParams } from "next/navigation";
import { API_URL } from '@/utils/config';
import Stack from '@mui/material/Stack';

// asi tendria que mandar los datos: http://localhost:3000/vuelos/asientos?numero=123&fechaSalida=2025-02-15
// Redirigir a la página de prueba con parámetros
//router.push(`/prueba?numero=${numero}&fechaSalida=${fechaSalida}`);

// esto no, voy a mostrar directamente todos los vuelos con su hora llegada y hora de salida, destino y demas.
// luego voy a mostrar los asientos disponibles a la izquierda y para seleccionar y a la derecha la info del vuelo nuevamente para que la gente no se confunda
// luego el pago, que tiene un lugar para cupones o descuentos 
// luego la confirmacion.
export default function PruebaPage() {
  const searchParams = useSearchParams();
  const numero = searchParams.get("numero");
  const fechaSalida = searchParams.get("fechaSalida");
  const [asientos,setAsientos] = React.useState<any | any>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    async function getAsientos(){
      try{
        const response = await axios.get(`${API_URL}/vuelos/${numero}/${fechaSalida}/asientos`)
        setAsientos(response)
      } catch (error) {
        console.error(error);
      }
    }

    getAsientos()
  },[])

  /*
    jsonify([
            {
                "numero" : asiento.numero,
                "matricula" : asiento.matricula,
                "precio" : asiento.precio,
                "estado" : asiento.estado,
            } for asiento in asientos
        ])

    <CustomIcon sx={{ fontSize: 400 }} color="primary"/>
    <CustomIcon sx={{ fontSize: 400 }} color="disabled"/>
    <CustomIcon sx={{ fontSize: 400 }} color="error"/>
  */

  function obtenerObjetosAsientos(){
    if (asientos.length < 4) return <p>No hay suficientes asientos disponibles.</p>;

    const rowsCol1 = []
    const rowsCol2 = []

    for (let index = 3; index < asientos.length; index+=4) {
      rowsCol1.push(
        <div>
          <CustomIcon sx={{ fontSize: 400 }} color={asientos[index-3].estado==true?"disabled":"primary"} data-numero={asientos[index-3].numero} data-matricula={asientos[index-3].matricula} data-precio={asientos[index-3].precio}/>
          <CustomIcon sx={{ fontSize: 400 }} color={asientos[index-2].estado==true?"disabled":"primary"} data-numero={asientos[index-2].numero} data-matricula={asientos[index-2].matricula} data-precio={asientos[index-2].precio}/>
        </div>
      )
      rowsCol2.push(
        <div>
          <CustomIcon sx={{ fontSize: 400 }} color={asientos[index-1].estado==true?"disabled":"primary"} data-numero={asientos[index-1].numero} data-matricula={asientos[index-1].matricula} data-precio={asientos[index-1].precio}/>
          <CustomIcon sx={{ fontSize: 400 }} color={asientos[index].estado==true?"disabled":"primary"} data-numero={asientos[index].numero} data-matricula={asientos[index].matricula} data-precio={asientos[index].precio}/>
        </div>
      )
    }

    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          {rowsCol1}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          {rowsCol2}
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems:'center', height: '100vh', width:'100%' }}>
        {obtenerObjetosAsientos()}
      </div>
      <div>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2, md: 4 }}
        >
          <p>Item 1</p>
          <p>Item 2</p>
          <p>Item 3</p>
        </Stack>
      </div>
    </>
  );
}