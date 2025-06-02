"use client"
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridRowsProp, GridColDef,GridFilterModel, GridToolbar } from '@mui/x-data-grid';

import axios from 'axios';
import { API_URL } from '@/utils/config'

import { useSession } from "next-auth/react";


interface Reserva {
  numero: number,
  numeroVuelo: number,
  fechayhorasalida: Date,
  fecha: Date,
  precio: number,
  dni: number,
}

export default function HomePage() {
  const { data: session } = useSession();
  const [historial, setHistorial] = useState<Reserva[] | any>(null)

  useEffect(() => {
    let isMounted = true;

    async function obtenerReservasDeUsuarioDB(){
      try {
        const respuesta = await axios.get<Reserva[]>(`${API_URL}/reservas/${session?.user?.dni}`)
        
        if (isMounted) {
          setHistorial(respuesta.data); 
        }        
      } catch (error) {
        setHistorial([])
        console.log(error)
      }
    }

    obtenerReservasDeUsuarioDB();

    return () => {
      isMounted = false;
    };
  },[])


interface Reserva {
  numero: number,
  numeroVuelo: number,
  fechayhorasalida: Date,
  fecha: Date,
  precio: number,
  dni: number,
}
  const columns: GridColDef[] = [
    { field: 'numeroVuelo', headerName: 'Numero', flex: 0.3 },
    { field: 'fechaYHoraSalida', headerName: 'Salida', flex: 0.8 },
    { field: 'fechaDeReserva', headerName: 'Llegada', flex: 0.8 },
    { field: 'precio', headerName: 'Matricula', flex: 0.3 },
    { field: 'dni', headerName: 'Origen', flex: 1 },
  ];

  const rows: GridRowsProp = historial ? historial.map((reserva: Reserva, index: number)=>({
    id: index + 1,
    numeroVuelo: reserva.numeroVuelo,
    fechaYHoraSalida: reserva.fechayhorasalida,
    fechaDeReserva: reserva.fecha,
    precio: reserva.precio,
    dni: reserva.dni,
  })) : [];


  return (    
    <>
      <Typography>
        ¡Bienvenido/a, {session?.user?.name || 'Usuario'}!
        <br />
        HISTORIAL DE RESERVAS:
      </Typography>
      <div>
        <DataGrid
          loading={historial === null}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            }
          }}
          columns={columns}
          rows={rows}
        />
      </div>
    </>
  );
}
