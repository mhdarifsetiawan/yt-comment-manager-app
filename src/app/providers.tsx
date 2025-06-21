// src/app/providers.tsx
'use client'; // WAJIB: Ini menandakan bahwa komponen ini adalah Client Component

import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in .env.local');
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
             Konfigurasi Aplikasi Belum Lengkap: Google Client ID tidak ditemukan.
           </div>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}