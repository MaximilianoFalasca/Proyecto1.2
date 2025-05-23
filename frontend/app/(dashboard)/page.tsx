"use client";

import React, { useState } from "react";
import { useSession } from 'next-auth/react';
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [focusedRegreso, setFocusedRegreso] = useState(false);
  const [focusedIda, setFocusedIda] = useState(false);
  const router = useRouter();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    const formData = new FormData(event.currentTarget);
    const origen = formData.get("origen") as string;
    const destino = formData.get("destino") as string;
    const fechaIda = formData.get("fechaIda") as string;
    const fechaRegreso = formData.get("fechaRegreso") as string;

    console.log("Origen:", origen);
    console.log("Destino:", destino);
    console.log("Fecha Ida:", fechaIda);
    console.log("Fecha Regreso:", fechaRegreso);

    router.push(`/vuelos?origen=${origen}&destino=${destino}&fechaIda=${fechaIda}&fechaRegreso=${fechaRegreso}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", justifyContent: "center", alignItems: "center" }}>
      <Typography variant="h4">Buscar Vuelos</Typography>
      
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ 
          display: "flex", 
          flexDirection: "column",  
          gap: 2, 
          width: "100%", 
          justifyContent: "center", 
          alignItems: "center" 
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, width: "100%", justifyContent: "center", alignItems: "center" }}>
          <TextField name="origen" variant="outlined" label="Origen" sx={{ flex: 1 }} />
          <TextField name="destino" variant="outlined" label="Destino" sx={{ flex: 1 }} />
          <TextField
            name="fechaIda"
            type={focusedIda ? "date" : "text"}
            variant="outlined"
            onFocus={() => setFocusedIda(true)}
            onBlur={() => setFocusedIda(false)}
            label="Fecha de ida"
            sx={{ flex: 1 }}
          />
          <TextField
            name="fechaRegreso"
            type={focusedRegreso ? "date" : "text"}
            variant="outlined"
            onFocus={() => setFocusedRegreso(true)}
            onBlur={() => setFocusedRegreso(false)}
            label="Fecha de regreso"
            sx={{ flex: 1 }}
          />
        </Box>

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Buscar Vuelos
        </Button>
      </Box>
    </Box>
  );
}

