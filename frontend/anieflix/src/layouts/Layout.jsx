import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Layout() {
  return (

    <div className="bg-gradient-to-br from-yellow-600 to-yellow-900 min-h-screen text-white flex flex-col">

      {/* Navbar cố định trên cùng */}
      <Navbar />

      {/* Phần nội dung chính của mỗi trang */}
      <main className="flex-1 pt-14 container mx-auto px-4 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
