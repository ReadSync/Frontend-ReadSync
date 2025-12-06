"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  useCategories,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
  useSearchBooks,
  useBooks,
  Book
} from '../../hooks/useBooks';

export default function AddBooksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'new' | 'stock' | 'delete'>('new');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  // Hooks
  const { categories } = useCategories();
  const { createBook, loading: createLoading } = useCreateBook();
  const { updateBook, loading: updateLoading } = useUpdateBook();
  const { deleteBook, loading: deleteLoading } = useDeleteBook();
  const { searchBooks, loading: searchLoading } = useSearchBooks();
  const { books: allBooks, refetch: refetchBooks } = useBooks();

  // Form untuk buku baru
  const [newBookForm, setNewBookForm] = useState({
    book_code: '',
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    description: '',
    publication_year: new Date().getFullYear(),
    category_id: '',
    total_quantity: 1,
    available_quantity: 1,
    cover_image: '',
  });

  // Form untuk stock management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [stockToAdd, setStockToAdd] = useState(1);
  const [stockToReduce, setStockToReduce] = useState(1);

  // Check authorization
  const userRole = session?.user?.role || '';
  const isAuthorized = userRole === 'petugas' || userRole === 'admin';

  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;

    // Validate URL length (max 500 characters for database)
    if (url.length > 500) {
      setError('URL terlalu panjang (maksimal 500 karakter)');
      return;
    }

    // Use functional update to ensure state is updated correctly
    setNewBookForm(prev => {
      const updated = { ...prev, cover_image: url };
      console.log('Updating cover_image in state:', url);
      return updated;
    });
    setError(null);

    // Show preview if URL is not empty
    if (url && url.trim() !== '') {
      setCoverImagePreview(url);
    } else {
      setCoverImagePreview(null);
    }
  };

  // Search books
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await searchBooks(searchQuery);
        setSearchResults(results);
      } catch (err) {
        // Error sudah di-handle di hook
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchBooks]);

  // Handle add new book
  const handleAddNewBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newBookForm.title || !newBookForm.author || !newBookForm.category_id) {
      setError('Judul, Penulis, dan Kategori wajib diisi');
      return;
    }

    // Validate cover_image URL length if provided
    if (newBookForm.cover_image && newBookForm.cover_image.trim() !== '') {
      if (newBookForm.cover_image.length > 500) {
        setError('URL cover image terlalu panjang (maksimal 500 karakter)');
        return;
      }
    }

    try {
      // Prepare cover_image value
      let coverImageValue = null;
      if (newBookForm.cover_image) {
        const trimmed = newBookForm.cover_image.trim();
        if (trimmed !== '') {
          coverImageValue = trimmed;
        }
      }

      const bookData: any = {
        book_code: newBookForm.book_code || null,
        title: newBookForm.title,
        author: newBookForm.author,
        publisher: newBookForm.publisher || null,
        isbn: newBookForm.isbn || null,
        description: newBookForm.description || null,
        publication_year: parseInt(newBookForm.publication_year.toString()),
        category_id: parseInt(newBookForm.category_id),
        total_quantity: parseInt(newBookForm.total_quantity.toString()),
        available_quantity: parseInt(newBookForm.available_quantity.toString()),
        cover_image: coverImageValue, // Explicitly set to null or string
      };

      // Debug log
      console.log('=== FRONTEND: Sending bookData ===');
      console.log('newBookForm.cover_image:', newBookForm.cover_image);
      console.log('coverImageValue:', coverImageValue);
      console.log('cover_image in bookData:', bookData.cover_image);
      console.log('cover_image type:', typeof bookData.cover_image);
      console.log('Full bookData:', JSON.stringify(bookData, null, 2));

      // Alert untuk debugging (bisa dihapus nanti)
      if (coverImageValue) {
        console.log('✅ cover_image akan dikirim:', coverImageValue);
      } else {
        console.log('⚠️ cover_image KOSONG - akan dikirim null');
      }

      await createBook(bookData);

      setSuccess('Buku berhasil ditambahkan!');
      setNewBookForm({
        book_code: '',
        title: '',
        author: '',
        publisher: '',
        isbn: '',
        description: '',
        publication_year: new Date().getFullYear(),
        category_id: '',
        total_quantity: 1,
        available_quantity: 1,
        cover_image: '',
      });
      setCoverImagePreview(null);
      await refetchBooks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan buku');
    }
  };

  // Handle add stock
  const handleAddStock = async () => {
    if (!selectedBook || stockToAdd < 1) {
      setError('Pilih buku dan masukkan jumlah stock yang valid');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const newTotalQuantity = selectedBook.total_quantity + stockToAdd;
      const newAvailableQuantity = selectedBook.available_quantity + stockToAdd;

      await updateBook(selectedBook.id, {
        total_quantity: newTotalQuantity,
        available_quantity: newAvailableQuantity,
      });

      setSuccess(`Stock berhasil ditambahkan! Total: ${newTotalQuantity}, Tersedia: ${newAvailableQuantity}`);
      setSelectedBook({
        ...selectedBook,
        total_quantity: newTotalQuantity,
        available_quantity: newAvailableQuantity,
      });
      setStockToAdd(1);
      await refetchBooks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan stock');
    }
  };

  // Handle reduce stock
  const handleReduceStock = async () => {
    if (!selectedBook || stockToReduce < 1) {
      setError('Pilih buku dan masukkan jumlah stock yang valid');
      return;
    }

    if (stockToReduce > selectedBook.available_quantity) {
      setError('Jumlah stock yang dikurangi tidak boleh melebihi stock tersedia');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const newTotalQuantity = Math.max(0, selectedBook.total_quantity - stockToReduce);
      const newAvailableQuantity = Math.max(0, selectedBook.available_quantity - stockToReduce);

      await updateBook(selectedBook.id, {
        total_quantity: newTotalQuantity,
        available_quantity: newAvailableQuantity,
      });

      setSuccess(`Stock berhasil dikurangi! Total: ${newTotalQuantity}, Tersedia: ${newAvailableQuantity}`);
      setSelectedBook({
        ...selectedBook,
        total_quantity: newTotalQuantity,
        available_quantity: newAvailableQuantity,
      });
      setStockToReduce(1);
      await refetchBooks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengurangi stock');
    }
  };

  // Handle delete book
  const handleDeleteBook = async () => {
    if (!selectedBook) {
      setError('Pilih buku yang akan dihapus');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${selectedBook.title}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await deleteBook(selectedBook.id);
      setSuccess('Buku berhasil dihapus!');
      setSelectedBook(null);
      setSearchQuery('');
      setSearchResults([]);
      await refetchBooks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus buku');
    }
  };

  // Redirect jika tidak authorized
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push('/login');
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Akses ditolak. Halaman ini hanya untuk petugas/admin.</p>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  const loading = createLoading || updateLoading || deleteLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Kelola Buku</h1>
          <p className="text-gray-600 mt-1">Tambah buku baru, kelola stock, atau hapus buku</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-1">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('new');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'new'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              📚 Tambah Buku Baru
            </button>
            <button
              onClick={() => {
                setActiveTab('stock');
                setError(null);
                setSuccess(null);
                setSearchQuery('');
                setSearchResults([]);
                setSelectedBook(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'stock'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              📦 Kelola Stock
            </button>
            <button
              onClick={() => {
                setActiveTab('delete');
                setError(null);
                setSuccess(null);
                setSearchQuery('');
                setSearchResults([]);
                setSelectedBook(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'delete'
                ? 'bg-red-100 text-red-800 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              🗑️ Hapus Buku
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Tab Content: Add New Book */}
        {activeTab === 'new' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Form Tambah Buku Baru</h2>
            <form onSubmit={handleAddNewBook} className="space-y-4">
              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Cover Buku
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newBookForm.cover_image}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Masukkan URL gambar cover buku (contoh: https://example.com/book-cover.jpg)</p>
                  </div>
                  {coverImagePreview && (
                    <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setCoverImagePreview(null)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBookForm.title}
                    onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Buku
                  </label>
                  <input
                    type="text"
                    value={newBookForm.book_code}
                    onChange={(e) => setNewBookForm({ ...newBookForm, book_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penulis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penerbit
                  </label>
                  <input
                    type="text"
                    value={newBookForm.publisher}
                    onChange={(e) => setNewBookForm({ ...newBookForm, publisher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Terbit
                  </label>
                  <input
                    type="number"
                    value={newBookForm.publication_year}
                    onChange={(e) => setNewBookForm({ ...newBookForm, publication_year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newBookForm.category_id}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    value={newBookForm.total_quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setNewBookForm({
                        ...newBookForm,
                        total_quantity: val,
                        available_quantity: val,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setNewBookForm({
                      book_code: '',
                      title: '',
                      author: '',
                      publisher: '',
                      isbn: '',
                      description: '',
                      publication_year: new Date().getFullYear(),
                      category_id: '',
                      total_quantity: 1,
                      available_quantity: 1,
                      cover_image: '',
                    });
                    setCoverImagePreview(null);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menambahkan...' : 'Tambah Buku'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: Manage Stock */}
        {activeTab === 'stock' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Kelola Stock Buku</h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Buku (Judul atau Kode Buku)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan judul atau kode buku..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hasil Pencarian:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBook?.id === book.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="font-medium text-gray-800">{book.title}</div>
                      <div className="text-sm text-gray-600">
                        Kode: {book.book_code} | Total: {book.total_quantity} | Tersedia: {book.available_quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Book Info */}
            {selectedBook && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">Buku yang Dipilih:</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="font-medium">Judul:</span> {selectedBook.title}
                  </div>
                  <div>
                    <span className="font-medium">Kode:</span> {selectedBook.book_code}
                  </div>
                  <div>
                    <span className="font-medium">Stock Saat Ini:</span> {selectedBook.total_quantity} (Tersedia: {selectedBook.available_quantity})
                  </div>
                </div>

                {/* Add Stock */}
                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-gray-800 mb-3">Tambah Stock</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Stock yang Ditambahkan
                    </label>
                    <input
                      type="number"
                      value={stockToAdd}
                      onChange={(e) => setStockToAdd(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      Setelah ditambahkan: Total = {selectedBook.total_quantity + stockToAdd}, Tersedia = {selectedBook.available_quantity + stockToAdd}
                    </p>
                  </div>
                  <button
                    onClick={handleAddStock}
                    disabled={loading || stockToAdd < 1}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Menambahkan...' : 'Tambah Stock'}
                  </button>
                </div>

                {/* Reduce Stock */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-gray-800 mb-3">Kurangi Stock</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Stock yang Dikurangi
                    </label>
                    <input
                      type="number"
                      value={stockToReduce}
                      onChange={(e) => setStockToReduce(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="1"
                      max={selectedBook.available_quantity}
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      Setelah dikurangi: Total = {Math.max(0, selectedBook.total_quantity - stockToReduce)}, Tersedia = {Math.max(0, selectedBook.available_quantity - stockToReduce)}
                    </p>
                  </div>
                  <button
                    onClick={handleReduceStock}
                    disabled={loading || stockToReduce < 1 || stockToReduce > selectedBook.available_quantity}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Mengurangi...' : 'Kurangi Stock'}
                  </button>
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-8 text-gray-500">
                <p>Buku tidak ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Delete Book */}
        {activeTab === 'delete' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Hapus Buku</h2>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Buku yang Akan Dihapus (Judul atau Kode Buku)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan judul atau kode buku..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Hasil Pencarian:</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBook?.id === book.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="font-medium text-gray-800">{book.title}</div>
                      <div className="text-sm text-gray-600">
                        Kode: {book.book_code} | Total: {book.total_quantity} | Tersedia: {book.available_quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Book Info */}
            {selectedBook && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-gray-800 mb-3">Buku yang Akan Dihapus:</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div>
                    <span className="font-medium">Judul:</span> {selectedBook.title}
                  </div>
                  <div>
                    <span className="font-medium">Kode:</span> {selectedBook.book_code}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {selectedBook.total_quantity} (Tersedia: {selectedBook.available_quantity})
                  </div>
                </div>
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Peringatan: Tindakan ini tidak dapat dibatalkan. Semua data buku akan dihapus permanen.
                  </p>
                </div>
                <button
                  onClick={handleDeleteBook}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menghapus...' : 'Hapus Buku'}
                </button>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-8 text-gray-500">
                <p>Buku tidak ditemukan</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
