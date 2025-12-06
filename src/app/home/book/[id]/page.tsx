"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createBorrow } from '../../../lib/action';
import { useBookDetail } from '../../../hooks/useBooks';
import { addToFavorites, removeFromFavorites, isFavorite } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;

  const { book, loading, error } = useBookDetail(bookId);

  const [borrowing, setBorrowing] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (book) setIsFav(isFavorite(book.id));
  }, [book]);

  if (loading || error || !book) return null;

  const handleBorrow = async () => {
    try {
      setBorrowing(true);
      const bookIdNumber = parseInt(bookId);

      if (isNaN(bookIdNumber)) return;

      const result = await createBorrow(bookIdNumber);

      if (result.success) {
        alert(`Successfully requested to borrow: ${book.title}`);
      } else {
        alert(result.error || "Failed to request borrow");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setBorrowing(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!book) return;

    if (isFav) {
      removeFromFavorites(book.id);
      setIsFav(false);
      alert("Book removed from favorites");
    } else {
      addToFavorites(book);
      setIsFav(true);
      alert("Book added to favorites");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => history.back()} 
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-10">
            
            {/* Cover Image */}
            <div className="w-full lg:w-1/3 flex justify-center lg:justify-start shrink-0">
              <div className="w-64 h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                {book.cover_image ? (
                  <img src={book.cover_image} alt={book.title} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-300 text-7xl">📚</span>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">{book.title}</h1>
                <p className="text-xl text-gray-700 font-medium">{book.author}</p>
                <div className="flex items-center gap-3 text-gray-500">
                  <span className="text-sm">{book.publisher}</span>
                  <span className="text-sm">•</span>
                  <span className="text-sm">{book.publication_year}</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Book Code</p>
                  <p className="text-sm font-semibold text-gray-900">{book.book_code}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ISBN</p>
                  <p className="text-sm font-semibold text-gray-900">{book.isbn || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Availability</p>
                  <p className={`text-sm font-bold ${book.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.available_quantity} / {book.total_quantity} in stock
                  </p>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{book.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6">
                <Button
                  onClick={handleToggleFavorite}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-md ${
                    isFav 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-gray-800 hover:bg-gray-900 text-white"
                  }`}
                >
                  {isFav ? "★ Favorited" : "☆ Add to Favorites"}
                </Button>

                <Button
                  onClick={handleBorrow}
                  disabled={borrowing || book.available_quantity <= 0}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    book.available_quantity > 0 
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {borrowing ? "Processing..." : book.available_quantity > 0 ? "Borrow Book" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}