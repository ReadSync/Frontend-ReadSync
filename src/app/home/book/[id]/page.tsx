"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBookDetail } from '../../../hooks/useBooks'; 

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id;
  
  const { book, error } = useBookDetail(bookId);

  if (error || !book) {
    return (
      <>
      
      </>
    );
  }
  return (
    <div className="p-4 md:p-6">
  <div className="mb-4 md:mb-6">
    <Link 
      href="/home"
      className="inline-flex items-center text-green-600 hover:text-green-800 text-sm md:text-base"
    >
      <span className="mr-1">←</span> Back to Home
    </Link>
  </div>

  <div className="bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-2/5 p-4 md:p-6 lg:p-8 bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-xs md:max-w-sm">
          <img 
            src={book.cover_image} 
            alt={book.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="w-full md:w-3/5 p-4 md:p-6 lg:p-8">
        <div className="mb-4 md:mb-6">
          <span className="inline-block bg-green-100 text-green-800 text-xs md:text-sm font-semibold px-2 md:px-3 py-1 rounded-full mb-2 md:mb-3">
            {book.category_name}
          </span>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            {book.title}
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-1">
            <span className="font-medium">by</span> {book.author}
          </p>
          <p className="text-sm md:text-base text-gray-500">
            {book.publisher} • Published: {book.publication_year}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 md:mb-3">Description</h2>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            {book.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Book Information */}
          <div className="bg-gray-50 p-4 md:p-5 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">
              Book Information
            </h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs md:text-sm">Book Code:</span>
                <span className="font-medium font-mono text-xs md:text-sm">
                  {book.book_code}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs md:text-sm">ISBN:</span>
                <span className="font-medium text-xs md:text-sm">
                  {book.isbn || book.isbnr}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600 text-xs md:text-sm">Added Date:</span>
                <span className="font-medium text-xs md:text-sm">
                  {new Date(book.created_at || '').toLocaleDateString('id-ID')}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 md:p-5 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">
              Availability
            </h3>
            <div className={`inline-flex items-center px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium ${
              book.available_quantity > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <span className={`h-2 w-2 rounded-full mr-1 md:mr-2 ${
                book.available_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {book.available_quantity > 0 ? 'Available' : 'Out of Stock'}
            </div>
            <p className="mt-2 md:mt-3 text-gray-600 text-xs md:text-sm">
              <span className="font-bold text-base md:text-lg">{book.available_quantity}</span> of{' '}
              <span className="font-medium">{book.total_quantity}</span> copies
            </p>
            
            <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
              {book.available_quantity > 0 ? (
                <button className="w-full px-3 md:px-4 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition text-sm md:text-base">
                  📚 Borrow
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed text-sm md:text-base"
                >
                  Currently Unavailable
                </button>
              )}
              
              <button className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition text-sm md:text-base">
                ⭐ Favorites
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 md:pt-6 border-t border-gray-200">
          <p className="text-xs md:text-sm text-gray-500">
            Last updated: {new Date(book.updated_at || '').toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}