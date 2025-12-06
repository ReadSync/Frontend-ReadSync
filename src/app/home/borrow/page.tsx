"use client";
import React, { useState, useEffect } from 'react';
import { useUserBorrows, useBorrowActions } from '../../hooks/useBooks';
import { useSession } from 'next-auth/react';

export default function StudentBorrow() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  const { borrows, loading, error, refetch } = useUserBorrows(userId || undefined);
  const { returnBorrow, loading: returnLoading } = useBorrowActions();
  const [refreshing, setRefreshing] = useState(false);
  const [returningId, setReturningId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      refetch();
    }
  }, [userId, status, refetch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleReturn = async (borrowId: number) => {
    if (!confirm('Are you sure you want to return this book?')) {
      return;
    }

    try {
      setReturningId(borrowId);
      await returnBorrow(borrowId);
      alert('Book returned successfully!');
      await refetch(); // Refresh data after return
    } catch (err: any) {
      alert(`Failed to return book: ${err.message}`);
    } finally {
      setReturningId(null);
    }
  };

  // Filter out returned books from the list
  const activeBorrows = borrows.filter(borrow => borrow.status !== 'Returned');

  // Status badge
  const getStatusBadge = (status: any) => {
    if (status === 'Pending') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    if (status === 'Returned') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Returned
        </span>
      );
    }
    if (status === 'Borrowed') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Borrowed
        </span>
      );
    }
    if (status === 'Overdue') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Rejected
        </span>
      );
    }
    return null;
  };

  const getInitialsColor = (initials: string) => {
    const colors: Record<string, string> = {
      'DW': 'bg-blue-500',
      'TAOW': 'bg-red-500',
      'AH': 'bg-green-500',
      'TPM': 'bg-purple-500',
      'TAGR': 'bg-indigo-500',
    };

    if (colors[initials]) return colors[initials];

    const colorClasses = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500',
      'bg-purple-500', 'bg-indigo-500', 'bg-pink-500'
    ];
    const index = initials.charCodeAt(0) % colorClasses.length;
    return colorClasses[index];
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your borrow list</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Login
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
          <p className="mt-4 text-gray-600">Loading borrow data...</p>
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
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Borrows</h1>
              <p className="text-gray-600 mt-1">List of books you are currently borrowing and have borrowed</p>
            </div>
          </div>
        </div>

        {refreshing && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm">Updating data...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BOOK TITLE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BORROW DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DUE DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeBorrows.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                    </td>

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

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.borrowDate || '-'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.dueDate || '-'}</div>
                      {item.daysLeft && (
                        <div className="text-xs text-red-600">{item.daysLeft}</div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(item.status)}
                        {item.returnDate && item.status === 'Returned' && (
                          <div className="text-xs text-gray-500">
                            Returned: {item.returnDate}
                          </div>
                        )}
                        {item.fine > 0 && (
                          <div className="text-xs text-red-600 font-semibold">
                            Fine: Rp {item.fine.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {item.status === 'Pending' && (
                          <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100">
                            Extend
                          </button>
                        )}
                        {item.status === 'Borrowed' && (
                          <button
                            onClick={() => handleReturn(item.id)}
                            disabled={returningId === item.id || returnLoading}
                            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {returningId === item.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                                Returning...
                              </>
                            ) : (
                              'Return'
                            )}
                          </button>
                        )}
                        {item.status === 'Rejected' && (
                          <span className="text-xs text-gray-500 italic">Borrow rejected</span>
                        )}
                        {item.bookId && (
                          <a
                            href={`/home/book/${item.bookId}`}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                          >
                            Detail
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {activeBorrows.length === 0 ? (
                'No active borrows'
              ) : (
                `Showing ${activeBorrows.length} active borrow${activeBorrows.length > 1 ? 's' : ''}`
              )}
            </div>
          </div>
        </div>

        {activeBorrows.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No borrows yet</h3>
            <p className="text-gray-500 mb-4">Find interesting books and submit your first borrow request!</p>
            <button
              onClick={() => window.location.href = '/home/books'}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Explore Books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
