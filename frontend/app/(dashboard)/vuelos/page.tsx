"use client"
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridRowsProp, GridColDef, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { API_URL } from '@/utils/config'
import { useRouter, useSearchParams } from 'next/navigation';
import { grey } from '@mui/material/colors';

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

  useEffect(()=>{
    let isMounted = true;
    
    async function obtenerVuelosDB(){
      try {
        const respuesta = await axios.get<Vuelo[]>(`${API_URL}/vuelos`)
        
        if (isMounted) {
          setVuelos(respuesta.data); // solo se llama si sigue montado
        }        
      } catch (error) {
        console.log(error)
      }
    }

    obtenerVuelosDB()

    return () => {
      isMounted = false; // solo se ejecuta si el componente se desmonta
    };
  },[])

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
  }

  const columns: GridColDef[] = [
    { field: 'nro', headerName: 'Numero', flex: 0.3 },
    { field: 'fechaYHoraSalida', headerName: 'Salida', flex: 0.8 },
    { field: 'fechaYHoraLlegada', headerName: 'Llegada', flex: 0.8 },
    { field: 'matricula', headerName: 'Matricula', flex: 0.3 },
    { field: 'origen', headerName: 'Origen', flex: 1 },
    { field: 'destino', headerName: 'Destino', flex: 1 },
  ];

  const rows: GridRowsProp = vuelos ? vuelos.map((vuelo: Vuelo, index: number)=>({
    id: index + 1,
    nro: vuelo.nro,
    fechaYHoraSalida: vuelo.fechaYHoraSalida,
    fechaYHoraLlegada: vuelo.fechaYHoraLlegada,
    matricula: vuelo.matricula,
    origen: `${vuelo.aeropuertoSalida.nombre}, ${vuelo.aeropuertoSalida.ciudad}, ${vuelo.aeropuertoSalida.pais}`,
    destino: `${vuelo.aeropuertoLlegada.nombre}, ${vuelo.aeropuertoLlegada.ciudad}, ${vuelo.aeropuertoLlegada.pais}`,	
  })) : [];

  return (    
    <>
      <Typography style={{marginBottom: '1rem', color: grey[500] }}>
        Para reservar presione doble click sobre el vuelo deseado.
      </Typography>
      <div>
        <DataGrid
          loading={vuelos === null}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            }
          }}
          columns={columns}
          rows={rows}
          initialState={{
            filter: {
              filterModel: obtenerFiltros(),  
            },
          }}
          slots={{
            toolbar: GridToolbar, 
          }}
          onRowDoubleClick={(event)=>{
            router.push(`/reserva?numero=${event.row.nro}&fechaSalida=${event.row.fechaYHoraSalida}`)
          }}
        />
      </div>
    </>
  );
}