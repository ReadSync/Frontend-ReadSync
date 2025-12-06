"use client"
import { useState, useEffect, useRef } from 'react'
import { useDropdown } from '../hooks/useDropdown'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useBooks, useUserBorrows } from '../hooks/useBooks'
import { Book } from '../hooks/useBooks'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
  removeFromSearchHistory,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  type SearchHistoryItem,
  type Notification
} from '../lib/utils'

interface Navbar2Props {
  session: any
}

export default function Navbar2({ session }: Navbar2Props) {
  const { activeDropdown, dropdownRef, toggleDropdown, closeDropdown } = useDropdown()
  const router = useRouter()
  const { books } = useBooks()
  const { data: sessionData } = useSession()
  const userId = sessionData?.user?.id ? parseInt(sessionData.user.id) : null
  const { borrows: borrowHistory } = useUserBorrows(userId || undefined)

  const searchRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load search history and notifications
  useEffect(() => {
    setSearchHistory(getSearchHistory())
    setNotifications(getNotifications())
    setUnreadCount(getUnreadNotificationCount())
  }, [])

  // Update notifications when dropdown opens
  useEffect(() => {
    if (activeDropdown === 'notifications') {
      setNotifications(getNotifications())
      setUnreadCount(getUnreadNotificationCount())
    }
  }, [activeDropdown])

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = books.filter(book => {
      const titleMatch = book.title.toLowerCase().includes(query)
      const authorMatch = book.author.toLowerCase().includes(query)
      const categoryMatch = book.category_name?.toLowerCase().includes(query)
      const publisherMatch = book.publisher?.toLowerCase().includes(query)

      return titleMatch || authorMatch || categoryMatch || publisherMatch
    })

    setSearchResults(filtered.slice(0, 5)) // Limit to 5 results
    setShowSearchResults(true)
  }, [searchQuery, books])

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToSearchHistory(query)
      setSearchHistory(getSearchHistory())
      setSearchQuery('')
      setShowSearchResults(false)
      router.push(`/home?search=${encodeURIComponent(query)}`)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery)
    }
  }

  const handleSelectSearchHistory = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }

  const handleClearHistory = () => {
    clearSearchHistory()
    setSearchHistory([])
  }

  const handleRemoveHistoryItem = (timestamp: number) => {
    removeFromSearchHistory(timestamp)
    setSearchHistory(getSearchHistory())
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
      setNotifications(getNotifications())
      setUnreadCount(getUnreadNotificationCount())
    }

    if (notification.bookId) {
      router.push(`/home/book/${notification.bookId}`)
      closeDropdown()
    }
  }

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
    setNotifications(getNotifications())
    setUnreadCount(0)
  }

  const handleDeleteNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notificationId)
    setNotifications(getNotifications())
    setUnreadCount(getUnreadNotificationCount())
  }

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
    return new Date(timestamp).toLocaleDateString('en-US')
  }

  const handleLogout = async () => {
    try {
      toggleDropdown('profile')
      await signOut({
        redirect: false,
        callbackUrl: '/login'
      })

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const userName = session?.user?.name || 'Guest'
  const userEmail = session?.user?.email || 'No email'
  const userRole = session?.user?.role || 'Student'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search books, authors, or categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && (searchQuery.trim() || searchHistory.length > 0) && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {/* Search Results */}
                  {searchQuery.trim() && searchResults.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Search Results</div>
                      {searchResults.map((book) => (
                        <Link
                          key={book.id}
                          href={`/home/book/${book.id}`}
                          onClick={() => {
                            handleSearch(searchQuery)
                            setShowSearchResults(false)
                          }}
                          className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {book.cover_image ? (
                              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📚</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                            <p className="text-xs text-gray-500 truncate">{book.author}</p>
                            <p className="text-xs text-gray-400">{book.category_name}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="border-t border-gray-100">
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase">Search History</div>
                        <button
                          onClick={handleClearHistory}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      {searchHistory.map((item) => (
                        <div
                          key={item.timestamp}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors group"
                        >
                          <button
                            onClick={() => handleSelectSearchHistory(item.query)}
                            className="flex items-center space-x-2 flex-1 text-left"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">{item.query}</span>
                          </button>
                          <button
                            onClick={() => handleRemoveHistoryItem(item.timestamp)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery.trim() && searchResults.length === 0 && searchHistory.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500">No results found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-6" ref={dropdownRef}>
            {/* History Button - Borrow History */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('history')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:block text-sm">History</span>
              </button>

              {activeDropdown === 'history' && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Borrow History</h3>
                    <Link
                      href="/home/borrow"
                      onClick={() => toggleDropdown('history')}
                      className="text-xs text-green-600 hover:text-green-700 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  {!userId ? (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-sm text-gray-500">Please login to view history</p>
                    </div>
                  ) : borrowHistory.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-500">No borrow history yet</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {borrowHistory.slice(0, 5).map((borrow) => {
                        const getStatusColor = (status: string) => {
                          if (status === 'Pending') return 'bg-yellow-100 text-yellow-800'
                          if (status === 'Borrowed') return 'bg-green-100 text-green-800'
                          if (status === 'Returned') return 'bg-blue-100 text-blue-800'
                          if (status === 'Overdue') return 'bg-red-100 text-red-800'
                          if (status === 'Rejected') return 'bg-gray-100 text-gray-800'
                          return 'bg-gray-100 text-gray-800'
                        }

                        return (
                          <Link
                            key={borrow.id}
                            href={borrow.bookId ? `/home/book/${borrow.bookId}` : '/home/borrow'}
                            onClick={() => toggleDropdown('history')}
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${borrow.bookInitials ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-400'}`}>
                              {borrow.bookInitials || '📚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{borrow.bookTitle}</p>
                              <p className="text-xs text-gray-500 truncate">{borrow.bookAuthor}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(borrow.status)}`}>
                                  {borrow.status}
                                </span>
                                <span className="text-xs text-gray-400">{borrow.borrowDate}</span>
                              </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('notifications')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {activeDropdown === 'notifications' && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-green-600 hover:text-green-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                            notification.read ? 'border-transparent bg-gray-50' : 'border-green-500 bg-green-50/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                              {notification.bookTitle && (
                                <p className="text-xs text-gray-500 italic">Book: {notification.bookTitle}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity ml-2 flex-shrink-0"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('profile')}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userInitial}
                  </span>
                </div>
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {userRole}
                    </p>
                  </div>
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      Menu profile coming soon
                    </div>
                  </div>
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
