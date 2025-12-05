import React from 'react';

export default function StudentBorrow() {
  // Data peminjaman sesuai screenshot
  const studentBorrowList = [
    {
      id: 1,
      bookInitials: 'DW',
      bookTitle: 'Deep Work',
      bookAuthor: 'Cal Newport',
      bookCategory: 'Productivity',
      borrowDate: '12/5/2025',
      dueDate: '26/5/2025',
      daysLeft: '193 hari lewat',
      status: 'Menunggu',
      returnDate: null
    },
    {
      id: 2,
      bookInitials: 'TAoW',
      bookTitle: 'The Art of War',
      bookAuthor: 'Sun Tzu',
      bookCategory: 'Strategy',
      borrowDate: '12/5/2025',
      dueDate: '26/5/2025',
      daysLeft: '193 hari lewat',
      status: 'Menunggu',
      returnDate: null
    },
    {
      id: 3,
      bookInitials: 'AH',
      bookTitle: 'Atomic Habits',
      bookAuthor: 'James Clear',
      bookCategory: 'Self-Help',
      borrowDate: '10/5/2025',
      dueDate: '24/5/2025',
      daysLeft: '195 hari lewat',
      status: 'Dikembalikan',
      returnDate: '17/5/2025'
    }
  ];

  // Status badge sesuai screenshot
  const getStatusBadge = (status) => {
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
    return null;
  };

  // Warna untuk inisial buku
  const getInitialsColor = (initials) => {
    const colors = {
      'DW': 'bg-blue-500',
      'TAoW': 'bg-red-500',
      'AH': 'bg-green-500'
    };
    return colors[initials] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Sederhana */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Peminjaman Saya</h1>
          <p className="text-gray-600 mt-1">Daftar buku yang sedang dan pernah Anda pinjam</p>
        </div>

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
                {studentBorrowList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* NO */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                    </td>

                    {/* JUDUL BUKU */}
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm ${getInitialsColor(item.bookInitials)}`}>
                          {item.bookInitials}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.bookTitle}</div>
                          <div className="text-xs text-gray-500">{item.bookAuthor} - {item.bookCategory}</div>
                        </div>
                      </div>
                    </td>

                    {/* TANGGAL PINJAM */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.borrowDate}</div>
                    </td>

                    {/* BATAS KEMBALI */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.dueDate}</div>
                      <div className="text-xs text-red-600">{item.daysLeft}</div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(item.status)}
                        {item.returnDate && (
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
                          <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100">
                            Perpanjang
                          </button>
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
              Menampilkan semua peminjaman Anda
            </div>
          </div>
        </div>

        {/* Tampilan Mobile */}
        <div className="md:hidden mt-6 space-y-4">
          {studentBorrowList.map((item, index) => (
            <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm ${getInitialsColor(item.bookInitials)} mr-3`}>
                    {item.bookInitials}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.bookTitle}</div>
                    <div className="text-xs text-gray-500">{item.bookAuthor} - {item.bookCategory}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">#{index + 1}</div>
              </div>

              {/* Info Dates */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Tanggal Pinjam</div>
                  <div className="text-sm font-medium">{item.borrowDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Batas Kembali</div>
                  <div className="text-sm font-medium">{item.dueDate}</div>
                  <div className="text-xs text-red-600">{item.daysLeft}</div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  {getStatusBadge(item.status)}
                  {item.returnDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Dikembalikan: {item.returnDate}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {item.status === 'Menunggu' && (
                    <button className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      Perpanjang
                    </button>
                  )}
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded">
                    Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Footer Mobile */}
          <div className="text-center text-sm text-gray-500 py-4">
            Menampilkan semua peminjaman Anda
          </div>
        </div>
      </div>
    </div>
  );
}