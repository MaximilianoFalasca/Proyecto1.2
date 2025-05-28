// frontend/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      dni: number;
      cuil: number;
      nombre: string;
      apellido: string;
      telefono?: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    dni: number;
    cuil: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    email: string;
  }
}
