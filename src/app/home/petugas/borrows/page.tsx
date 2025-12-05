"use client";
import React, { useState } from 'react';
import { useAllBorrows } from '../../../hooks/useBooks';
import { useBorrowActions } from '../../../hooks/useBooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PetugasBorrows() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const userRole = session?.user?.role || '';
  const isAuthorized = userRole === 'petugas' || userRole === 'admin';

  const { borrows, loading, error, refetch } = useAllBorrows(selectedStatus);
  const { approveBorrow, rejectBorrow, loading: actionHookLoading, error: actionError } = useBorrowActions();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = async (borrowId: number) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui peminjaman ini?')) {
      return;
    }

    try {
      setActionLoading(borrowId);
      await approveBorrow(borrowId);
      await refetch();
      alert('Peminjaman berhasil disetujui');
    } catch (err: any) {
      alert(`Gagal menyetujui: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (borrowId: number) => {
    if (!confirm('Apakah Anda yakin ingin menolak peminjaman ini?')) {
      return;
    }

    try {
      setActionLoading(borrowId);
      await rejectBorrow(borrowId);
      await refetch(); // Refresh data setelah reject
      alert('Peminjaman berhasil ditolak');
    } catch (err: any) {
      alert(`Gagal menolak: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Status badge sesuai screenshot
  const getStatusBadge = (status: string) => {
    if (status === 'Menunggu') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Menunggu
        </span>
      );
    }
    if (status === 'Dikembalikan') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Dikembalikan
        </span>
      );
    }
    if (status === 'Dipinjam') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Dipinjam
        </span>
      );
    }
    if (status === 'Terlambat') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Terlambat
        </span>
      );
    }
    if (status === 'Ditolak') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Ditolak
        </span>
      );
    }
    return null;
  };

  // Warna untuk inisial buku
  const getInitialsColor = (initials: string) => {
    const colors: Record<string, string> = {
      'DW': 'bg-blue-500',
      'TAOW': 'bg-red-500',
      'AH': 'bg-green-500',
      'TPM': 'bg-purple-500',
      'TAGR': 'bg-indigo-500',
    };

    if (colors[initials]) return colors[initials];

    // Random color fallback
    const colorClasses = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500',
      'bg-purple-500', 'bg-indigo-500', 'bg-pink-500'
    ];
    const index = initials.charCodeAt(0) % colorClasses.length;
    return colorClasses[index];
  };

  // Redirect jika tidak authorized
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push('/login');
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Akses ditolak. Halaman ini hanya untuk petugas/admin.</p>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data peminjaman...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">Error: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kelola Peminjaman</h1>
              <p className="text-gray-600 mt-1">Daftar peminjaman yang perlu ditinjau dan dikelola</p>
              {session?.user && (
                <p className="text-xs text-gray-500 mt-1">Role: {session.user.role}</p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Memuat...
                </>
              ) : (
                '🔄 Refresh'
              )}
            </button>
          </div>
        </div>

        {/* Filter Status */}
        <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
            >
              Menunggu ({borrows.filter(b => b.status === 'Menunggu').length})
            </button>
            <button
              onClick={() => setSelectedStatus('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === 'approved'
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
            >
              Dipinjam
            </button>
            <button
              onClick={() => setSelectedStatus('returned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === 'returned'
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
            >
              Dikembalikan
            </button>
            <button
              onClick={() => setSelectedStatus('canceled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === 'canceled'
                  ? 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
            >
              Ditolak
            </button>
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === ''
                  ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Loading Refresh */}
        {refreshing && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm">Memperbarui data...</p>
          </div>
        )}

        {/* Error dari action */}
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">Error: {actionError}</p>
          </div>
        )}

        {/* Tabel Peminjaman - Desktop */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PEMINJAM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    JUDUL BUKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TANGGAL PINJAM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BATAS KEMBALI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrows.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* NO */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                    </td>

                    {/* PEMINJAM */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.userName || 'Unknown User'}
                      </div>
                      {item.userNisn && (
                        <div className="text-xs text-gray-500">NISN: {item.userNisn}</div>
                      )}
                    </td>

                    {/* JUDUL BUKU */}
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className={`shrink-0 h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm ${getInitialsColor(item.bookInitials)}`}>
                          {item.bookInitials}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.bookTitle}</div>
                          {item.bookAuthor && (
                            <div className="text-xs text-gray-500">
                              {item.bookAuthor} {item.bookCategory ? `- ${item.bookCategory}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* TANGGAL PINJAM */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.borrowDate || '-'}</div>
                    </td>

                    {/* BATAS KEMBALI */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.dueDate || '-'}</div>
                      {item.daysLeft && (
                        <div className="text-xs text-red-600">{item.daysLeft}</div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(item.status)}
                        {item.returnDate && item.status === 'Dikembalikan' && (
                          <div className="text-xs text-gray-500">
                            Dikembalikan: {item.returnDate}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* AKSI */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {item.status === 'Menunggu' && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={actionLoading === item.id || actionHookLoading}
                              className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {actionLoading === item.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                                  Memproses...
                                </>
                              ) : (
                                '✓ Setujui'
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading === item.id || actionHookLoading}
                              className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {actionLoading === item.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                                  Memproses...
                                </>
                              ) : (
                                '✗ Tolak'
                              )}
                            </button>
                          </>
                        )}
                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50">
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {borrows.length === 0 ? (
                `Tidak ada data peminjaman dengan status "${selectedStatus === 'pending' ? 'Menunggu' : selectedStatus === 'approved' ? 'Dipinjam' : selectedStatus === 'returned' ? 'Dikembalikan' : selectedStatus === 'canceled' ? 'Ditolak' : 'Semua'}"`
              ) : (
                `Menampilkan ${borrows.length} peminjaman`
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {borrows.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada peminjaman</h3>
            <p className="text-gray-500">Tidak ada data peminjaman yang sesuai dengan filter yang dipilih.</p>
          </div>
        )}
      </div>
    </div>
  );
}

