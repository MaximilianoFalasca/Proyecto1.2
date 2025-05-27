import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';

import type { Navigation } from '@toolpad/core/AppProvider';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import { auth } from '../auth';
import theme from '../theme';

import Image from 'next/image';
import icono from '../public/imagenes/AR_horiz.svg';

const NAVIGATION_BASE = [
  {
    kind: 'header' as const,
    title: 'Main items',
  },
  {
    kind: 'page' as const,
    segment: '',
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    kind: 'page' as const,
    segment: 'vuelos',
    title: 'Vuelos',
    icon: <AirplanemodeActiveIcon />,
  },
];

const BRANDING = {
  logo: <Image src="/imagenes/AR_horiz.svg" alt="Aerolineas Argentinas" width={200} height={200} />,
  title: '',
};


const AUTHENTICATION = {
  signIn,
  signOut,
};


export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await auth();

  const NAVIGATION: Navigation = [
    ...NAVIGATION_BASE,
    ...(session
      ? [
          {
            kind: 'page' as const,
            segment: 'historial',
            title: 'Reservas',
            icon: <DashboardIcon />,
          },
        ]
      : []),
  ];

  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          
            <NextAppProvider
              navigation={NAVIGATION}
              branding={BRANDING}
              session={session}
              authentication={AUTHENTICATION}
              theme={theme}
            >
              {props.children}
            </NextAppProvider>
            
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
