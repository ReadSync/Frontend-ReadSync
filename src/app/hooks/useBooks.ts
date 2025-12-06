// hooks/useBooks.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import { addNotification } from '../lib/utils';

// =========== Interfaces ===========
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

export interface Category {
  id: number;
  category_name: string;
}

interface Borrow {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string | null;
  due_date: string | null;
  return_date: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';
  notes: string | null;
  created_at: string;
  updated_at: string;
  book_title?: string;
  book_author?: string;
  book_category?: string;
  book_code?: string;
  user_name?: string;
  user_nisn?: string;
}

interface BorrowResponse {
  id: number;
  bookId?: number;
  bookInitials: string;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string;
  bookCoverImage?: string;
  borrowDate: string;
  dueDate: string;
  daysLeft: string;
  status: string;
  returnDate: string | null;
  fine: number;
  userName?: string;
  userNisn?: string;
  userId?: number;
}

// =========== Hook untuk semua buku ===========
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

// =========== Hook untuk semua kategori ===========
interface UseAllCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAllCategories = (): UseAllCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching categories from: http://localhost:5000/api/categories');

      const response = await fetch('http://localhost:5000/api/categories');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Categories API Response:', result);

      if (result.status === "success") {
        setCategories(result.data || []);
        console.log(`Loaded ${result.data?.length || 0} categories`);
      } else {
        throw new Error(result.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};

// =========== Hook untuk detail buku ===========
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

// =========== Hook untuk meminjam buku ===========
interface UseBorrowBookResult {
  borrowBook: (bookId: number) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useBorrowBook = (): UseBorrowBookResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const borrowBook = async (bookId: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Mengirim request borrow...');
      console.log('Book ID:', bookId);

      // Ambil user_id dari localStorage (sesuaikan dengan sistem login-mu)
      const userId = localStorage.getItem('user_id') || '1'; // Default untuk testing

      // GUNAKAN API EXPRESS-MU DI SINI
      const response = await fetch('http://localhost:5000/api/borrows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookId,
          user_id: parseInt(userId),
          notes: null
        }),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.status === "error") {
        throw new Error(data.message || 'Failed to borrow book');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error dalam borrowBook:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { borrowBook, loading, error };
};

// =========== Hook untuk mendapatkan daftar pinjaman user ===========
interface UseUserBorrowsResult {
  borrows: BorrowResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserBorrows = (userId?: string | number): UseUserBorrowsResult => {
  const [borrows, setBorrows] = useState<BorrowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrows = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Jika userId tidak diberikan, ambil dari localStorage
      const userToFetch = userId || localStorage.getItem('user_id') || '1';

      console.log(`Fetching borrows for user ${userToFetch} from API...`);

      const response = await fetch(`http://localhost:5000/api/borrows/user/${userToFetch}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Borrows API Response:', result);

      if (result.status === "success") {
        // Format data sesuai dengan kebutuhan UI
        const formattedBorrows: BorrowResponse[] = result.data.map((borrow: Borrow) => {
          // Generate book initials
          const words = (borrow.book_title || '').split(' ');
          let bookInitials = '';
          if (words.length >= 2) {
            bookInitials = words[0].charAt(0) + words[1].charAt(0);
          } else if (words[0]) {
            bookInitials = words[0].substring(0, 2);
          } else {
            bookInitials = 'BK';
          }
          bookInitials = bookInitials.toUpperCase();

          // Calculate days left/overdue and fine
          let daysLeft = '';
          let fine = 0;
          const FINE_PER_DAY = 5000; // 5,000 per day

          if (borrow.due_date) {
            const dueDate = new Date(borrow.due_date);
            const today = new Date();
            // Reset time to midnight for accurate day calculation
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0 && borrow.status !== 'returned') {
              // Book is overdue - calculate fine
              const overdueDays = Math.abs(diffDays);
              fine = overdueDays * FINE_PER_DAY;
              daysLeft = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;

              // Create notification for fine (only if fine > 0)
              if (fine > 0 && typeof window !== 'undefined') {
                // Check if notification already exists for this borrow today
                const notificationKey = `fine_notif_${borrow.id}_${new Date().toDateString()}`;
                const lastNotification = localStorage.getItem(notificationKey);

                if (!lastNotification) {
                  addNotification({
                    type: 'fine',
                    title: 'Overdue Book Fine',
                    message: `Your book "${borrow.book_title || 'Unknown'}" is ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue. Fine: Rp ${fine.toLocaleString('id-ID')}`,
                    bookId: borrow.book_id,
                    bookTitle: borrow.book_title || 'Unknown Book',
                    fineAmount: fine
                  });

                  // Mark that notification was created today
                  localStorage.setItem(notificationKey, 'true');
                }
              }
            } else if (diffDays >= 0) {
              daysLeft = `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
            } else {
              daysLeft = 'Returned';
            }
          }

          // Format dates
          const formatDate = (dateStr: string | null): string => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
          };

          // Map status to English
          const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'approved': 'Borrowed',
            'returned': 'Returned',
            'overdue': 'Overdue',
            'canceled': 'Rejected'
          };

          return {
            id: borrow.id,
            bookId: borrow.book_id,
            bookInitials,
            bookTitle: borrow.book_title || 'Unknown Book',
            bookAuthor: borrow.book_author || 'Unknown Author',
            bookCategory: borrow.book_category || 'Unknown Category',
            bookCoverImage: borrow.cover_image || borrow.book_cover_image || null,
            borrowDate: formatDate(borrow.borrow_date),
            dueDate: formatDate(borrow.due_date),
            daysLeft,
            status: statusMap[borrow.status] || borrow.status,
            returnDate: borrow.return_date ? formatDate(borrow.return_date) : null,
            fine: fine,
            userName: borrow.user_name,
            userNisn: borrow.user_nisn,
            userId: borrow.user_id
          };
        });

        setBorrows(formattedBorrows);
        console.log(`Loaded ${formattedBorrows.length} borrow records`);
      } else {
        throw new Error(result.message || 'Failed to fetch borrows');
      }
    } catch (err: any) {
      console.error('Error fetching borrows:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  return { borrows, loading, error, refetch: fetchBorrows };
};

// =========== Hook untuk action pada peminjaman ===========
interface UseBorrowActionsResult {
  approveBorrow: (borrowId: number) => Promise<any>;
  rejectBorrow: (borrowId: number) => Promise<any>;
  returnBorrow: (borrowId: number) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useBorrowActions = (): UseBorrowActionsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveBorrow = async (borrowId: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Approving borrow ${borrowId}...`);

      const response = await fetch(`http://localhost:5000/api/borrows/${borrowId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(`API mengembalikan respons non-JSON. Status: ${response.status}. Pastikan endpoint /api/borrows/${borrowId}/approve tersedia di backend.`);
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || 'Failed to approve borrow');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error approving borrow:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectBorrow = async (borrowId: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Rejecting borrow ${borrowId}...`);

      const response = await fetch(`http://localhost:5000/api/borrows/${borrowId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(`API mengembalikan respons non-JSON. Status: ${response.status}. Pastikan endpoint /api/borrows/${borrowId}/reject tersedia di backend.`);
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || 'Failed to reject borrow');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error rejecting borrow:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const returnBorrow = async (borrowId: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Returning borrow ${borrowId}...`);

      const response = await fetch(`http://localhost:5000/api/borrows/${borrowId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(`API mengembalikan respons non-JSON. Status: ${response.status}. Pastikan endpoint /api/borrows/${borrowId}/return tersedia di backend.`);
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || 'Failed to return book');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error returning borrow:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { approveBorrow, rejectBorrow, returnBorrow, loading, error };
};

// =========== Hook untuk mendapatkan semua borrows (untuk petugas/admin) ===========
interface UseAllBorrowsResult {
  borrows: BorrowResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAllBorrows = (status?: string): UseAllBorrowsResult => {
  const [borrows, setBorrows] = useState<BorrowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrows = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Build URL dengan optional status filter
      let url = 'http://localhost:5000/api/borrows';
      if (status) {
        url += `?status=${status}`;
      }

      console.log(`Fetching all borrows from API... (status: ${status || 'all'})`);

      const response = await fetch(url);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(`API mengembalikan respons non-JSON. Status: ${response.status}. Pastikan endpoint /api/borrows tersedia di backend.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('All Borrows API Response:', result);

      if (result.status === "success") {
        // Format data sesuai dengan kebutuhan UI
        const formattedBorrows: BorrowResponse[] = result.data.map((borrow: Borrow) => {
          // Generate book initials
          const words = (borrow.book_title || '').split(' ');
          let bookInitials = '';
          if (words.length >= 2) {
            bookInitials = words[0].charAt(0) + words[1].charAt(0);
          } else if (words[0]) {
            bookInitials = words[0].substring(0, 2);
          } else {
            bookInitials = 'BK';
          }
          bookInitials = bookInitials.toUpperCase();

          // Calculate days left/overdue and fine
          let daysLeft = '';
          let fine = 0;
          const FINE_PER_DAY = 5000; // 5,000 per day

          if (borrow.due_date) {
            const dueDate = new Date(borrow.due_date);
            const today = new Date();
            // Reset time to midnight for accurate day calculation
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0 && borrow.status !== 'returned') {
              // Book is overdue - calculate fine
              const overdueDays = Math.abs(diffDays);
              fine = overdueDays * FINE_PER_DAY;
              daysLeft = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;

              // Create notification for fine (only if fine > 0)
              if (fine > 0 && typeof window !== 'undefined') {
                // Check if notification already exists for this borrow today
                const notificationKey = `fine_notif_${borrow.id}_${new Date().toDateString()}`;
                const lastNotification = localStorage.getItem(notificationKey);

                if (!lastNotification) {
                  addNotification({
                    type: 'fine',
                    title: 'Overdue Book Fine',
                    message: `Your book "${borrow.book_title || 'Unknown'}" is ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue. Fine: Rp ${fine.toLocaleString('id-ID')}`,
                    bookId: borrow.book_id,
                    bookTitle: borrow.book_title || 'Unknown Book',
                    fineAmount: fine
                  });

                  // Mark that notification was created today
                  localStorage.setItem(notificationKey, 'true');
                }
              }
            } else if (diffDays >= 0) {
              daysLeft = `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
            } else {
              daysLeft = 'Returned';
            }
          }

          // Format dates
          const formatDate = (dateStr: string | null): string => {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
          };

          // Map status to English
          const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'approved': 'Borrowed',
            'returned': 'Returned',
            'overdue': 'Overdue',
            'canceled': 'Rejected'
          };

          return {
            id: borrow.id,
            bookId: borrow.book_id,
            bookInitials,
            bookTitle: borrow.book_title || 'Unknown Book',
            bookAuthor: borrow.book_author || 'Unknown Author',
            bookCategory: borrow.book_category || 'Unknown Category',
            bookCoverImage: borrow.cover_image || borrow.book_cover_image || null,
            borrowDate: formatDate(borrow.borrow_date),
            dueDate: formatDate(borrow.due_date),
            daysLeft,
            status: statusMap[borrow.status] || borrow.status,
            returnDate: borrow.return_date ? formatDate(borrow.return_date) : null,
            fine: fine,
            userName: borrow.user_name,
            userNisn: borrow.user_nisn,
            userId: borrow.user_id
          };
        });

        setBorrows(formattedBorrows);
        console.log(`Loaded ${formattedBorrows.length} borrow records`);
      } else {
        throw new Error(result.message || 'Failed to fetch borrows');
      }
    } catch (err: any) {
      console.error('Error fetching borrows:', err);
      const errorMessage = err.message || 'Failed to fetch borrow data';
      setError(errorMessage);

      // Log more details for debugging
      if (err.message?.includes('JSON')) {
        console.error('Possible endpoint not available or returning HTML error page');
        console.error('Make sure backend has endpoint: GET /api/borrows');
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  return { borrows, loading, error, refetch: fetchBorrows };
};

// =========== Hook untuk Categories ===========
interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      if (data.status === 'success') {
        setCategories(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};

// =========== Hook untuk Create Book ===========
interface UseCreateBookResult {
  createBook: (bookData: {
    book_code?: string;
    title: string;
    author: string;
    publisher?: string;
    isbn?: string;
    description?: string;
    publication_year?: number;
    category_id: number;
    total_quantity: number;
    available_quantity: number;
    cover_image?: string;
  }) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useCreateBook = (): UseCreateBookResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBook = async (bookData: {
    book_code?: string;
    title: string;
    author: string;
    publisher?: string;
    isbn?: string;
    description?: string;
    publication_year?: number;
    category_id: number;
    total_quantity: number;
    available_quantity: number;
    cover_image?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data;
      } else {
        throw new Error(data.message || 'Failed to add book');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add book';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBook, loading, error };
};

// =========== Hook untuk Update Book ===========
interface UseUpdateBookResult {
  updateBook: (bookId: number, updates: any) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useUpdateBook = (): UseUpdateBookResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBook = async (bookId: number, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data;
      } else {
        throw new Error(data.message || 'Failed to update book');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update book';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBook, loading, error };
};

// =========== Hook untuk Delete Book ===========
interface UseDeleteBookResult {
  deleteBook: (bookId: number) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useDeleteBook = (): UseDeleteBookResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBook = async (bookId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data;
      } else {
        throw new Error(data.message || 'Failed to delete book');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete book';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteBook, loading, error };
};

// =========== Hook untuk Search Books ===========
interface UseSearchBooksResult {
  searchBooks: (query: string) => Promise<Book[]>;
  loading: boolean;
  error: string | null;
}

export const useSearchBooks = (): UseSearchBooksResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = async (query: string): Promise<Book[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/books');
      const data = await response.json();
      if (data.status === 'success') {
        const filtered = data.data.filter((book: Book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.book_code?.toLowerCase().includes(query.toLowerCase())
        );
        return filtered;
      } else {
        throw new Error(data.message || 'Failed to search books');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to search books';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { searchBooks, loading, error };
};
