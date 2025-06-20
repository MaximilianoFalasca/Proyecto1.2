// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      dni: number;
      cuil: number;
      telefono?: string;
    };
  }

  interface User {
    dni: number;
    cuil: number;
    telefono?: string;
    email: string;
    nombre: string;
    apellido: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dni: number;
    cuil: number;
    telefono?: string;
  }
}
