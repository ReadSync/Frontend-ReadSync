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

interface UseBookDetailResult {
  book: Book | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBookDetail = (bookId: string | string[] | undefined): UseBookDetailResult => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!bookId) {
        throw new Error('Book ID is required');
      }
      
      console.log(`Fetching book ${bookId} from: http://localhost:5000/api/books/${bookId}`);
      
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Book API Response:', result);
      
      if (result.status === "success") {
        setBook(result.data);
        console.log(`Loaded book: ${result.data.title}`);
      } else {
        throw new Error(result.message || 'Book not found');
      }
    } catch (error: any) {
      console.error('Error fetching book:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  return { book, loading, error, refetch: fetchBook };
};