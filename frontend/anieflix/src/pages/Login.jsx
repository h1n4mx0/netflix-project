import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' })

  const navigate = useNavigate()

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
      setSnackbar({
        open: true,
        message: 'Đăng nhập thành công! Đang chuyển hướng...',
        severity: 'success'
      })
      setTimeout(() => navigate('/browse'), 1000)
    } catch (err) {
      const msg = err.response?.data?.error || 'Đăng nhập thất bại'
      setSnackbar({ open: true, message: msg, severity: 'error' })
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
            className="w-full bg-red-600 hover:bg-red-700 transition py-3 rounded font-semibold cursor-pointer :opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </button>
        </form>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <div className="text-sm text-gray-300 mt-4  space-y-1">
  <label className="inline-flex items-center gap-2">
    <input type="checkbox" className="accent-red-600" />
    Remember me
  </label>
  <div className="flex justify-between text-gray-400">
    <a href="#" className="hover:underline mr-3">Need help?</a>
    <span
      className="text-blue-400 hover:underline cursor-pointer"
      onClick={() => navigate('/forgot-password')}
    >
      Forgot password?
    </span>
  </div>
</div>


        <div className="text-sm text-gray-400 mt-6">
          New to Anieflix?{' '}
          <span className="text-white hover:underline cursor-pointer" onClick={() => navigate('/register')}>
            Sign up now
          </span>
        </div>
      </div>
    </div>
  )
}
