import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useContext, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { isTokenExpired } from '../utils/auth'

export default function Layout() {
  const { theme } = useContext(ThemeContext)
  const navigate = useNavigate()

  // Check token expiry on mount and at intervals
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token')
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }
    checkToken()
    const id = setInterval(checkToken, 60000)
    return () => clearInterval(id)
  }, [navigate])

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#0b0c1c] to-[#1e2a48] text-white'
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
