import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import Linkedin from 'next-auth/providers/linkedin';
import Discord from 'next-auth/providers/discord';
import type { Provider } from 'next-auth/providers';


const providers: Provider[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),

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
];

if(!process.env.GOOGLE_CLIENT_ID) { 
  console.warn('Missing environment variable "GOOGLE_CLIENT_ID"');
}
if(!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Missing environment variable "GOOGLE_CLIENT_SECRET"');
}
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
      const isPublicPage = nextUrl.pathname.startsWith('/public');

      if (isPublicPage || isLoggedIn) {
        return true;
      }

      // hay que cambiar esto a false
      return true; // Redirect unauthenticated users to login page
      },
  },
});
  