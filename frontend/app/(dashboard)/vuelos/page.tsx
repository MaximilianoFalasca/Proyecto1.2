"use client"
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridRowsProp, GridColDef, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { API_URL } from '@/utils/config'
import { useRouter, useSearchParams } from 'next/navigation';
import { grey } from '@mui/material/colors';
import { Grid2 } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

interface Vuelo {
  nro: string;
  fechaYHoraSalida: string;
  fechaYHoraLlegada: string;
  matricula: string;
  aeropuertoSalida: {
    ciudad: string;
    nombre: string;
    pais: string;
  };
  aeropuertoLlegada: {
    ciudad: string;
    nombre: string;
    pais: string;
  };
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vuelos, setVuelos] = useState<Vuelo[] | any>(null)
  const [loading, setLoading] = useState<boolean | null>(true)

  useEffect(()=>{
    let isMounted = true;
    
    async function obtenerVuelosDB(){
      try {
        const respuesta = await axios.get<Vuelo[]>(`${API_URL}/vuelos`)
        
        if (isMounted) {
          setVuelos(respuesta.data); // solo se llama si sigue montado
          setLoading(false); 
        }        
      } catch (error) {
        console.log(error)
      }
    }

    obtenerVuelosDB()
    console.log(vuelos)
    return () => {
      isMounted = false; // solo se ejecuta si el componente se desmonta
    };
  },[])
/*
  function obtenerFiltros(){
    let filtros = []
    if (searchParams.get('origen') && searchParams.get('origen') !== '') {
      filtros.push({ field: 'origen', operator: 'contains', value: searchParams.get('origen') })
    }
    if (searchParams.get('destino') && searchParams.get('destino') !== '') {
      filtros.push({ field: 'destino', operator: 'contains', value: searchParams.get('destino') })
    }
    if (searchParams.get('fechaIda') && searchParams.get('fechaIda') !== '') {
      filtros.push({ field: 'fechaYHoraSalida', operator: 'contains', value: searchParams.get('fechaIda') })
    }
    if (searchParams.get('fechaRegreso') && searchParams.get('fechaRegreso') !== '') {
      filtros.push({ field: 'fechaYHoraLlegada', operator: 'equals', value: searchParams.get('fechaRegreso') })
    }
    return {items: filtros}
  }*/
 
  return (    
    <>
      <Typography style={{marginBottom: '1rem', color: grey[500] }}>
        Para reservar presione doble click sobre el vuelo deseado.
      </Typography>
        
      <Grid2 container spacing={2}>
        {loading ? (
          <>
            <Grid2 size={{ xs: 12, sm: 6 }} component="div">
              <Skeleton variant="rectangular"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }} component="div">
              <Skeleton variant="rectangular"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }} component="div">
              <Skeleton variant="rectangular"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }} component="div">
              <Skeleton variant="rectangular"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
              <Skeleton variant="text"/>
            </Grid2>
          </>
        ) : (
          vuelos &&
          vuelos.length !== 0 &&
          vuelos.map((vuelo: Vuelo, index: number) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6 }} component="div"  onDoubleClick={() => {
                router.push(`/reserva?numero=${vuelo.nro}&fechaSalida=${vuelo.fechaYHoraSalida}`)
              }
            }>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <Typography variant="h6">Vuelo {vuelo.nro}</Typography>
                <Typography variant="body1">Salida: {vuelo.fechaYHoraSalida}</Typography>
                <Typography variant="body1">Llegada: {vuelo.fechaYHoraLlegada}</Typography>
                <Typography variant="body1">Matricula: {vuelo.matricula}</Typography>
                <Typography variant="body1">
                  Origen: {`${vuelo.aeropuertoSalida.nombre}, ${vuelo.aeropuertoSalida.ciudad}, ${vuelo.aeropuertoSalida.pais}`}
                </Typography>
                <Typography variant="body1">
                  Destino: {`${vuelo.aeropuertoLlegada.nombre}, ${vuelo.aeropuertoLlegada.ciudad}, ${vuelo.aeropuertoLlegada.pais}`}
                </Typography>
              </div>
            </Grid2>
          ))
        )}

      </Grid2>
    </>
  );
}