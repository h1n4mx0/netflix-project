import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4c1d95] to-[#0f172a] text-white">
      {/* Navbar cố định trên cùng */}
      <Navbar />

      {/* Phần nội dung chính của mỗi trang */}
      <main className="">
        <Outlet />
      </main>
    </div>
  )
}
