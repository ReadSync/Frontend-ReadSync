"use client";
import { useState, useEffect } from 'react';

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  cover_image: string;
  category_name: string;
  available_quantity: number;
  total_quantity: number;
  book_code: string;
  isbn?: string;
  isbnr?: string;
  description?: string;
  publication_year?: number;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface UseBooksResult {
  books: Book[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBooks = (): UseBooksResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching books from: http://localhost:5000/api/books');
      
      const response = await fetch('http://localhost:5000/api/books');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.status === "success") {
        const booksData = result.data || [];
        setBooks(booksData);
        
        const uniqueCategories = ['All'];
        booksData.forEach((book: Book) => {
          if (book.category_name && !uniqueCategories.includes(book.category_name)) {
            uniqueCategories.push(book.category_name);
          }
        });
        setCategories(uniqueCategories);
        
        console.log(`Loaded ${booksData.length} books`);
        console.log('Categories found:', uniqueCategories);
      } else {
        throw new Error(result.message || 'Failed to fetch books');
      }
    } catch (error: any) {
      console.error('Error fetching books:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { books, categories, loading, error, refetch: fetchBooks };
};