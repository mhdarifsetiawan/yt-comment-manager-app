/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../lib/axios'; // <<< Pastikan path ini benar!

// Definisikan interface yang lebih lengkap sesuai respons dari /user/profile
interface UserProfileData {
  id: number;
  email: string;
  name?: string;
  googleSub?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfileData | null>(null); // Menggunakan UserProfileData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fungsi untuk mengambil profil pengguna dari backend ---
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null); // Reset error setiap kali fetch
    try {
      // Panggil endpoint backend yang terproteksi
      const response = await axiosInstance.get('/user/profile');
      setUserData(response.data); // Set data user dari respons backend
      console.log('User Profile Data:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err.response?.data || err.message);
      setError('Gagal mengambil profil pengguna: ' + (err.response?.data?.message || err.message));
      // Jika terjadi error 401 atau lainnya yang menandakan sesi tidak valid, redirect ke login
      if (err.response?.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPicture');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Fungsi untuk logout ---
  const handleLogout = async () => {
    try {
      // Panggil endpoint logout di backend
      await axiosInstance.post('/auth/logout'); // Ini akan menghapus refresh_token di cookie backend
      
      // Hapus semua data otentikasi dari localStorage frontend
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPicture');
      
      console.log('User logged out successfully.');
      alert('Anda telah berhasil logout.');
      router.push('/'); // Redirect kembali ke halaman utama/login
    } catch (err: any) {
      console.error('Failed to logout:', err.response?.data || err.message);
      alert('Gagal logout: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    // Jalankan fetchUserProfile saat komponen dimuat
    // Ini akan memuat data user langsung dari backend setelah login berhasil
    fetchUserProfile(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] agar hanya berjalan sekali saat mount

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#f0f2f5',
        color: '#333'
      }}>
        <h1>Memuat Profil...</h1>
        <p>Mengambil data pengguna dari server.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#f0f2f5',
        color: 'red'
      }}>
        <h2>Error: {error}</h2>
        <p>Silakan coba lagi atau <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>logout</button>.</p>
      </div>
    );
  }

  // Tampilkan dashboard jika data pengguna berhasil dimuat
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#f0f2f5',
      padding: '20px'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>Selamat Datang, {userData?.name || userData?.email}!</h1>
      {userData?.picture && (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={userData.picture} 
          alt="Profil Pengguna" 
          style={{ 
            borderRadius: '50%', 
            width: '120px', 
            height: '120px', 
            objectFit: 'cover', 
            marginBottom: '20px',
            border: '3px solid #007bff'
          }} 
        />
      )}
      <p style={{ color: '#666', marginBottom: '10px' }}>Email Anda: {userData?.email}</p>
      <p style={{ color: '#666', marginBottom: '30px' }}>ID Pengguna: {userData?.id}</p>

      ---

      <h2 style={{ marginTop: '30px', color: '#333' }}>Uji Coba Otentikasi</h2>
      <button 
        onClick={fetchUserProfile} // Memanggil fungsi untuk mengambil profil
        style={{
          padding: '12px 25px',
          fontSize: '18px',
          cursor: 'pointer',
          backgroundColor: '#007bff', // Warna biru untuk tombol
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease',
          marginBottom: '20px' // Tambahkan margin bawah
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        Ambil Profil Terbaru (Terproteksi)
      </button>
      <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
        Klik tombol di atas untuk memastikan Anda bisa mengakses endpoint terproteksi. Ini juga akan memicu refresh token jika access token kedaluwarsa.
      </p>

      ---

      <h2 style={{ marginTop: '30px', color: '#333' }}>Manajemen Sesi</h2>
      <button
        onClick={handleLogout}
        style={{
          padding: '12px 25px',
          fontSize: '18px',
          cursor: 'pointer',
          backgroundColor: '#dc3545', // Warna merah untuk tombol logout
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
      >
        Logout
      </button>
    </div>
  );
}