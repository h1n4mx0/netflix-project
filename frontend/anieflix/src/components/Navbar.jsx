import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useContext } from 'react'
import { FaHome, FaCog, FaUpload, FaMoon, FaSun, FaSearch } from 'react-icons/fa'
import { ThemeContext } from '../context/ThemeContext'
import logo from '../assets/anieflix.svg'
import avatar from '../assets/avatar-default.png'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useContext(ThemeContext)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setDropdownOpen(false)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse/search`)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        isScrolled
          ? theme === 'dark'
            ? 'bg-[#0b0c1c]/80 text-white backdrop-blur-md shadow-md'
            : 'bg-white/80 text-gray-900 backdrop-blur-md shadow-md'
          : theme === 'dark'
            ? 'bg-gradient-to-b from-[#0b0c1c] to-transparent text-white backdrop-blur-sm'
            : 'bg-gradient-to-b from-white/30 to-transparent text-gray-900 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
        {/* Logo + Menu */}
        <div className="flex items-center space-x-6">
          <Link to="/">
            <img
              src={logo}
              alt="Anieflix Logo"
              className="w-[92px] h-auto hover:opacity-80 transition"
            />
          </Link>
          {/* 🔍 Search form */}
          <FaSearch onClick={handleSearch} className="text-white text-sm mr-2 mr-5 cursor-pointer" />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 text-white text-sm font-semibold font-sans">
            <Link to="/browse" className="hover:text-gray-400 transition">Trang chủ</Link>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-white text-sm font-semibold font-sans">
            <Link to="/browse" className="hover:text-gray-400 transition">Phim</Link>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-white text-sm font-semibold font-sans">
            <Link to="/browse/shows" className="hover:text-gray-400 transition">Truyền hình</Link>
          </div>
          
          {/* Mobile icon menu */}
          <div className="flex md:hidden items-center space-x-4 text-white text-xl">
            <Link to="/browse" title="Home">
              <FaHome className="hover:text-gray-300 transition" />
            </Link>
          {isLoggedIn && (
            <>
              <Link to="/settings" title="Settings">
                <FaCog className="hover:text-gray-300 transition" />
              </Link>
              <Link to="/admin/upload" title="Upload">
                <FaUpload className="hover:text-gray-300 transition" />
              </Link>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="text-white text-xl hover:text-gray-300 transition md:ml-4"
          title="Toggle theme"
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
      </div>

        {/* Auth / Avatar */}
        <div className="relative" ref={dropdownRef}>
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded font-semibold transition"
            >
              Login
            </Link>
          ) : (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none"
              >
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-md hover:brightness-110 transition"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-[#141414] text-white rounded-md shadow-lg text-sm overflow-hidden z-50">
                  <Link
                    to="/user/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 hover:bg-white/10 transition"
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/user/favorites"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 hover:bg-white/10 transition"
                  >
                    Phim yêu thích
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
