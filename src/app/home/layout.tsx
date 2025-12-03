import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import Sidebar from '../components/Sidebar'
import Navbar2 from '../components/Navbar2'
import { redirect } from 'next/navigation' // ✅ PERBAIKI INI

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log("🔍 SESSION DI HOME LAYOUT:", session)

  if (session && session.user?.role === 'petugas') {
    redirect('/petugas/dashboard')  
  }
  
  if (session && session.user?.role === 'admin') {
    redirect('/admin/dashboard')  
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar2 session={session} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}