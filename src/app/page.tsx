// src/app/page.tsx
'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import axiosInstance from '../lib/axios'; // <<< IMPORT INSTANCE AXIOS KUSTOM KITA

export default function HomePage() {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Login Google Berhasil:', tokenResponse);
      alert('Login berhasil! Mengirim token ke backend...');

      try {
        // Gunakan axiosInstance kita
        const res = await axiosInstance.post('/auth/google', {
          accessToken: tokenResponse.access_token,
        });

        console.log('Backend response:', res.data);
        alert('Token berhasil diverifikasi oleh backend! User: ' + res.data.user.name);

        // Response dari backend sekarang berisi user dan accessToken
        // Refresh token diatur sebagai HttpOnly cookie secara otomatis oleh backend
        if (res.data.accessToken && res.data.user) {
          localStorage.setItem('authToken', res.data.accessToken);
          localStorage.setItem('userEmail', res.data.user.email);
          localStorage.setItem('userName', res.data.user.name);
          localStorage.setItem('userPicture', res.data.user.picture); // Simpan juga gambar jika diperlukan
          console.log('Auth Token dan User data berhasil disimpan di localStorage.');

          router.push('/dashboard'); // Arahkan ke dashboard
        } else {
          console.warn('Backend response does not contain accessToken or user data.');
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error sending token to backend:', err.response?.data || err.message);
        alert(
          'Gagal memverifikasi token di backend. Cek konsol backend. Error: ' +
            (err.response?.data?.message || err.message)
        );
      }
    },
    onError: (errorResponse) => {
      console.error('Login Google Gagal:', errorResponse);
      alert('Login gagal. Silakan coba lagi.');
    },
    scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#f0f2f5',
      }}
    >
      <h1 style={{ color: '#333' }}>Selamat Datang di YT Comment Manager</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Silakan login dengan akun Google Anda untuk melanjutkan.
      </p>
      <button
        onClick={() => login()}
        style={{
          padding: '12px 25px',
          fontSize: '18px',
          cursor: 'pointer',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#357ae8')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4285F4')}
      >
        Login dengan Google
      </button>
    </div>
  );
}