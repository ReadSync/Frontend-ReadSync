"use client";
import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';

export default function HomePage() {
  const { books, categories, loading, error } = useBooks();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter books by category
  const filteredBooks = selectedCategory === 'All' 
    ? books 
    : books.filter(book => book.category_name === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading books...</div>
        <div className="ml-3 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading books: {error}</p>
        <p className="text-sm text-red-500 mt-2">
          Make sure backend is running on http://localhost:5000
        </p>
        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
          <p className="font-medium">Troubleshooting:</p>
          <ol className="list-decimal pl-5 mt-1 space-y-1">
            <li>Check if backend server is running</li>
            <li>Try accessing <a href="http://localhost:5000/api/books" className="text-blue-500 underline" target="_blank">http://localhost:5000/api/books</a> in your browser</li>
            <li>Check browser console for detailed error (F12 → Console)</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                selectedCategory === category 
                  ? 'bg-green-100 border-green-300 text-green-700 font-medium' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Books */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Books {filteredBooks.length > 0 && `(${filteredBooks.length})`}
          </h2>
          <span className="text-sm text-gray-500">
            Showing {filteredBooks.length} of {books.length} books
          </span>
        </div>
        
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-600">No books found in this category</p>
            <p className="text-sm text-gray-500 mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                {/* Cover Image */}
                <div className="h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {book.cover_image ? (
                    <img 
                      src={book.cover_image} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/300x400/EFEFEF/666666?text=No+Image';
                        e.currentTarget.className = "w-full h-full object-contain p-4";
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">📕</div>
                      <span className="text-gray-500 text-sm">No Cover Image</span>
                    </div>
                  )}
                </div>
                
                {/* Book Info */}
                <h3 className="font-medium text-gray-800 line-clamp-1">{book.title}</h3>
                <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                <p className="text-xs text-gray-500 mt-1">{book.publisher}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {book.category_name || "Uncategorized"}
                  </span>
                  
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      book.available_quantity > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {book.available_quantity > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Stock: {book.available_quantity}/{book.total_quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}