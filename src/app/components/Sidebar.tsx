"use client"
import { useState } from 'react' 
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Home', href: '/home', icon: '🏠' },
  { name: 'Borrow List', href: '/home/borrow', icon: '📋' },
  { name: 'Favorite', href: '/home/favorite', icon: '⭐' },
  { name: 'Settings', href: '/home/settings', icon: '⚙️' },
];

export default function Sidebar() { 
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} h-full flex flex-col`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-800">ReadSync</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-50 text-green-600 border-r-2 border-green-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}