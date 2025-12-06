"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavorites, removeFromFavorites } from '../../lib/utils';
import { Book } from '../../hooks/useBooks';

export default function Favorite() {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = () => {
      const favs = getFavorites();
      setFavorites(favs);
      setLoading(false);
    };

    loadFavorites();

    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadFavorites, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleRemoveFavorite = (bookId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to remove this book from favorites?')) {
      const removed = removeFromFavorites(bookId);
      if (removed) {
        setFavorites(prev => prev.filter(book => book.id !== bookId));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-8 h-8 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                My Favorite Books
              </h1>
              <p className="text-gray-600">
                {favorites.length > 0
                  ? `You have ${favorites.length} favorite books`
                  : 'No favorite books yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">No Favorite Books</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring our book collection and add books you like to favorites for quick access later.
            </p>
            <Link
              href="/home"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Books
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                <Link href={`/home/book/${book.id}`} className="block">
                  {/* Book Cover */}
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.className = "w-full h-full object-contain p-4";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-300 text-4xl">📚</span>
                      </div>
                    )}

                    {/* Favorite Badge */}
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1.5 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 hover:text-green-600">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {book.author}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {book.publisher}
                    </p>

                    {/* Availability Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        book.available_quantity > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1 ${
                          book.available_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {book.available_quantity > 0 ? 'Available' : 'Not Available'}
                      </div>
                      <span className="text-xs text-gray-500">
                        Stock: {book.available_quantity}/{book.total_quantity}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveFavorite(book.id, e)}
                  className="absolute bottom-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow"
                  title="Remove from favorites"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}