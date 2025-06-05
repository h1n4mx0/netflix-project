import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

export default function Layout() {
  const { theme } = useContext(ThemeContext)

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-yellow-600 to-yellow-900 text-white'
          : 'bg-white text-gray-900'
      }`}
    >

      {/* Navbar cố định trên cùng */}
      <Navbar />

      {/* Phần nội dung chính của mỗi trang */}
      <main className="flex-1 pt-14 container mx-auto px-4 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
