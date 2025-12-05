"use client";
import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import Link from 'next/link';

export default function HomePage() {
  const { books, categories, loading, error } = useBooks();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredBooks = selectedCategory === 'All' 
    ? books 
    : books.filter(book => book.category_name === selectedCategory);

  return (
    <div className="p-4">
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

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Books {filteredBooks.length > 0 && `(${filteredBooks.length})`}
          </h2>
          <span className="text-sm text-gray-500">
            Showing {filteredBooks.length} of {books.length} books
          </span>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Link 
                key={book.id}
                href={`/home/book/${book.id}`}
                className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white hover:scale-[1.02] hover:border-green-600 cursor-pointer"
              >
       <div className="h-48 bg-gray-100 rounded-lg mb-3 overflow-hidden">
  <img 
    src={book.cover_image} 
    alt={book.title}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.className = "w-full h-full object-contain p-4";
    }}
  />
</div>
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
              </Link> 
            ))}
          </div>
      </div>
    </div>
  );
}