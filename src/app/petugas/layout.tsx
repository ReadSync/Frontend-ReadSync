import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import PetugasNavbar from '../components/PetugasNavbar'
import { redirect } from 'next/navigation'

export default async function PetugasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userRole = session?.user?.role || ''
  if (userRole !== 'petugas' && userRole !== 'admin') {
    redirect('/home')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PetugasNavbar session={session} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

