"use client"
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DataGrid, GridRowsProp, GridColDef,GridFilterModel, GridToolbar } from '@mui/x-data-grid';
import type { Session as AuthSession } from "@auth/core/types";

type Session = AuthSession & {
  user?: {
    name?: string | null; 
    role?: string;
  };
};

export default function HomePage() {
  const [user, setUser] = useState<Session | null>(null)
  
  useEffect(() => {
    async function fetchUser() {
        try {
            const response = await fetch('/api/session'); 
            if (response.ok) {
              const session = await response.json();
              setUser(session);
            } else {
              console.error("Failed to fetch session:", response.statusText);
              setUser(null);
            }
          } catch (error) {
            console.error("Error fetching session:", error);
            setUser(null);
          }
    }
    fetchUser();
  },[])

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'age', headerName: 'Age', type: 'number', width: 100 },
  ];

  const rows: GridRowsProp = [
    { id: 1, username: '@MUI', age: 20 },
    { id: 2, username: '@MUI2', age: 30 },
  ];


  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [
      {
        field: 'age',
        operator: '>',
        value: '25',
      },
    ],
  });

  return (    
    <>
      <Typography>
        Welcome to Toolpad, {user?.user?.name || 'User'}!
      </Typography>
      <div>
        <DataGrid
          columns={columns}
          rows={rows}
          slots={{
            toolbar: GridToolbar,
          }}
          initialState={{
            filter: {
              filterModel: {
                items: [{ field: 'age', operator: '<', value: '25' }],
              },
            },
          }}
          filterModel={filterModel}
          onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
        />
      </div>
    </>
  );
}
