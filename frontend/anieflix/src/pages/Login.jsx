import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  // ✅ Redirect nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/browse')
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/browse')
    } catch (err) {
      alert('Sai tài khoản hoặc mật khẩu')
    }
  }

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden flex items-center justify-center">
      {/* Background ảnh */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-[.4] z-0"
        style={{
          backgroundImage: "url('/images/netflix-cover.jpg')"
        }}
      />

      {/* Form login */}
      <div className="relative z-10 w-full max-w-md bg-black/75 px-8 py-10 rounded-md">
        <h2 className="text-3xl font-bold mb-6">Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#333] text-white p-3 rounded focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#333] text-white p-3 rounded focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition py-3 rounded font-semibold"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center justify-between text-sm text-gray-300 mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-red-600" />
            Remember me
          </label>
          <a href="#" className="hover:underline">Need help?</a>
        </div>

        <div className="text-sm text-gray-400 mt-6">
          New to Anieflix?{' '}
          <span className="text-white hover:underline cursor-pointer">Sign up now</span>
        </div>
      </div>
    </div>
  )
}
