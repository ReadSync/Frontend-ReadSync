"use client"
import { useDropdown } from '../hooks/useDropdown'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const userRole = session?.user?.role || 'Officer'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <Link
              href="/petugas/home"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/petugas/addBooks"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Add Books
            </Link>
          </div>

          <div className="absolute right-6" ref={dropdownRef}>
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
                      Profile menu coming soon
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