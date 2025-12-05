"use client"
import { useDropdown } from '../hooks/useDropdown'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Navbar2Props {
  session: any
}

export default function Navbar2({ session }: Navbar2Props) {
  const { activeDropdown, dropdownRef, toggleDropdown } = useDropdown()
  const router = useRouter()

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
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search books, authors, or categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-6" ref={dropdownRef}>
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-500 text-center">Riwayat akan muncul di sini</p>
                    <p className="text-xs text-gray-400 text-center mt-1">(Fitur coming soon)</p>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => toggleDropdown('notifications')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              {activeDropdown === 'notifications' && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-500 text-center">Notifikasi akan muncul di sini</p>
                    <p className="text-xs text-gray-400 text-center mt-1">(Fitur coming soon)</p>
                  </div>
                </div>
              )}
            </div>
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
