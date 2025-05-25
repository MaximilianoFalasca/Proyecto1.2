import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
/*
import Github from 'next-auth/providers/github';
import Linkedin from 'next-auth/providers/linkedin';
import Discord from 'next-auth/providers/discord';
*/
import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { API_URL } from '@/utils/config';
import axios from 'axios';

//modificar
interface Usuario {
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

//por ahora solo consultamos por pasajeros pero ams adelante tengo que habilitar para la tripulacion
async function verificarUsuario(email: String, password: String){
  try {
    const respuesta = await axios.get<Usuario[]>(`${API_URL}/pasajeros/${email}/${password}`);
    
    return respuesta; 
  } catch (error) {
    console.log(error)
    return false;
  }
}

const providers: Provider[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      // Aca validás con tu DB
      const user = await verificarUsuario(credentials.email, credentials.password);
      if (!user) return null;
      return user;
    },
  }),
  /*
  Github({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),

  Linkedin({
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  }),

  Discord({
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  }),
  */
];

if(!process.env.GOOGLE_CLIENT_ID) { 
  console.warn('Missing environment variable "GOOGLE_CLIENT_ID"');
}
if(!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Missing environment variable "GOOGLE_CLIENT_SECRET"');
}
/*
if(!process.env.GITHUB_CLIENT_ID) { 
  console.warn('Missing environment variable "GITHUB_CLIENT_ID"');
}
if(!process.env.GITHUB_CLIENT_SECRET) {
  console.warn('Missing environment variable "GITHUB_CLIENT_SECRET"');
}
if(!process.env.LINKEDIN_CLIENT_ID) { 
  console.warn('Missing environment variable "LINKEDIN_CLIENT_ID"');
}
if(!process.env.LINKEDIN_CLIENT_SECRET) {
  console.warn('Missing environment variable "LINKEDIN_CLIENT_SECRET"');
}
if(!process.env.DISCORD_CLIENT_ID) { 
  console.warn('Missing environment variable "DISCORD_CLIENT_ID"');
}
if(!process.env.DISCORD_CLIENT_SECRET) {
  console.warn('Missing environment variable "DISCORD_CLIENT_SECRET"');
}
*/

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
      return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      
      const isLoggedIn = !!session?.user;
      const path = nextUrl.pathname;
      const isPublicPage = path === '/' || path === '/vuelos' || path.startsWith('/public');

      if (isPublicPage || isLoggedIn) {
        return true;
      }

      return false; // Redirect unauthenticated users to login page
      },
  },
});
  