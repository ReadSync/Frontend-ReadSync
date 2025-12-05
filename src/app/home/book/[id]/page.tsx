"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBorrow } from '../../../lib/action';
import { useBookDetail } from '../../../hooks/useBooks';
import { useSession } from 'next-auth/react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const bookId = params.id as string;

  const { book, loading: bookLoading, error: bookError, refetch } = useBookDetail(bookId);

  const [borrowing, setBorrowing] = useState(false);
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBorrow = async () => {
    try {
      if (status === "unauthenticated" || !session) {
        const confirmLogin = confirm(
          'Anda perlu login terlebih dahulu untuk meminjam buku. \n\nApakah Anda ingin login sekarang?'
        );

        if (confirmLogin) {
          router.push('/login');
        }
        return;
      }

      setBorrowing(true);
      setBorrowError(null);

      console.log('🖱️ Mengajukan peminjaman untuk book_id:', bookId);
      console.log('👤 User yang login:', session.user);

      const bookIdNumber = parseInt(bookId);

      if (isNaN(bookIdNumber)) {
        setBorrowError('Book ID tidak valid');
        setBorrowing(false);
        return;
      }

      const result = await createBorrow(bookIdNumber);

      if (result.success) {
        console.log('✅ Peminjaman berhasil diajukan:', result.message);
        setSuccess(true);

        setTimeout(() => {
          router.push('/home/borrow');
        }, 2000);
      } else {
        setBorrowError(result.error);
      }
    } catch (err: any) {
      console.error('❌ Gagal mengajukan peminjaman:', err);
      setBorrowError(err.message);
    } finally {
      setBorrowing(false);
    }
  };

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Memuat detail buku...</p>
          <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Buku Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{bookError || 'Buku yang Anda cari tidak tersedia'}</p>
          <button
            onClick={() => router.push('/home')}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const isLoggedIn = status === "authenticated" && session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform animate-scaleIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white animate-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Pengajuan Berhasil!</h3>
              <p className="text-gray-600 mb-2 text-lg">Permintaan peminjaman</p>
              <p className="text-green-600 font-semibold mb-3">"{book.title}"</p>
              <p className="text-gray-500 mb-4">telah diajukan</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-gray-600">Status: <span className="font-semibold text-yellow-600">Menunggu persetujuan admin</span></p>
              </div>
              <p className="text-sm text-gray-500">Mengarahkan ke halaman peminjaman...</p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-8 border-3 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center px-4 py-2 mb-6 text-green-700 font-medium rounded-xl hover:bg-white/80 transition-all shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        {/* Login Alert */}
        {!isLoggedIn && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-md animate-slideDown">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-yellow-800 font-medium mb-2">Anda belum login</p>
                <p className="text-yellow-700 text-sm mb-3">Silakan login untuk mengajukan peminjaman buku</p>
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                >
                  Login Sekarang
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {borrowError && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 p-5 rounded-xl shadow-md animate-slideDown">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{borrowError}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover Section */}
            <div className="w-full lg:w-2/5 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5"></div>
              <div className="relative z-10">
                <div className="w-64 h-80 bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-gray-300 text-7xl">📚</span>
                      <p className="text-gray-400 text-sm mt-4 font-medium">No Cover</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Book Details Section */}
            <div className="w-full lg:w-3/5 p-8 lg:p-10">
              {/* Header */}
              <div className="mb-8">
                <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-md">
                  {book.category_name}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {book.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{book.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {book.publisher}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {book.publication_year}
                  </div>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Deskripsi
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Book Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informasi Buku
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">Kode Buku</span>
                      <span className="font-bold text-gray-800 font-mono text-sm bg-gray-100 px-3 py-1 rounded-md">
                        {book.book_code}
                      </span>
                    </li>
                    <li className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">ISBN</span>
                      <span className="font-semibold text-gray-800">
                        {book.isbn || book.isbnr || '-'}
                      </span>
                    </li>
                    <li className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">Total Eksemplar</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {book.total_quantity}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Availability */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ketersediaan
                  </h3>
                  <div className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold mb-4 shadow-md ${
                    book.available_quantity > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                  }`}>
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      book.available_quantity > 0 ? 'bg-white animate-pulse' : 'bg-white'
                    }`}></span>
                    {book.available_quantity > 0 ? 'Tersedia untuk Dipinjam' : 'Tidak Tersedia'}
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl">
                    <p className="text-gray-700 text-lg">
                      <span className="font-bold text-4xl text-green-600">{book.available_quantity}</span>
                      <span className="text-gray-500 mx-2">/</span>
                      <span className="font-medium text-xl text-gray-600">{book.total_quantity}</span>
                    </p>
                    <p className="text-gray-600 text-sm mt-1">eksemplar tersedia</p>
                  </div>
                </div>
              </div>

              {/* Borrow Action Section */}
              <div className="pt-6 border-t-2 border-gray-100">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-gray-700 font-bold text-lg mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Status Ketersediaan
                      </p>
                      <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                        book.available_quantity > 0
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-2 ${
                          book.available_quantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></span>
                        {book.available_quantity > 0 ? 'Tersedia' : 'Tidak Tersedia'}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Stok: <span className="font-bold ml-1">{book.available_quantity}</span> eksemplar
                      </p>
                    </div>

                    <button
                      onClick={handleBorrow}
                      disabled={borrowing || book.available_quantity <= 0}
                      className={`group px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center ${
                        book.available_quantity > 0
                          ? isLoggedIn
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                            : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } ${borrowing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {borrowing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mengajukan...
                        </>
                      ) : (
                        <>
                          {book.available_quantity > 0 ? (
                            isLoggedIn ? (
                              <>
                                <svg className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Ajukan Peminjaman
                              </>
                            ) : (
                              <>
                                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Login untuk Meminjam
                              </>
                            )
                          ) : (
                            <>
                              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Tidak Tersedia
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Catatan Penting:</p>
                        <p className="text-sm text-gray-600">
                          {isLoggedIn
                            ? 'Peminjaman akan berstatus "Menunggu" hingga disetujui oleh admin. Anda akan menerima notifikasi setelah pengajuan diproses.'
                            : 'Anda perlu login terlebih dahulu untuk mengajukan peminjaman buku dari perpustakaan.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}