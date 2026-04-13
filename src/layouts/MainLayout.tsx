import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
