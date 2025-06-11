import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useContext } from 'react'
import { FaHome, FaCog, FaUpload, FaMoon, FaSun, FaSearch, FaTachometerAlt, FaShieldAlt } from 'react-icons/fa'
import { ThemeContext } from '../context/ThemeContext'
import logo from '../assets/anieflix.svg'
import avatar from '../assets/avatar-default.png'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useContext(ThemeContext)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    // Decode JWT token to check user role
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserInfo(payload)
        setIsAdmin(payload.role === 'admin')
      } catch (error) {
        console.error('Error decoding token:', error)
        setIsAdmin(false)
      }
    }

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
    setIsAdmin(false)
    setUserInfo(null)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/browse/search`)
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
          
          {/* Search */}
          <FaSearch onClick={handleSearch} className="text-white text-sm mr-2 mr-5 cursor-pointer" />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 text-white text-sm font-semibold font-sans">
            <Link to="/browse" className="hover:text-gray-400 transition">Trang chủ</Link>
            <Link to="/browse/movies" className="hover:text-gray-400 transition">Phim</Link>
            <Link to="/browse/shows" className="hover:text-gray-400 transition">Truyền hình</Link>
            
            {/* Admin Dashboard Link */}
            {isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-1 hover:text-yellow-400 transition bg-gradient-to-r from-red-500/20 to-orange-500/20 px-3 py-1 rounded-full border border-red-500/30"
              >
                <FaTachometerAlt size={14} />
                Dashboard
              </Link>
            )}
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
                {isAdmin && (
                  <>
                    <Link to="/admin/upload" title="Upload">
                      <FaUpload className="hover:text-gray-300 transition" />
                    </Link>
                    <Link to="/admin/dashboard" title="Admin Dashboard">
                      <FaTachometerAlt className="hover:text-yellow-300 transition" />
                    </Link>
                  </>
                )}
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
                className="focus:outline-none relative"
              >
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-md hover:brightness-110 transition"
                />
                {/* Admin Badge */}
                {isAdmin && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-white">
                    <FaShieldAlt className="w-2 h-2 text-white absolute top-0.5 left-0.5 transform -translate-x-0.5 -translate-y-0.5" />
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-[#141414] text-white rounded-md shadow-lg text-sm overflow-hidden z-50 border border-white/10">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <img src={avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                      <div>
                        <p className="font-medium text-white">{userInfo?.email || 'User'}</p>
                        {isAdmin && (
                          <p className="text-xs text-yellow-400 flex items-center gap-1">
                            <FaShieldAlt size={10} />
                            Administrator
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Section */}
                  {isAdmin && (
                    <>
                      <div className="px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-white/10">
                        <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Admin Tools</p>
                      </div>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition"
                      >
                        <FaTachometerAlt className="text-yellow-400" size={14} />
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/upload"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition"
                      >
                        <FaUpload className="text-yellow-400" size={14} />
                        Upload Content
                      </Link>
                      {/* <Link
                        to="/admin/users"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition"
                      >
                        <FaCog className="text-yellow-400" size={14} />
                        Manage Users
                      </Link> */}
                      <div className="border-b border-white/10"></div>
                    </>
                  )}

                  {/* Regular User Menu */}
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
                    Yêu thích
                  </Link>
                  {/* <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-3 hover:bg-white/10 transition"
                  >
                    Cài đặt
                  </Link> */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-red-500/20 transition text-red-400 border-t border-white/10"
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