/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/axios.ts
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Router from 'next/router'; // Atau import { useRouter } from 'next/navigation' jika di dalam komponen React
import { redirect } from 'next/navigation'; // Untuk redirect di luar komponen React
// import Cookies from 'js-cookie'; // Untuk menghapus cookie jika diperlukan di frontend (meskipun HttpOnly, bisa jadi ada non-HttpOnly cookie lain)

// Buat instance Axios kustom
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', // Sesuaikan dengan URL backend Anda
  withCredentials: true, // PENTING: Untuk mengirim dan menerima cookie (termasuk HttpOnly)
});

// Flag untuk mencegah loop tak terbatas saat refresh token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor untuk MENAMBAHKAN Access Token ke setiap permintaan
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk MENANGANI respons (terutama 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response, // Jika respons sukses, teruskan saja
  async (error) => {
    const originalRequest = error.config;

    // Jika error adalah 401 Unauthorized DAN itu bukan permintaan refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Jika sudah ada proses refresh, tambahkan permintaan asli ke antrian
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true; // Tandai permintaan ini sebagai sudah dicoba lagi
      isRefreshing = true; // Set flag bahwa proses refresh sedang berlangsung

      try {
        // Panggil endpoint refresh token di backend
        // Browser akan otomatis mengirim HttpOnly refresh token dari cookie
        const res = await axiosInstance.post('/auth/refresh'); // Endpoint refresh token Anda
        const newAccessToken = res.data.accessToken; // Dapatkan access token baru dari respons

        localStorage.setItem('authToken', newAccessToken); // Simpan access token baru
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`; // Update header default

        processQueue(null, newAccessToken); // Proses antrian permintaan yang tertunda
        return axiosInstance(originalRequest); // Ulangi permintaan asli yang gagal dengan token baru
      } catch (refreshError: any) {
        processQueue(refreshError, null); // Beri tahu semua permintaan yang tertunda bahwa refresh gagal
        console.error('Failed to refresh token:', refreshError);

        // Jika refresh gagal, redirect pengguna ke halaman login
        localStorage.removeItem('authToken'); // Hapus token lama
        localStorage.removeItem('userEmail');
        // Hapus cookie refresh_token di sisi klien (jika ada non-HttpOnly yang ingin dihapus)
        // Cookies.remove('refresh_token'); // Refresh token Anda HttpOnly, jadi ini mungkin tidak perlu
        
        // Redirect ke halaman login. Gunakan window.location.href atau useRouter().push('/login')
        // Tergantung di mana kode ini dipanggil (di client-side atau di server-side)
        if (typeof window !== 'undefined') {
          // Hanya di sisi klien
          // Jika Anda menggunakan useRouter di dalam komponen React
          // const router = useRouter(); router.push('/login');
          window.location.href = '/'; // Redirect ke halaman utama (login)
        } else {
          // Jika ini dieksekusi di server (misalnya saat SSR), gunakan redirect dari next/navigation
          redirect('/');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Reset flag refresh
      }
    }
    return Promise.reject(error); // Teruskan error lainnya
  }
);

export default axiosInstance; // Ekspor instance axios kustom